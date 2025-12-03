import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { GameProvider, useGame } from './context/GameContext'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Map from './pages/Map'
import Scanner from './pages/Scanner'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import Navigation from './components/Navigation'

const TEAM_CONFIG = {
  red: { color: '#E53935', name: 'RED' },
  blue: { color: '#1E88E5', name: 'BLUE' }
}

// Full-screen capture notification - White mode redesign
function CaptureNotification() {
  const { captureNotification, player } = useGame()
  
  if (!captureNotification) return null
  
  const teamColor = TEAM_CONFIG[captureNotification.team]?.color || '#888'
  const teamName = TEAM_CONFIG[captureNotification.team]?.name || '?'
  const points = captureNotification.points || 100
  const streak = captureNotification.streak || 0
  
  // Check if current player is the one who made the capture
  const isActivePlayer = captureNotification.playerId === player.id
  // Check if current player lost their territory
  const isVictim = captureNotification.prevOwner === player.team && captureNotification.team !== player.team
  
  // Determine what to show
  let label, title
  if (isActivePlayer) {
    // You captured or stole
    label = captureNotification.isRecapture ? 'TERRITORY STOLEN' : 'TERRITORY CAPTURED'
    title = captureNotification.isRecapture ? 'STOLEN' : 'CAPTURED'
  } else if (isVictim) {
    // Someone stole from your team
    label = 'TERRITORY LOST'
    title = 'LOST'
  } else {
    // Someone else captured (neutral notification)
    label = captureNotification.isRecapture ? 'TERRITORY CHANGED' : 'NEW CAPTURE'
    title = 'CLAIMED'
  }
  
  // Only show points to the active player who made the capture
  const showPoints = isActivePlayer
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none overflow-hidden bg-[#FAFAFA] font-nohemi"
    >
      {/* Top accent bar */}
      <motion.div 
        className="absolute top-0 left-0 right-0 h-2"
        style={{ backgroundColor: isVictim ? '#888' : teamColor }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
      />
      
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
        className="text-center px-8"
      >
        {/* Label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm tracking-widest text-black/30 mb-2"
        >
          {label}
        </motion.p>
        
        {/* Main title */}
        <motion.h1 
          className="text-5xl font-black text-black tracking-tight mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {title}
        </motion.h1>
        
        {/* Art name */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-lg text-black/50 mb-8"
        >
          {captureNotification.artName}
        </motion.p>
        
        {/* Points - only show to active player */}
        {showPoints && (
          <>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 150 }}
              className="mb-2"
            >
              <span 
                className="text-8xl font-black"
                style={{ color: teamColor }}
              >
                +{points}
              </span>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm tracking-widest text-black/30 mb-6"
            >
              POINTS
            </motion.p>
          </>
        )}
        
        {/* Spacer when no points */}
        {!showPoints && <div className="mb-6" />}
        
        {/* Streak badge - only for active player */}
        {isActivePlayer && streak > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-black/5 mb-6"
          >
            <span className="font-black text-black">STREAK x{streak}</span>
          </motion.div>
        )}
        
        {/* Player info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2"
        >
          <span className="font-bold text-black">{captureNotification.playerName}</span>
          <span 
            className="px-3 py-1 text-xs font-black text-white"
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
  const hideNav = location.pathname === '/onboarding' || location.pathname === '/admin'
  
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
          <Route path="/admin" element={<Admin />} />
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
