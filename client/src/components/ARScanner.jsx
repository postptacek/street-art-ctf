import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { doc, setDoc, getDoc, serverTimestamp, increment } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useGame } from '../context/GameContext'
import { X, MapPin, ChevronLeft } from 'lucide-react'

// Import A-Frame and MindAR (must be imported in this order)
import 'aframe'
import 'mind-ar/dist/mindar-image-aframe.prod.js'

// Art data mapping (MindAR target index → art info)
const ART_DATA = {
  'art-01': { name: 'Kolbenova 1', area: 'Vysočany', points: 100, hood: 'Vysočany', location: [50.110192, 14.503811] },
  'art-02': { name: 'Kolbenova 2', area: 'Vysočany', points: 50, hood: 'Vysočany', location: [50.110203, 14.503764] },
  'art-03': { name: 'Kolbenova 3', area: 'Vysočany', points: 100, hood: 'Vysočany', location: [50.109847, 14.504250] },
  'art-04': { name: 'Kolbenova 4', area: 'Vysočany', points: 25, hood: 'Vysočany', location: [50.109981, 14.504933] },
  'art-05': { name: 'Kolbenova 5', area: 'Vysočany', points: 200, hood: 'Vysočany', location: [50.109764, 14.505742] },
  'art-06': { name: 'Kolbenova 6', area: 'Vysočany', points: 100, hood: 'Vysočany', location: [50.109672, 14.505847] },
  'art-07': { name: 'Hloubětín 1', area: 'Hloubětín', points: 100, hood: 'Vysočany', location: [50.110383, 14.508192] },
  'art-08': { name: 'Hloubětín 2', area: 'Hloubětín', points: 200, hood: 'Vysočany', location: [50.110508, 14.509567] },
  'art-09': { name: 'Vysočany 1', area: 'Vysočany', points: 100, hood: 'Vysočany', location: [50.110817, 14.505475] },
  'art-10': { name: 'Vysočany 2', area: 'Vysočany', points: 50, hood: 'Vysočany', location: [50.110986, 14.504672] },
}

// Map target index to art ID
const TARGET_TO_ART = {
  0: 'art-01', 1: 'art-02', 2: 'art-03', 3: 'art-04', 4: 'art-05',
  5: 'art-06', 6: 'art-07', 7: 'art-08', 8: 'art-09', 9: 'art-10',
}

const COOLDOWN_MS = 10 * 60 * 1000 // 10 minutes

