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

// Capture notification toast
function CaptureNotification() {
  const { captureNotification } = useGame()
  
  if (!captureNotification) return null
  
  const teamColor = TEAM_COLORS[captureNotification.team]?.hex || '#888'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 left-4 right-4 z-[9999] pointer-events-none"
    >
      <div 
        className="mx-auto max-w-sm p-4 rounded-lg border backdrop-blur-xl shadow-lg"
        style={{ 
          backgroundColor: `${teamColor}15`,
          borderColor: `${teamColor}40`
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${teamColor}30` }}
          >
            {captureNotification.isRecapture ? (
              <Swords size={20} style={{ color: teamColor }} />
            ) : (
              <Flag size={20} style={{ color: teamColor }} />
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white text-sm">
              {captureNotification.isRecapture ? 'Territory Recaptured!' : 'Territory Captured!'}
            </p>
            <p className="text-xs text-white/60">
              <span style={{ color: teamColor }}>{captureNotification.playerName}</span>
              {' took '}
              <span className="text-white/80">{captureNotification.artName}</span>
            </p>
          </div>
          <div 
            className="text-xs font-bold px-2 py-1 rounded"
            style={{ backgroundColor: teamColor, color: 'white' }}
          >
            {captureNotification.team.toUpperCase()}
          </div>
        </div>
      </div>
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
