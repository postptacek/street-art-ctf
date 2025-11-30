import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { doc, setDoc, onSnapshot, collection, getDocs } from 'firebase/firestore'
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import { db, auth } from '../config/firebase'
import { ART_POINTS, TEAMS, getPointValue, calculateTeamScores } from '../data/pragueMap'

const GameContext = createContext(null)

// Storage keys (for local backup)
const STORAGE_KEYS = {
  player: 'streetart-ctf-player',
  captures: 'streetart-ctf-captures'
}

// Firestore collections (matching ar-scanner.html)
const CAPTURES_COLLECTION = 'streetart-captures'
const PLAYERS_COLLECTION = 'streetart-players'
const TEAMS_COLLECTION = 'streetart-teams'

// Team colors
export const TEAM_COLORS = {
  red: { hex: '#ff6b6b', rgb: [1, 0.42, 0.42] },
  blue: { hex: '#4dabf7', rgb: [0.30, 0.67, 0.97] },
  neutral: { hex: '#495057', rgb: [0.29, 0.31, 0.34] }
}

// Load from localStorage
function loadFromStorage(key, defaultValue) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch {
    return defaultValue
  }
}

// Save to localStorage
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.warn('Failed to save to localStorage:', e)
  }
}

export function GameProvider({ children }) {
  // Firebase auth state
  const [firebaseUser, setFirebaseUser] = useState(null)
  const [isOnline, setIsOnline] = useState(true)
  
  // Player state - persisted with game stats
  const [player, setPlayer] = useState(() => loadFromStorage(STORAGE_KEYS.player, {
    id: `player-${Date.now()}`,
    name: 'Street Artist',
    team: null,
    score: 0,
    capturedArt: [],
    // Game stats
    streak: 0,
    maxStreak: 0,
    totalDistance: 0,
    lastCaptureTime: null,
    lastCaptureLocation: null,
    captureCount: 0,
    recaptureCount: 0,
    firstCaptureCount: 0
  }))
  
  // Art points state - merged with real data
  const [artPoints, setArtPoints] = useState(() => {
    const savedCaptures = loadFromStorage(STORAGE_KEYS.captures, {})
    return ART_POINTS.map(point => ({
      ...point,
      capturedBy: savedCaptures[point.id] || null
    }))
  })
  
  // Scan state
  const [scanResult, setScanResult] = useState(null)
  const [isScanning, setIsScanning] = useState(false)
  const [pendingCapture, setPendingCapture] = useState(null)

  // Initialize Firebase Auth (optional - works without it)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFirebaseUser(user)
        setPlayer(prev => ({ ...prev, id: user.uid }))
      } else {
        // Try anonymous auth, but don't block if it fails
        signInAnonymously(auth).catch(err => {
          console.log('Auth not available, using local mode')
        })
      }
    })
    return () => unsubscribe()
  }, [])

  // Capture notifications and recent captures feed
  const [captureNotification, setCaptureNotification] = useState(null)
  const [recentCaptures, setRecentCaptures] = useState([])
  const prevCapturesRef = useRef({})
  
  // Subscribe to captures collection (real-time sync) - works without auth
  useEffect(() => {
    let isFirstLoad = true
    
    // Listen to all captures
    const capturesRef = collection(db, CAPTURES_COLLECTION)
    const unsubscribe = onSnapshot(capturesRef, (snapshot) => {
      const firebaseCaptures = {}
      const allCaptures = []
      
      snapshot.forEach(doc => {
        const data = doc.data()
        if (data.capturedBy) {
          firebaseCaptures[doc.id] = data.capturedBy
          const artPoint = ART_POINTS.find(p => p.id === doc.id)
          allCaptures.push({
            id: doc.id,
            artName: artPoint?.name || doc.id,
            area: artPoint?.area || 'Unknown',
            team: data.capturedBy,
            playerName: data.playerName || 'Unknown',
            capturedAt: data.capturedAt?.toDate?.() || new Date(),
            points: data.points || 100,
            isRecapture: data.isRecapture || false
          })
        }
      })
      
      // Sort by date and keep last 10
      const sorted = allCaptures.sort((a, b) => b.capturedAt - a.capturedAt).slice(0, 10)
      setRecentCaptures(sorted)
      
      // Check for new captures (not on first load)
      if (!isFirstLoad) {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added' || change.type === 'modified') {
            const data = change.doc.data()
            const prevOwner = prevCapturesRef.current[change.doc.id]
            
            // Show notification if territory changed hands
            if (data.capturedBy && prevOwner !== data.capturedBy) {
              const artPoint = ART_POINTS.find(p => p.id === change.doc.id)
              if (artPoint) {
                setCaptureNotification({
                  artName: artPoint.name,
                  team: data.capturedBy,
                  playerName: data.playerName || 'Someone',
                  points: data.points || getPointValue(artPoint),
                  streak: data.streak || 0,
                  isRecapture: data.isRecapture || !!prevOwner,
                  timestamp: Date.now()
                })
                // Auto-hide after 4 seconds
                setTimeout(() => setCaptureNotification(null), 4000)
              }
            }
          }
        })
      }
      
      isFirstLoad = false
      prevCapturesRef.current = firebaseCaptures
      
      // Merge Firebase captures with local art points
      setArtPoints(ART_POINTS.map(point => ({
        ...point,
        capturedBy: firebaseCaptures[point.id] || null
      })))
      
      // Also save to localStorage as backup
      saveToStorage(STORAGE_KEYS.captures, firebaseCaptures)
      setIsOnline(true)
      
      console.log('Firebase: Synced', Object.keys(firebaseCaptures).length, 'captures')
    }, (error) => {
      console.warn('Firestore sync error:', error)
      setIsOnline(false)
    })
    
    return () => unsubscribe()
  }, [])
  
  // Subscribe to team scores
  const [globalTeamScores, setGlobalTeamScores] = useState({ red: 0, blue: 0 })
  
  useEffect(() => {
    const teamsRef = collection(db, TEAMS_COLLECTION)
    const unsubscribe = onSnapshot(teamsRef, (snapshot) => {
      const scores = { red: 0, blue: 0 }
      snapshot.forEach(doc => {
        const data = doc.data()
        if (doc.id === 'red' || doc.id === 'blue') {
          scores[doc.id] = data.score || 0
        }
      })
      setGlobalTeamScores(scores)
      console.log('Team scores:', scores)
    })
    
    return () => unsubscribe()
  }, [])
  
  // Subscribe to all players for leaderboard
  const [allPlayers, setAllPlayers] = useState([])
  
  useEffect(() => {
    const playersRef = collection(db, PLAYERS_COLLECTION)
    const unsubscribe = onSnapshot(playersRef, (snapshot) => {
      const players = []
      snapshot.forEach(doc => {
        const data = doc.data()
        if (data.name && data.team) {
          players.push({
            id: doc.id,
            name: data.name,
            team: data.team,
            score: data.score || 0,
            captures: data.captures || 0
          })
        }
      })
      setAllPlayers(players.sort((a, b) => b.score - a.score))
      console.log('Players loaded:', players.length)
    })
    
    return () => unsubscribe()
  }, [])

  // Persist player changes locally
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.player, player)
  }, [player])

  // Sync a single capture to Firebase with full details
  const syncCaptureToFirebase = useCallback(async (artId, captureData) => {
    if (!isOnline) return
    try {
      await setDoc(doc(db, CAPTURES_COLLECTION, artId), {
        artId,
        capturedBy: captureData.team,
        capturedAt: new Date(),
        playerId: player.id,
        playerName: player.name,
        points: captureData.points,
        streak: captureData.streak,
        isFirstCapture: captureData.isFirstCapture,
        isRecapture: captureData.isRecapture
      })
    } catch (err) {
      console.warn('Failed to sync capture to Firebase:', err)
    }
  }, [isOnline, player.id, player.name])

  // Legacy sync for backwards compatibility
  const syncCapturesToFirebase = useCallback(async (captures) => {
    if (!isOnline) return
    try {
      await setDoc(doc(db, CAPTURES_COLLECTION, 'global'), captures, { merge: true })
    } catch (err) {
      console.warn('Failed to sync to Firebase:', err)
    }
  }, [isOnline])

  // Calculate team scores - use Firebase global scores if available, otherwise calculate from art points
  const calculatedScores = calculateTeamScores(artPoints)
  const teamScores = {
    red: Math.max(globalTeamScores.red, calculatedScores.red),
    blue: Math.max(globalTeamScores.blue, calculatedScores.blue)
  }

  // Join a team
  const joinTeam = useCallback((teamColor) => {
    if (!TEAMS.includes(teamColor)) return
    setPlayer(prev => ({ ...prev, team: teamColor }))
  }, [])
  
  // Set player name
  const setPlayerName = useCallback((name) => {
    setPlayer(prev => ({ ...prev, name }))
  }, [])

  // Find nearest art point to a location
  const findNearestArt = useCallback((lat, lng, maxDistanceMeters = 50) => {
    let nearest = null
    let minDist = Infinity
    
    artPoints.forEach(point => {
      // Haversine-ish distance in meters (approximate)
      const dLat = (point.location[0] - lat) * 111000
      const dLng = (point.location[1] - lng) * 111000 * Math.cos(lat * Math.PI / 180)
      const dist = Math.sqrt(dLat * dLat + dLng * dLng)
      
      if (dist < minDist && dist <= maxDistanceMeters) {
        minDist = dist
        nearest = { ...point, distance: Math.round(dist) }
      }
    })
    
    return nearest
  }, [artPoints])

  // Calculate distance between two GPS coordinates in meters
  const calculateDistance = useCallback((lat1, lng1, lat2, lng2) => {
    const dLat = (lat2 - lat1) * 111000
    const dLng = (lng2 - lng1) * 111000 * Math.cos(lat1 * Math.PI / 180)
    return Math.sqrt(dLat * dLat + dLng * dLng)
  }, [])

  // Calculate all score bonuses
  const calculateScoreWithBonuses = useCallback((art, playerState, location = null) => {
    const basePoints = getPointValue(art)
    const bonuses = []
    let totalPoints = basePoints
    
    const isRecapture = art.capturedBy && art.capturedBy !== playerState.team
    const isFirstCapture = !art.capturedBy
    const now = Date.now()
    const timeSinceLastCapture = playerState.lastCaptureTime 
      ? (now - playerState.lastCaptureTime) / 1000 / 60 // minutes
      : Infinity
    
    // 1. Streak Bonus: +10% per streak level, max +100%
    const currentStreak = playerState.streak || 0
    if (currentStreak > 0) {
      const streakMultiplier = Math.min(currentStreak * 0.1, 1.0)
      const streakBonus = Math.round(basePoints * streakMultiplier)
      if (streakBonus > 0) {
        totalPoints += streakBonus
        bonuses.push({ type: 'streak', label: `🔥 ${currentStreak}x Streak`, points: streakBonus })
      }
    }
    
    // 2. Recapture Bonus: +50% for stealing from enemy
    if (isRecapture) {
      const recaptureBonus = Math.round(basePoints * 0.5)
      totalPoints += recaptureBonus
      bonuses.push({ type: 'recapture', label: '⚔️ Recapture', points: recaptureBonus })
    }
    
    // 3. First Capture Bonus: +25% for virgin territory
    if (isFirstCapture) {
      const firstBonus = Math.round(basePoints * 0.25)
      totalPoints += firstBonus
      bonuses.push({ type: 'first', label: '🏴 First Capture', points: firstBonus })
    }
    
    // 4. Speed Bonus: +20% if captured within 5 minutes of last capture
    if (timeSinceLastCapture < 5) {
      const speedBonus = Math.round(basePoints * 0.2)
      totalPoints += speedBonus
      bonuses.push({ type: 'speed', label: '⚡ Speed Bonus', points: speedBonus })
    }
    
    // 5. Distance Bonus: +5pts per 100m walked from last capture (max +50)
    if (location && playerState.lastCaptureLocation) {
      const distance = calculateDistance(
        playerState.lastCaptureLocation[0], playerState.lastCaptureLocation[1],
        location[0], location[1]
      )
      if (distance > 50) { // Minimum 50m to count
        const distanceBonus = Math.min(Math.round(distance / 100) * 5, 50)
        if (distanceBonus > 0) {
          totalPoints += distanceBonus
          bonuses.push({ type: 'distance', label: `🚶 ${Math.round(distance)}m walked`, points: distanceBonus })
        }
      }
    }
    
    return { basePoints, totalPoints, bonuses, isRecapture, isFirstCapture }
  }, [calculateDistance])

  // Capture art point with enhanced scoring
  const captureArt = useCallback((artId, location = null) => {
    if (!player.team) return { success: false, message: 'Join a team first!' }
    
    const art = artPoints.find(a => a.id === artId)
    if (!art) return { success: false, message: 'Art not found' }
    if (art.capturedBy === player.team) return { success: false, message: 'Already yours!' }
    if (art.status === 'ghost') return { success: false, message: 'This art no longer exists' }
    
    // Calculate score with all bonuses
    const captureLocation = location || art.location
    const scoreResult = calculateScoreWithBonuses(art, player, captureLocation)
    const previousTeam = art.capturedBy
    
    // Update art points locally
    setArtPoints(prev => prev.map(a => 
      a.id === artId ? { ...a, capturedBy: player.team } : a
    ))
    
    // Update player with new stats
    const newStreak = player.streak + 1
    setPlayer(prev => ({
      ...prev,
      score: prev.score + scoreResult.totalPoints,
      capturedArt: [...prev.capturedArt.filter(id => id !== artId), artId],
      streak: newStreak,
      maxStreak: Math.max(prev.maxStreak, newStreak),
      lastCaptureTime: Date.now(),
      lastCaptureLocation: captureLocation,
      captureCount: prev.captureCount + 1,
      recaptureCount: scoreResult.isRecapture ? prev.recaptureCount + 1 : prev.recaptureCount,
      firstCaptureCount: scoreResult.isFirstCapture ? prev.firstCaptureCount + 1 : prev.firstCaptureCount,
      totalDistance: prev.totalDistance + (location && prev.lastCaptureLocation 
        ? calculateDistance(prev.lastCaptureLocation[0], prev.lastCaptureLocation[1], location[0], location[1])
        : 0)
    }))
    
    // Sync to Firebase with full details
    syncCaptureToFirebase(artId, {
      team: player.team,
      points: scoreResult.totalPoints,
      streak: newStreak,
      isFirstCapture: scoreResult.isFirstCapture,
      isRecapture: scoreResult.isRecapture
    })
    
    // Save locally as backup
    const currentCaptures = loadFromStorage(STORAGE_KEYS.captures, {})
    saveToStorage(STORAGE_KEYS.captures, { ...currentCaptures, [artId]: player.team })
    
    return { 
      success: true, 
      art, 
      points: scoreResult.totalPoints,
      basePoints: scoreResult.basePoints,
      bonuses: scoreResult.bonuses,
      streak: newStreak,
      previousTeam,
      message: previousTeam ? `Stolen from ${previousTeam}!` : 'Captured!'
    }
  }, [player, artPoints, syncCaptureToFirebase, calculateScoreWithBonuses, calculateDistance])
  // Start capture flow - user takes photo, we verify location
  const startCapture = useCallback(async (photoData, location) => {
    setIsScanning(true)
    
    // Find nearest art to user's location
    const nearestArt = findNearestArt(location.lat, location.lng, 100) // 100m radius
    
    if (!nearestArt) {
      setIsScanning(false)
      setScanResult({ success: false, message: 'No street art nearby. Get closer!' })
      return
    }
    
    // Set pending capture for confirmation
    setPendingCapture({
      art: nearestArt,
      photo: photoData,
      location
    })
    
    setIsScanning(false)
  }, [findNearestArt])

  // Confirm capture after photo verification
  const confirmCapture = useCallback(() => {
    if (!pendingCapture) return
    
    const result = captureArt(pendingCapture.art.id)
    setScanResult(result)
    setPendingCapture(null)
  }, [pendingCapture, captureArt])

  // Cancel pending capture
  const cancelCapture = useCallback(() => {
    setPendingCapture(null)
    setScanResult(null)
  }, [])

  // Reset all data (for testing)
  const resetAll = useCallback(async () => {
    localStorage.removeItem(STORAGE_KEYS.player)
    localStorage.removeItem(STORAGE_KEYS.captures)
    
    // Reset Firebase captures
    if (firebaseUser && isOnline) {
      try {
        await setDoc(doc(db, CAPTURES_COLLECTION, 'global'), {})
      } catch (err) {
        console.warn('Failed to reset Firebase:', err)
      }
    }
    
    setPlayer({
      id: firebaseUser?.uid || `player-${Date.now()}`,
      name: 'Street Artist',
      team: null,
      score: 0,
      capturedArt: []
    })
    setArtPoints(ART_POINTS.map(p => ({ ...p, capturedBy: null })))
    setScanResult(null)
    setPendingCapture(null)
  }, [firebaseUser, isOnline])

  const value = {
    // State
    player,
    artPoints,
    teamScores,
    globalTeamScores,
    allPlayers,
    recentCaptures,
    captureNotification,
    scanResult,
    isScanning,
    pendingCapture,
    isOnline,
    teams: TEAMS,
    
    // Actions
    joinTeam,
    setPlayerName,
    captureArt,
    startCapture,
    confirmCapture,
    cancelCapture,
    findNearestArt,
    setScanResult,
    resetAll,
    
    // Helpers
    TEAM_COLORS
  }

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
