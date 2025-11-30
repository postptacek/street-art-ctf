import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame, TEAM_COLORS } from '../context/GameContext'
import { Camera, X, Check, AlertCircle, Zap, MapPin, Navigation, Loader2 } from 'lucide-react'

// Capture confirmation panel
function CaptureConfirmation({ art, photo, onConfirm, onCancel, teamColor }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="absolute inset-x-4 bottom-24 z-20"
    >
      <div className="bg-black/90 backdrop-blur-xl rounded-3xl p-5 border border-white/10">
        {/* Photo preview */}
        {photo && (
          <div className="mb-4 rounded-2xl overflow-hidden aspect-video bg-white/5">
            <img src={photo} alt="Captured" className="w-full h-full object-cover" />
          </div>
        )}
        
        {/* Art info */}
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${teamColor}20`, border: `1px solid ${teamColor}40` }}
          >
            <MapPin size={20} style={{ color: teamColor }} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white">{art.name}</h3>
            <p className="text-sm text-white/40">{art.area} • {art.distance}m away</p>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold" style={{ color: teamColor }}>
              +{art.points || 100}
            </span>
            <p className="text-xs text-white/40">points</p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3">
          <motion.button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl font-semibold bg-white/5 border border-white/10 text-white/70"
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
          <motion.button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl font-semibold text-white"
            style={{ backgroundColor: teamColor }}
            whileTap={{ scale: 0.98 }}
          >
            Claim!
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

// Result screen
function CaptureResult({ result, teamColor, onClose }) {
  const isSuccess = result?.success

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-20 p-6"
    >
      <motion.div 
        className="max-w-sm w-full text-center"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="mx-auto mb-6"
        >
          <div 
            className={`w-24 h-24 rounded-3xl flex items-center justify-center ${
              isSuccess 
                ? 'bg-gradient-to-br from-emerald-400 to-green-600' 
                : 'bg-gradient-to-br from-amber-400 to-orange-600'
            }`}
          >
            {isSuccess ? <Check size={40} strokeWidth={3} /> : <X size={40} strokeWidth={3} />}
          </div>
        </motion.div>
        
        <h2 className="text-3xl font-bold mb-2 text-white">
          {isSuccess ? result.message || 'Captured!' : 'Oops!'}
        </h2>
        
        {isSuccess ? (
          <>
            <p className="text-white/50 mb-6">{result.art?.name}</p>
            <div
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-2xl font-bold"
              style={{ backgroundColor: `${teamColor}20`, color: teamColor }}
            >
              <Zap size={24} />
              +{result.points}
            </div>
          </>
        ) : (
          <p className="text-white/50">{result?.message}</p>
        )}
        
        <motion.button
          onClick={onClose}
          className="mt-8 w-full py-4 rounded-2xl font-semibold bg-white/10 border border-white/10"
          whileTap={{ scale: 0.98 }}
        >
          Continue
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

// Location status indicator
function LocationStatus({ status, accuracy }) {
  const statusConfig = {
    loading: { color: 'text-amber-400', bg: 'bg-amber-500/20', text: 'Getting location...' },
    success: { color: 'text-emerald-400', bg: 'bg-emerald-500/20', text: `±${accuracy}m` },
    error: { color: 'text-red-400', bg: 'bg-red-500/20', text: 'Location unavailable' }
  }
  
  const config = statusConfig[status] || statusConfig.loading
  
  return (
    <div className={`px-3 py-1.5 rounded-full ${config.bg} flex items-center gap-2`}>
      {status === 'loading' ? (
        <Loader2 size={14} className={`${config.color} animate-spin`} />
      ) : (
        <Navigation size={14} className={config.color} />
      )}
      <span className={`text-xs font-medium ${config.color}`}>{config.text}</span>
    </div>
  )
}

function Scanner() {
  const { 
    player, 
    pendingCapture, 
    scanResult, 
    isScanning,
    startCapture,
    confirmCapture,
    cancelCapture,
    setScanResult,
    findNearestArt
  } = useGame()
  
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [location, setLocation] = useState(null)
  const [locationStatus, setLocationStatus] = useState('loading')
  const [nearbyArt, setNearbyArt] = useState(null)
  
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const canvasRef = useRef(null)

  const teamColor = player.team ? TEAM_COLORS[player.team].hex : '#22c55e'

  // Get user location
  useEffect(() => {
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
  }, [findNearestArt])

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

  // Capture photo
  const handleCapture = useCallback(() => {
    if (!location || !nearbyArt) return
    
    // Capture frame from video
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)
    const photoData = canvas.toDataURL('image/jpeg', 0.8)
    
    // Start capture flow
    startCapture(photoData, location)
  }, [location, nearbyArt, startCapture])

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
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
      
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
        <div 
          className="px-4 py-2 rounded-2xl flex items-center gap-2 bg-black/40 backdrop-blur-sm border"
          style={{ borderColor: `${teamColor}40` }}
        >
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: teamColor }} />
          <span className="text-sm font-medium text-white/90 capitalize">{player.team}</span>
        </div>
        
        <LocationStatus 
          status={locationStatus} 
          accuracy={location ? Math.round(location.accuracy || 10) : null}
        />
      </div>
      
      {/* Nearby art indicator */}
      {nearbyArt && !pendingCapture && !scanResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-20 left-4 right-4"
        >
          <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <MapPin size={18} className="text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white text-sm">{nearbyArt.name}</p>
                <p className="text-xs text-white/40">{nearbyArt.distance}m away • {nearbyArt.area}</p>
              </div>
              {nearbyArt.capturedBy && (
                <div 
                  className="px-2 py-1 rounded-full text-xs"
                  style={{ 
                    backgroundColor: `${TEAM_COLORS[nearbyArt.capturedBy]?.hex}20`,
                    color: TEAM_COLORS[nearbyArt.capturedBy]?.hex
                  }}
                >
                  {nearbyArt.capturedBy}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
      
      {/* No nearby art message */}
      {!nearbyArt && locationStatus === 'success' && !pendingCapture && !scanResult && (
        <div className="absolute top-20 left-4 right-4">
          <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-4 border border-white/10 text-center">
            <p className="text-white/50 text-sm">No street art nearby</p>
            <p className="text-white/30 text-xs mt-1">Get closer to a spot on the map</p>
          </div>
        </div>
      )}
      
      {/* Capture button */}
      {!pendingCapture && !scanResult && (
        <div className="absolute bottom-24 left-0 right-0 flex justify-center">
          <motion.button
            onClick={handleCapture}
            disabled={!nearbyArt || locationStatus !== 'success' || isScanning}
            className="relative w-20 h-20 rounded-full flex items-center justify-center disabled:opacity-50"
            whileTap={{ scale: 0.9 }}
          >
            <div 
              className="absolute inset-0 rounded-full border-4"
              style={{ borderColor: nearbyArt ? teamColor : 'rgba(255,255,255,0.2)' }}
            />
            <motion.div 
              className="w-16 h-16 rounded-full bg-white flex items-center justify-center"
              animate={isScanning ? { scale: [1, 0.9, 1] } : {}}
              transition={{ repeat: Infinity, duration: 0.6 }}
            >
              {isScanning ? (
                <Loader2 size={26} className="text-black animate-spin" />
              ) : (
                <Camera size={26} className="text-black" />
              )}
            </motion.div>
          </motion.button>
        </div>
      )}
      
      {/* Capture confirmation */}
      <AnimatePresence>
        {pendingCapture && (
          <CaptureConfirmation
            art={pendingCapture.art}
            photo={pendingCapture.photo}
            teamColor={teamColor}
            onConfirm={confirmCapture}
            onCancel={cancelCapture}
          />
        )}
      </AnimatePresence>
      
      {/* Result modal */}
      <AnimatePresence>
        {scanResult && (
          <CaptureResult
            result={scanResult}
            teamColor={teamColor}
            onClose={() => setScanResult(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Scanner