export default function ARScanner() {
  const navigate = useNavigate()
  const sceneRef = useRef(null)
  const { player } = useGame()
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentArt, setCurrentArt] = useState(null)
  const [canCapture, setCanCapture] = useState(false)
  const [cooldownMsg, setCooldownMsg] = useState(null)
  const [capturing, setCapturing] = useState(false)
  const [captureProgress, setCaptureProgress] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [capturedArt, setCapturedArt] = useState(null)
  
  const holdTimerRef = useRef(null)
  const playerTeam = player?.team || 'red'

  // Check if art can be scanned (cooldown + recapture logic)
  const checkCanScan = useCallback(async (artId) => {
    try {
      // Get capture data from Firebase
      const captureDoc = await getDoc(doc(db, 'streetart-captures', artId))
      const captureData = captureDoc.exists() ? captureDoc.data() : null
      
      // Get user's last scan time from Firebase
      const userScanDoc = await getDoc(doc(db, 'streetart-scans', `${player.id}_${artId}`))
      const lastScan = userScanDoc.exists() ? userScanDoc.data().timestamp?.toMillis() : null
      
      // If captured by enemy, allow recapture
      if (captureData?.capturedBy && captureData.capturedBy !== playerTeam) {
        return { canScan: true, reason: 'recapture' }
      }
      
      // Check cooldown
      if (lastScan) {
        const timeSince = Date.now() - lastScan
        if (timeSince < COOLDOWN_MS) {
          const minsLeft = Math.ceil((COOLDOWN_MS - timeSince) / 60000)
          return { canScan: false, reason: `Wait ${minsLeft}m` }
        }
      }
      
      return { canScan: true, reason: null }
    } catch (err) {
      console.error('Error checking scan status:', err)
      return { canScan: true, reason: null } // Allow on error
    }
  }, [player?.id, playerTeam])

  // Handle target detection
  const handleTargetFound = useCallback(async (targetIndex) => {
    const artId = TARGET_TO_ART[targetIndex]
    if (!artId || !ART_DATA[artId]) return
    
    const art = ART_DATA[artId]
    setCurrentArt({ id: artId, ...art })
    
    // Check if can scan
    const scanCheck = await checkCanScan(artId)
    setCanCapture(scanCheck.canScan)
    setCooldownMsg(scanCheck.canScan ? (scanCheck.reason === 'recapture' ? '⚔️ Recapture!' : null) : scanCheck.reason)
  }, [checkCanScan])

  // Handle target lost
  const handleTargetLost = useCallback(() => {
    setCurrentArt(null)
    setCanCapture(false)
    setCooldownMsg(null)
    setCaptureProgress(0)
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current)
      holdTimerRef.current = null
    }
  }, [])

  // Capture art to Firebase
  const captureArt = useCallback(async () => {
    if (!currentArt || !player) return
    
    try {
      const artId = currentArt.id
      const points = currentArt.points
      
      // Record scan time in Firebase
      await setDoc(doc(db, 'streetart-scans', `${player.id}_${artId}`), {
        timestamp: serverTimestamp(),
        artId,
        playerId: player.id
      })
      
      // Update capture in Firebase
      await setDoc(doc(db, 'streetart-captures', artId), {
        artId,
        capturedBy: playerTeam,
        capturedAt: serverTimestamp(),
        playerId: player.id,
        playerName: player.name,
        points
      })
      
      // Update team score
      await setDoc(doc(db, 'streetart-teams', playerTeam), {
        score: increment(points),
        lastCapture: artId,
        lastCaptureAt: serverTimestamp()
      }, { merge: true })
      
      // Update player score
      await setDoc(doc(db, 'streetart-players', player.id), {
        name: player.name,
        team: playerTeam,
        score: increment(points),
        lastActive: serverTimestamp()
      }, { merge: true })
      
      console.log('🔥 Captured to Firebase:', artId, points)
      
      // Show success
      setCapturedArt({ id: artId, ...currentArt })
      setShowSuccess(true)
      
    } catch (err) {
      console.error('Capture error:', err)
      setError('Failed to capture. Try again.')
    }
  }, [currentArt, player, playerTeam])

  // Hold to capture handlers
  const startHold = useCallback(() => {
    if (!canCapture || !currentArt) return
    
    setCapturing(true)
    setCaptureProgress(0)
    
    holdTimerRef.current = setInterval(() => {
      setCaptureProgress(prev => {
        if (prev >= 100) {
          clearInterval(holdTimerRef.current)
          holdTimerRef.current = null
          setCapturing(false)
          captureArt()
          return 100
        }
        return prev + 2
      })
    }, 20)
  }, [canCapture, currentArt, captureArt])

  const endHold = useCallback(() => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current)
      holdTimerRef.current = null
    }
    setCapturing(false)
    setCaptureProgress(0)
  }, [])

  // Initialize MindAR scene
  useEffect(() => {
    const sceneEl = sceneRef.current
    if (!sceneEl) return

    const handleLoaded = () => {
      // Create target entities
      for (let i = 0; i < Object.keys(TARGET_TO_ART).length; i++) {
        const entity = document.createElement('a-entity')
        entity.setAttribute('mindar-image-target', `targetIndex: ${i}`)
        entity.setAttribute('data-target-index', i.toString())
        
        entity.addEventListener('targetFound', () => handleTargetFound(i))
        entity.addEventListener('targetLost', handleTargetLost)
        
        sceneEl.appendChild(entity)
      }
    }

    const handleArReady = () => {
      setIsLoading(false)
    }

    const handleArError = () => {
      setError('Camera access required')
      setIsLoading(false)
    }

    sceneEl.addEventListener('loaded', handleLoaded)
    sceneEl.addEventListener('arReady', handleArReady)
    sceneEl.addEventListener('arError', handleArError)

    return () => {
      sceneEl.removeEventListener('loaded', handleLoaded)
      sceneEl.removeEventListener('arReady', handleArReady)
      sceneEl.removeEventListener('arError', handleArError)
      
      // Cleanup MindAR
      const arSystem = sceneEl.systems?.['mindar-image-system']
      if (arSystem) {
        arSystem.stop()
      }
    }
  }, [handleTargetFound, handleTargetLost])

  // View on map handler
  const viewOnMap = () => {
    if (capturedArt) {
      localStorage.setItem('streetart-ctf-lastCapture', JSON.stringify({
        artId: capturedArt.id,
        location: capturedArt.location,
        team: playerTeam
      }))
    }
    navigate('/map')
  }

  const teamColor = playerTeam === 'red' ? '#ff6b6b' : '#4dabf7'

  return (
    <div className="fixed inset-0 bg-black">
      {/* A-Frame Scene */}
      <a-scene
        ref={sceneRef}
        mindar-image="imageTargetSrc: https://raw.githubusercontent.com/postptacek/street-art-ctf/main/client/targets.mind; maxTrack: 1; filterMinCF: 0.0001; filterBeta: 1000;"
        color-space="sRGB"
        renderer="colorManagement: true"
        vr-mode-ui="enabled: false"
        device-orientation-permission-ui="enabled: false"
        embedded
        style={{ width: '100%', height: '100%' }}
      >
        <a-camera position="0 0 0" look-controls="enabled: false" />
      </a-scene>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between pointer-events-auto"
             style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
            <ChevronLeft size={24} className="text-white" />
          </button>
          
          <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-black/50 backdrop-blur">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: teamColor }} />
            <span className="text-white text-sm font-medium capitalize">{playerTeam}</span>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white">Loading AR Scanner...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-white mb-4">{error}</p>
              <button onClick={() => window.location.reload()} className="px-6 py-3 bg-white text-black rounded-xl font-bold">
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Target Info */}
        <AnimatePresence>
          {currentArt && !showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-24 left-4 right-4"
            >
              <div className="bg-black/70 backdrop-blur-xl rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-bold text-lg">{currentArt.name}</p>
                  <p className="text-white/60 text-sm">{currentArt.area} • {currentArt.hood}</p>
                </div>
                <div className={`px-4 py-2 rounded-xl font-bold text-lg ${canCapture ? 'bg-green-500' : 'bg-amber-500'}`}>
                  {canCapture ? `+${currentArt.points}` : '⏱️'}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scanning hint */}
        {!currentArt && !isLoading && !error && (
          <div className="absolute bottom-40 left-0 right-0 text-center">
            <p className="text-white/70 text-sm">Point camera at street art to scan</p>
          </div>
        )}

        {/* Capture status */}
        {currentArt && !showSuccess && (
          <div className="absolute bottom-40 left-0 right-0 text-center">
            <p className={`text-sm font-medium ${canCapture ? 'text-green-400' : 'text-amber-400'}`}>
              {cooldownMsg || (canCapture ? 'Hold to capture!' : 'Searching...')}
            </p>
          </div>
        )}

        {/* Capture button */}
        {!showSuccess && (
          <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-auto"
               style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}>
            <div className="relative">
              <svg width="96" height="96" viewBox="0 0 96 96" className="absolute top-0 left-0">
                <circle cx="48" cy="48" r="45" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
                <circle 
                  cx="48" cy="48" r="45" fill="none" 
                  stroke={canCapture ? '#22c55e' : 'rgba(255,255,255,0.3)'} 
                  strokeWidth="4"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * captureProgress / 100)}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.05s' }}
                />
              </svg>
              <button
                onTouchStart={startHold}
                onTouchEnd={endHold}
                onMouseDown={startHold}
                onMouseUp={endHold}
                onMouseLeave={endHold}
                disabled={!canCapture}
                className={`w-20 h-20 m-2 rounded-full text-3xl flex items-center justify-center transition-all ${
                  canCapture 
                    ? 'bg-white/20 active:bg-white/40' 
                    : 'bg-white/10 opacity-50'
                }`}
              >
                📷
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Success overlay */}
      <AnimatePresence>
        {showSuccess && capturedArt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mb-6"
            >
              <span className="text-4xl">✓</span>
            </motion.div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Captured!</h2>
            <p className="text-white/60 mb-6">{capturedArt.name}</p>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="text-5xl font-bold mb-8"
              style={{ color: teamColor }}
            >
              +{capturedArt.points}
            </motion.div>
            
            <div className="w-full max-w-xs space-y-3">
              <button
                onClick={viewOnMap}
                className="w-full py-4 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-2"
              >
                <MapPin size={20} />
                View on Map
              </button>
              <button
                onClick={() => setShowSuccess(false)}
                className="w-full py-4 rounded-2xl bg-white/10 text-white font-bold"
              >
                📷 Scan More Art
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
