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
import { Swords, Flag } from 'lucide-react'

// Full-screen capture notification
function CaptureNotification() {
  const { captureNotification } = useGame()
  
  if (!captureNotification) return null
  
  const teamColor = TEAM_COLORS[captureNotification.team]?.hex || '#888'
  const teamName = captureNotification.team === 'red' ? 'RED TEAM' : 'BLUE TEAM'
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
      style={{ backgroundColor: `${teamColor}20` }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        className="text-center p-8"
      >
        {/* Icon */}
        <motion.div 
          className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${teamColor}30`, border: `3px solid ${teamColor}` }}
          initial={{ rotate: -10 }}
          animate={{ rotate: 0 }}
        >
          {captureNotification.isRecapture ? (
            <Swords size={48} style={{ color: teamColor }} />
          ) : (
            <Flag size={48} style={{ color: teamColor }} />
          )}
        </motion.div>
        
        {/* Title */}
        <motion.h1 
          className="text-3xl font-black mb-2"
          style={{ color: teamColor }}
          initial={{ y: 20 }}
          animate={{ y: 0 }}
        >
          {captureNotification.isRecapture ? 'RECAPTURED!' : 'CAPTURED!'}
        </motion.h1>
        
        {/* Art name */}
        <motion.p 
          className="text-xl font-bold text-white mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {captureNotification.artName}
        </motion.p>
        
        {/* Player & Team */}
        <motion.div
          className="flex items-center justify-center gap-3"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-white/60">by</span>
          <span className="font-semibold text-white">{captureNotification.playerName}</span>
          <span 
            className="px-3 py-1 rounded font-bold text-sm"
            style={{ backgroundColor: teamColor, color: 'white' }}
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
