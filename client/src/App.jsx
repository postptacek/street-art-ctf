import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { GameProvider, useGame } from './context/GameContext'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Map from './pages/Map'
import Scanner from './pages/Scanner'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import Achievements from './pages/Achievements'
import Admin from './pages/Admin'
import Navigation from './components/Navigation'
import { RARITY_CONFIG } from './data/achievements'

const TEAM_CONFIG = {
  red: { color: '#E53935', name: 'RED' },
  blue: { color: '#1E88E5', name: 'BLUE' }
}

// Eat animation component - loops between A and B variants
function EatAnimation() {
  const [frame, setFrame] = useState(0)
  const [currentVariant, setCurrentVariant] = useState('a')
  const totalFrames = 41

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => {
        const nextFrame = f + 1
        // When animation completes, switch variant
        if (nextFrame >= totalFrames) {
          setCurrentVariant(v => v === 'a' ? 'b' : 'a')
          return 0
        }
        return nextFrame
      })
    }, 42) // ~24fps
    return () => clearInterval(interval)
  }, [])

  const folder = currentVariant === 'a' ? 'eat_a' : 'eat_b'
  const frameNum = String(frame).padStart(5, '0')
  const src = `animation/${folder}/eat_${currentVariant}_${frameNum}.png`

  return (
    <img
      src={src}
      alt="Chomp animation"
      className="w-48 h-48 object-contain"
    />
  )
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
  // Check if current player lost their territory (steal)
  const isVictim = captureNotification.isRecapture && captureNotification.prevOwner === player.team && captureNotification.team !== player.team

  // For non-active users: only show notification when it's a steal that affects them
  if (!isActivePlayer && !isVictim) {
    return null
  }

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

  // Always show eat animation (loops between A and B)
  const showEatAnimation = true

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
          className="text-lg text-black/50 mb-4"
        >
          {captureNotification.artName}
        </motion.p>

        {/* Eat animation - always show, loops A → B → A... */}
        {showEatAnimation && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
            className="mb-4 flex justify-center"
          >
            <EatAnimation />
          </motion.div>
        )}

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

// Achievement unlock notification popup
function AchievementNotification() {
  const { achievementNotification, player } = useGame()

  if (!achievementNotification) return null

  const teamColor = player.team === 'red' ? '#E53935' : '#1E88E5'

  return (
    <motion.div
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -100 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none overflow-hidden bg-[#FAFAFA] font-nohemi"
    >
      {/* Top accent bar - team color */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-2"
        style={{ backgroundColor: teamColor }}
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
          className="text-sm tracking-widest text-black/30 mb-4"
        >
          ACHIEVEMENT UNLOCKED
        </motion.p>

        {/* Animated chumper icon with bounce */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{
            scale: 1,
            rotate: 0,
            y: [0, -10, 0, -5, 0]
          }}
          transition={{
            duration: 0.6,
            y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          }}
          className="w-28 h-28 mx-auto mb-4"
        >
          <img
            src={`${import.meta.env.BASE_URL}chumper.png`}
            alt=""
            className="w-full h-full object-contain"
            style={{
              filter: `hue-rotate(${RARITY_CONFIG[achievementNotification.rarity]?.hue || '200deg'}) saturate(1.3)`
            }}
          />
        </motion.div>

        {/* Achievement name */}
        <motion.h1
          className="text-5xl font-black text-black tracking-tight mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {achievementNotification.name}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-black/50"
        >
          {achievementNotification.description}
        </motion.p>
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

      {/* Achievement unlock notifications */}
      <AnimatePresence>
        <AchievementNotification />
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/" element={isOnboarded ? <Home /> : <Navigate to="/onboarding" replace />} />
          <Route path="/map" element={<RequireOnboarding><Map /></RequireOnboarding>} />
          <Route path="/scanner" element={<RequireOnboarding><Scanner /></RequireOnboarding>} />
          <Route path="/leaderboard" element={<RequireOnboarding><Leaderboard /></RequireOnboarding>} />
          <Route path="/profile" element={<RequireOnboarding><Profile /></RequireOnboarding>} />
          <Route path="/achievements" element={<RequireOnboarding><Achievements /></RequireOnboarding>} />
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
