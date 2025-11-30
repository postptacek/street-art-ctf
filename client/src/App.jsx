import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { GameProvider, useGame } from './context/GameContext'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Map from './pages/Map'
import Scanner from './pages/Scanner'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import Navigation from './components/Navigation'

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
