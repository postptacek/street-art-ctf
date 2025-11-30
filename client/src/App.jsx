import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { GameProvider, useGame, TEAM_COLORS } from './context/GameContext'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Map from './pages/Map'
import Scanner from './pages/Scanner'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import Navigation from './components/Navigation'
import { Swords, Flag, Flame, Zap, Target } from 'lucide-react'

// Particle explosion effect
function ParticleExplosion({ color }) {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    angle: (i / 12) * 360,
    delay: i * 0.02
  }))
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ 
            x: Math.cos(p.angle * Math.PI / 180) * 150,
            y: Math.sin(p.angle * Math.PI / 180) * 150,
            opacity: 0,
            scale: 0
          }}
          transition={{ duration: 0.8, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

// Full-screen capture notification with dramatic animation
function CaptureNotification() {
  const { captureNotification } = useGame()
  
  if (!captureNotification) return null
  
  const teamColor = TEAM_COLORS[captureNotification.team]?.hex || '#888'
  const teamName = captureNotification.team === 'red' ? 'RED' : 'BLUE'
  const points = captureNotification.points || 100
  const streak = captureNotification.streak || 0
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none overflow-hidden"
    >
      {/* Background pulse */}
      <motion.div 
        className="absolute inset-0"
        style={{ backgroundColor: teamColor }}
        initial={{ opacity: 0.3 }}
        animate={{ opacity: [0.3, 0.15, 0.2] }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Radial lines */}
      <div className="absolute inset-0 flex items-center justify-center">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 origin-bottom"
            style={{ 
              backgroundColor: teamColor,
              height: '50vh',
              transform: `rotate(${i * 45}deg)`,
              opacity: 0.2
            }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.3, delay: i * 0.02 }}
          />
        ))}
      </div>
      
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: 'spring', damping: 12, stiffness: 200 }}
        className="relative text-center p-8"
      >
        <ParticleExplosion color={teamColor} />
        
        {/* Main Icon with glow */}
        <motion.div 
          className="relative w-28 h-28 mx-auto mb-4"
          animate={{ 
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 0.5, repeat: 2 }}
        >
          {/* Glow effect */}
          <div 
            className="absolute inset-0 rounded-full blur-xl"
            style={{ backgroundColor: teamColor, opacity: 0.5 }}
          />
          <div 
            className="relative w-full h-full rounded-full flex items-center justify-center"
            style={{ backgroundColor: teamColor }}
          >
            {captureNotification.isRecapture ? (
              <Swords size={56} className="text-white" />
            ) : (
              <Flag size={56} className="text-white" />
            )}
          </div>
        </motion.div>
        
        {/* Action text */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-4xl font-black text-white tracking-tight mb-1">
            {captureNotification.isRecapture ? 'STOLEN!' : 'CAPTURED!'}
          </h1>
          <p className="text-lg font-semibold text-white/80">
            {captureNotification.artName}
          </p>
        </motion.div>
        
        {/* Points display */}
        <motion.div
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <Target size={20} className="text-white" />
          <span className="text-2xl font-black text-white">+{points}</span>
          {streak > 1 && (
            <span className="flex items-center gap-1 text-orange-400 font-bold">
              <Flame size={18} />
              {streak}x
            </span>
          )}
        </motion.div>
        
        {/* Player badge */}
        <motion.div
          className="mt-4 flex items-center justify-center gap-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-white/60 text-sm">by</span>
          <span className="font-bold text-white">{captureNotification.playerName}</span>
          <span 
            className="px-2 py-0.5 rounded text-xs font-black"
            style={{ backgroundColor: teamColor }}
          >
            {teamName}
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

// Wrapper to check if user is onboarded
function RequireOnboarding({ children }) {
  const { player } = useGame()
  const isOnboarded = player.team && player.name && player.name !== 'Street Artist'
  
  if (!isOnboarded) {
    return <Navigate to="/onboarding" replace />
  }
  
  return children
}

function AppContent() {
  const location = useLocation()
  const { player } = useGame()
  const isOnboarded = player.team && player.name && player.name !== 'Street Artist'
  const hideNav = location.pathname === '/onboarding'
  
  return (
    <div className="h-full w-full flex flex-col">
      {/* Real-time capture notifications */}
      <AnimatePresence>
        <CaptureNotification />
      </AnimatePresence>
      
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/" element={isOnboarded ? <Home /> : <Navigate to="/onboarding" replace />} />
          <Route path="/map" element={<RequireOnboarding><Map /></RequireOnboarding>} />
          <Route path="/scanner" element={<RequireOnboarding><Scanner /></RequireOnboarding>} />
          <Route path="/leaderboard" element={<RequireOnboarding><Leaderboard /></RequireOnboarding>} />
          <Route path="/profile" element={<RequireOnboarding><Profile /></RequireOnboarding>} />
        </Routes>
      </AnimatePresence>
      {!hideNav && isOnboarded && <Navigation />}
    </div>
  )
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  )
}

export default App
