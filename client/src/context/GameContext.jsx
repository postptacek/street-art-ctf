import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { ART_POINTS, TEAMS, getPointValue, calculateTeamScores } from '../data/pragueMap'

const GameContext = createContext(null)

// Storage keys
const STORAGE_KEYS = {
  player: 'streetart-ctf-player',
  artPoints: 'streetart-ctf-artpoints',
  captures: 'streetart-ctf-captures'
}

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
  // Player state - persisted
  const [player, setPlayer] = useState(() => loadFromStorage(STORAGE_KEYS.player, {
    id: `player-${Date.now()}`,
    name: 'Street Artist',
    team: null,
    score: 0,
    capturedArt: []
  }))
  
  // Art points state - merged with real data
  const [artPoints, setArtPoints] = useState(() => {
    const savedCaptures = loadFromStorage(STORAGE_KEYS.captures, {})
    // Apply saved captures to base data
    return ART_POINTS.map(point => ({
      ...point,
      capturedBy: savedCaptures[point.id] || null
    }))
  })
  
  // Scan state
  const [scanResult, setScanResult] = useState(null)
  const [isScanning, setIsScanning] = useState(false)
  const [pendingCapture, setPendingCapture] = useState(null)

  // Persist player changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.player, player)
  }, [player])

  // Persist art captures
  useEffect(() => {
    const captures = {}
    artPoints.forEach(p => {
      if (p.capturedBy) captures[p.id] = p.capturedBy
    })
    saveToStorage(STORAGE_KEYS.captures, captures)
  }, [artPoints])

  // Calculate team scores from art points
  const teamScores = calculateTeamScores(artPoints)

  // Join a team
  const joinTeam = useCallback((teamColor) => {
    if (!TEAMS.includes(teamColor)) return
    setPlayer(prev => ({ ...prev, team: teamColor }))
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

  // Capture art point
  const captureArt = useCallback((artId) => {
    if (!player.team) return { success: false, message: 'Join a team first!' }
    
    const art = artPoints.find(a => a.id === artId)
    if (!art) return { success: false, message: 'Art not found' }
    if (art.capturedBy === player.team) return { success: false, message: 'Already yours!' }
    if (art.status === 'ghost') return { success: false, message: 'This art no longer exists' }
    
    const points = getPointValue(art)
    const previousTeam = art.capturedBy
    
    // Update art points
    setArtPoints(prev => prev.map(a => 
      a.id === artId ? { ...a, capturedBy: player.team } : a
    ))
    
    // Update player
    setPlayer(prev => ({
      ...prev,
      score: prev.score + points,
      capturedArt: [...prev.capturedArt.filter(id => id !== artId), artId]
    }))
    
    return { 
      success: true, 
      art, 
      points,
      previousTeam,
      message: previousTeam ? `Stolen from ${previousTeam}!` : 'Captured!'
    }
  }, [player.team, artPoints])

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
  const resetAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.player)
    localStorage.removeItem(STORAGE_KEYS.captures)
    setPlayer({
      id: `player-${Date.now()}`,
      name: 'Street Artist',
      team: null,
      score: 0,
      capturedArt: []
    })
    setArtPoints(ART_POINTS.map(p => ({ ...p, capturedBy: null })))
    setScanResult(null)
    setPendingCapture(null)
  }, [])

  const value = {
    // State
    player,
    artPoints,
    teamScores,
    scanResult,
    isScanning,
    pendingCapture,
    teams: TEAMS,
    
    // Actions
    joinTeam,
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
