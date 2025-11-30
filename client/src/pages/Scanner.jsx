import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame, TEAM_COLORS } from '../context/GameContext'
import { getPointValue } from '../data/pragueMap'
import { Camera, X, Check, AlertCircle, Zap, MapPin, Navigation, Loader2, Target, Image, Share2, Crosshair } from 'lucide-react'

// Alignment viewfinder corners
function ViewfinderCorner({ position, isAligned }) {
  const positions = {
    'top-left': 'top-0 left-0 border-t-4 border-l-4 rounded-tl-lg',
    'top-right': 'top-0 right-0 border-t-4 border-r-4 rounded-tr-lg',
    'bottom-left': 'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-lg',
    'bottom-right': 'bottom-0 right-0 border-b-4 border-r-4 rounded-br-lg'
  }
  
  return (
    <motion.div
      className={`absolute w-8 h-8 ${positions[position]}`}
      animate={{ 
        borderColor: isAligned ? '#22c55e' : 'rgba(255,255,255,0.6)',
        scale: isAligned ? 1.1 : 1
      }}
      transition={{ duration: 0.2 }}
    />
  )
}

// Capture success screen with share options
function CaptureSuccess({ result, photo, teamColor, onClose, onShare }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black flex flex-col z-30"
    >
      {/* Photo */}
      <div className="flex-1 relative">
        <img src={photo} alt="Captured" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
        
        {/* Success badge */}
        <motion.div 
          className="absolute top-8 left-1/2 -translate-x-1/2"
          initial={{ scale: 0, y: -50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', delay: 0.2 }}
        >
          <div className="bg-emerald-500 px-6 py-2 rounded-full flex items-center gap-2">
            <Check size={20} strokeWidth={3} />
            <span className="font-bold">CAPTURED!</span>
          </div>
        </motion.div>
        
        {/* Points badge */}
        <motion.div 
          className="absolute top-20 left-1/2 -translate-x-1/2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.4 }}
        >
          <div 
            className="px-8 py-3 rounded-2xl text-3xl font-black flex items-center gap-2"
            style={{ backgroundColor: teamColor }}
          >
            <Zap size={28} />
            +{result.points}
          </div>
        </motion.div>
      </div>
      
      {/* Info panel */}
      <motion.div 
        className="p-6 space-y-4"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">{result.art?.name}</h2>
          <p className="text-white/50">{result.art?.area} • Added to your gallery</p>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3">
          <motion.button
            onClick={onShare}
            className="flex-1 py-4 rounded-2xl font-semibold bg-white/10 border border-white/10 flex items-center justify-center gap-2"
            whileTap={{ scale: 0.98 }}
          >
            <Share2 size={20} />
            Share
          </motion.button>
          <motion.button
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl font-semibold text-black bg-white flex items-center justify-center gap-2"
            whileTap={{ scale: 0.98 }}
          >
            <Check size={20} />
            Done
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Instructions overlay
function Instructions({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/95 z-40 flex flex-col p-6"
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-8"
        >
          <Target size={48} />
        </motion.div>
        
        <h1 className="text-3xl font-bold mb-4">How to Flash</h1>
        
        <div className="space-y-6 max-w-xs">
          <div className="flex items-start gap-4 text-left">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <span className="font-bold">1</span>
            </div>
            <p className="text-white/70">Find street art on the map and get within <span className="text-emerald-400 font-medium">100m</span></p>
          </div>
          
          <div className="flex items-start gap-4 text-left">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <span className="font-bold">2</span>
            </div>
            <p className="text-white/70">Align the artwork inside the <span className="text-emerald-400 font-medium">viewfinder frame</span></p>
          </div>
          
          <div className="flex items-start gap-4 text-left">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <span className="font-bold">3</span>
            </div>
            <p className="text-white/70">Corners turn <span className="text-emerald-400 font-medium">green</span> when aligned - tap to capture!</p>
          </div>
        </div>
        
        <div className="mt-8 flex gap-4">
          <div className="text-center">
            <div className="w-20 h-20 border-2 border-white/30 rounded-lg mb-2 flex items-center justify-center">
              <span className="text-3xl">🎨</span>
            </div>
            <p className="text-xs text-red-400">BAD</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 border-2 border-emerald-500 rounded-lg mb-2 flex items-center justify-center">
              <span className="text-3xl">🎨</span>
            </div>
            <p className="text-xs text-emerald-400">GOOD</p>
          </div>
        </div>
      </div>
      
      <motion.button
        onClick={onClose}
        className="w-full py-4 rounded-2xl font-bold bg-white text-black"
        whileTap={{ scale: 0.98 }}
      >
        Got it!
      </motion.button>
    </motion.div>
  )
}

function Scanner() {
  const { 
    player, 
    artPoints,
    pendingCapture, 
    scanResult, 
    isScanning,
    startCapture,
    confirmCapture,
    cancelCapture,
    setScanResult,
    findNearestArt,
    captureArt
  } = useGame()
  
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [location, setLocation] = useState(null)
  const [locationStatus, setLocationStatus] = useState('loading')
  const [nearbyArt, setNearbyArt] = useState(null)
  const [isAligned, setIsAligned] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState(null)
  const [captureResult, setCaptureResult] = useState(null)
  const [holdProgress, setHoldProgress] = useState(0)
  const [devMode, setDevMode] = useState(true) // Dev mode: bypass GPS
  
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const canvasRef = useRef(null)
  const holdTimerRef = useRef(null)

  const teamColor = player.team ? TEAM_COLORS[player.team].hex : '#22c55e'
  
  // Check if first time (show instructions)
  useEffect(() => {
    const hasSeenInstructions = localStorage.getItem('scanner-instructions-seen')
    if (!hasSeenInstructions && player.team) {
      setShowInstructions(true)
    }
  }, [player.team])
  
  const dismissInstructions = () => {
    localStorage.setItem('scanner-instructions-seen', 'true')
    setShowInstructions(false)
  }

  // Get user location or use dev mode
  useEffect(() => {
    // Dev mode: pick a random art point to capture
    if (devMode && artPoints) {
      const uncaptured = artPoints.filter(p => !p.capturedBy && p.status === 'active')
      if (uncaptured.length > 0) {
        const randomArt = uncaptured[Math.floor(Math.random() * uncaptured.length)]
        setNearbyArt({ ...randomArt, distance: 10 })
      }
      setLocationStatus('success')
      setLocation({ lat: 50.1, lng: 14.5 })
      return
    }
    
    if (!navigator.geolocation) {
      setLocationStatus('error')
      return
    }
    
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setLocation(loc)
        setLocationStatus('success')
        
        // Check for nearby art
        const nearest = findNearestArt(loc.lat, loc.lng, 200)
        setNearbyArt(nearest)
      },
      (err) => {
        console.error('Location error:', err)
        setLocationStatus('error')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    )
    
    return () => navigator.geolocation.clearWatch(watchId)
  }, [findNearestArt, devMode, artPoints])

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setCameraActive(true)
        setCameraError(null)
      }
    } catch (err) {
      console.error('Camera error:', err)
      setCameraError('Camera access denied')
    }
  }, [])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }, [])

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [startCamera, stopCamera])

  // Simulate alignment based on device stability (for now, use touch hold)
  const startHold = useCallback(() => {
    if (!nearbyArt || holdTimerRef.current) return
    
    let progress = 0
    holdTimerRef.current = setInterval(() => {
      progress += 5
      setHoldProgress(progress)
      
      if (progress >= 25) setIsAligned(true)
      
      if (progress >= 100) {
        clearInterval(holdTimerRef.current)
        holdTimerRef.current = null
        
        // Capture!
        const video = videoRef.current
        const canvas = canvasRef.current
        if (video && canvas) {
          canvas.width = video.videoWidth || 640
          canvas.height = video.videoHeight || 480
          const ctx = canvas.getContext('2d')
          ctx.drawImage(video, 0, 0)
          const photoData = canvas.toDataURL('image/jpeg', 0.9)
          
          setCapturedPhoto(photoData)
          const result = captureArt(nearbyArt.id)
          setCaptureResult({ ...result, art: nearbyArt })
        }
        
        setHoldProgress(0)
        setIsAligned(false)
      }
    }, 50)
  }, [nearbyArt, captureArt])
  
  const endHold = useCallback(() => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current)
      holdTimerRef.current = null
    }
    setHoldProgress(0)
    setIsAligned(false)
  }, [])
  
  // Cleanup hold timer
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        clearInterval(holdTimerRef.current)
      }
    }
  }, [])

  // Close success and reset
  const handleCloseSuccess = () => {
    setCapturedPhoto(null)
    setCaptureResult(null)
  }
  
  const handleShare = async () => {
    if (capturedPhoto && navigator.share) {
      try {
        const blob = await fetch(capturedPhoto).then(r => r.blob())
        const file = new File([blob], 'street-art.jpg', { type: 'image/jpeg' })
        await navigator.share({
          title: `Captured: ${captureResult?.art?.name}`,
          text: `I captured ${captureResult?.art?.name} in Street Art CTF!`,
          files: [file]
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    }
  }

  // No team selected
  if (!player.team) {
    return (
      <motion.div 
        className="flex-1 flex items-center justify-center p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={36} className="text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-white">Join a Team First</h2>
          <p className="text-white/40 text-sm max-w-xs">Select your team from the home screen to start capturing street art</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className="flex-1 relative bg-black overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Camera error */}
      {cameraError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-black">
          <Camera size={48} className="text-white/20 mb-4" />
          <p className="text-white/50">{cameraError}</p>
        </div>
      )}
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70 pointer-events-none" />
      
      {/* Viewfinder frame */}
      {!capturedPhoto && nearbyArt && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-72 h-72">
            <ViewfinderCorner position="top-left" isAligned={isAligned} />
            <ViewfinderCorner position="top-right" isAligned={isAligned} />
            <ViewfinderCorner position="bottom-left" isAligned={isAligned} />
            <ViewfinderCorner position="bottom-right" isAligned={isAligned} />
            
            {/* Center crosshair */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ opacity: isAligned ? 0 : 0.3 }}
                className="w-8 h-8"
              >
                <Crosshair size={32} className="text-white" />
              </motion.div>
            </div>
            
            {/* Progress ring when holding */}
            {holdProgress > 0 && (
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="144"
                  cy="144"
                  r="140"
                  fill="none"
                  stroke={isAligned ? '#22c55e' : 'rgba(255,255,255,0.3)'}
                  strokeWidth="4"
                  strokeDasharray={`${(holdProgress / 100) * 879} 879`}
                />
              </svg>
            )}
          </div>
        </div>
      )}
      
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between safe-top">
        <div 
          className="px-4 py-2 rounded-2xl flex items-center gap-2 bg-black/40 backdrop-blur-sm border"
          style={{ borderColor: `${teamColor}40` }}
        >
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: teamColor }} />
          <span className="text-sm font-medium text-white/90 capitalize">{player.team}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Dev mode badge */}
          {devMode && (
            <div className="px-3 py-1.5 rounded-xl bg-purple-500/30 border border-purple-500/50">
              <span className="text-xs font-medium text-purple-400">DEV</span>
            </div>
          )}
          <motion.button
            onClick={() => setShowInstructions(true)}
            className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center"
            whileTap={{ scale: 0.95 }}
          >
            <AlertCircle size={18} className="text-white/70" />
          </motion.button>
        </div>
      </div>
      
      {/* Nearby art indicator */}
      {nearbyArt && !capturedPhoto && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-20 left-4 right-4"
        >
          <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-4 border border-emerald-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Target size={18} className="text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white text-sm">{nearbyArt.name}</p>
                <p className="text-xs text-white/40">{nearbyArt.area} • {nearbyArt.hood}</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-emerald-400">+{getPointValue(nearbyArt)}</span>
              </div>
            </div>
            {/* Dev mode: next art button */}
            {devMode && (
              <motion.button
                onClick={() => {
                  const uncaptured = artPoints.filter(p => !p.capturedBy && p.status === 'active' && p.id !== nearbyArt.id)
                  if (uncaptured.length > 0) {
                    const randomArt = uncaptured[Math.floor(Math.random() * uncaptured.length)]
                    setNearbyArt({ ...randomArt, distance: 10 })
                  }
                }}
                className="mt-3 w-full py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-medium"
                whileTap={{ scale: 0.98 }}
              >
                Pick Another Art →
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
      
      {/* No nearby art message */}
      {!nearbyArt && locationStatus === 'success' && !capturedPhoto && (
        <div className="absolute top-20 left-4 right-4">
          <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-4 border border-amber-500/30 text-center">
            <MapPin size={24} className="mx-auto mb-2 text-amber-400" />
            <p className="text-white/70 text-sm font-medium">No street art nearby</p>
            <p className="text-white/40 text-xs mt-1">Check the map and get within 100m of a spot</p>
          </div>
        </div>
      )}
      
      {/* Location loading */}
      {locationStatus === 'loading' && !capturedPhoto && (
        <div className="absolute top-20 left-4 right-4">
          <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-4 border border-white/10 text-center">
            <Loader2 size={24} className="mx-auto mb-2 text-white/50 animate-spin" />
            <p className="text-white/50 text-sm">Getting your location...</p>
          </div>
        </div>
      )}
      
      {/* Capture button - hold to capture */}
      {!capturedPhoto && (
        <div className="absolute bottom-24 left-0 right-0 flex flex-col items-center gap-4">
          <motion.button
            onTouchStart={startHold}
            onTouchEnd={endHold}
            onMouseDown={startHold}
            onMouseUp={endHold}
            onMouseLeave={endHold}
            disabled={!nearbyArt || locationStatus !== 'success'}
            className="relative w-24 h-24 rounded-full flex items-center justify-center disabled:opacity-30"
            whileTap={{ scale: 0.95 }}
          >
            {/* Outer ring */}
            <motion.div 
              className="absolute inset-0 rounded-full border-4"
              animate={{ 
                borderColor: isAligned ? '#22c55e' : nearbyArt ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)',
                scale: isAligned ? 1.1 : 1
              }}
            />
            
            {/* Inner button */}
            <motion.div 
              className="w-20 h-20 rounded-full flex items-center justify-center"
              animate={{ 
                backgroundColor: isAligned ? '#22c55e' : '#ffffff',
                scale: holdProgress > 0 ? 0.9 : 1
              }}
            >
              <Camera size={32} className={isAligned ? 'text-white' : 'text-black'} />
            </motion.div>
          </motion.button>
          
          <p className="text-white/40 text-xs">
            {nearbyArt ? 'Hold to capture' : 'Get closer to street art'}
          </p>
          
          {/* AR Scanner button */}
          <motion.button
            onClick={() => window.location.href = '/ar-scanner.html'}
            className="mt-4 px-6 py-3 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 text-sm font-medium flex items-center gap-2"
            whileTap={{ scale: 0.95 }}
          >
            <Target size={18} />
            Open AR Scanner (MindAR)
          </motion.button>
        </div>
      )}
      
      {/* Instructions overlay */}
      <AnimatePresence>
        {showInstructions && (
          <Instructions onClose={dismissInstructions} />
        )}
      </AnimatePresence>
      
      {/* Success screen */}
      <AnimatePresence>
        {capturedPhoto && captureResult?.success && (
          <CaptureSuccess
            result={captureResult}
            photo={capturedPhoto}
            teamColor={teamColor}
            onClose={handleCloseSuccess}
            onShare={handleShare}
          />
        )}
      </AnimatePresence>
      
      {/* Failure message */}
      <AnimatePresence>
        {captureResult && !captureResult.success && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-32 left-4 right-4"
          >
            <div className="bg-red-500/90 backdrop-blur-sm rounded-2xl p-4 text-center">
              <p className="font-semibold text-white">{captureResult.message}</p>
              <button 
                onClick={() => setCaptureResult(null)}
                className="mt-2 text-white/70 text-sm underline"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Scanner
