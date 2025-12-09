import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { ART_POINTS, getPointValue } from '../data/pragueMap'
import { BADGE_LIST, TOTAL_BADGES, getBadge } from '../data/badges'
import { ACHIEVEMENTS } from '../data/achievements'

// Check if running as PWA (standalone mode)
const isStandalone = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
}

// Check if iOS
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
}

const TEAM_CONFIG = {
  red: { color: '#E53935', name: 'RED' },
  blue: { color: '#1E88E5', name: 'BLUE' }
}

const DISTRICTS = {
  'Vysočany': { name: 'Vysočany' },
  'Hloubětín': { name: 'Hloubětín' },
  'Poděbrady': { name: 'Poděbrady' },
  'Palmovka': { name: 'Palmovka' },
  'Karlín': { name: 'Karlín' },
  'Libeň': { name: 'Libeň' },
  'Prosek': { name: 'Prosek' },
  'Florenc': { name: 'Florenc' },
  'Centrum': { name: 'Centrum' }
}

function Profile() {
  const { player, artPoints, resetAll, discoveries } = useGame()
  const [isRandomizing, setIsRandomizing] = useState(false)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isPWA, setIsPWA] = useState(false)

  useEffect(() => {
    setIsPWA(isStandalone())
  }, [])

  const capturedArt = artPoints?.filter(art =>
    player.capturedArt.includes(art.id)
  ) || []

  const districtProgress = useMemo(() => {
    const progress = {}
    const discoveredIds = Object.keys(discoveries || {})

    Object.keys(DISTRICTS).forEach(district => {
      const districtArt = ART_POINTS.filter(art => art.area === district)
      const discovered = districtArt.filter(art => discoveredIds.includes(art.id))
      progress[district] = {
        total: districtArt.length,
        found: discovered.length,
        complete: discovered.length === districtArt.length && districtArt.length > 0
      }
    })
    return progress
  }, [discoveries])

  const totalProgress = useMemo(() => {
    const total = ART_POINTS.length
    const found = Object.keys(discoveries || {}).length
    return { total, found, percent: Math.round((found / total) * 100) }
  }, [discoveries])

  const teamColor = player.team ? TEAM_CONFIG[player.team].color : '#888'
  const teamName = player.team ? TEAM_CONFIG[player.team].name : '?'

  // Count unique areas where player has discovered art
  const areasExplored = useMemo(() => {
    const discoveredIds = Object.keys(discoveries || {})
    const areas = new Set()
    ART_POINTS.forEach(art => {
      if (discoveredIds.includes(art.id)) {
        areas.add(art.area)
      }
    })
    return areas.size
  }, [discoveries])

  // Get collected badges (badges for discovered art)
  const collectedBadges = useMemo(() => {
    const discoveredIds = Object.keys(discoveries || {})
    return BADGE_LIST.filter(badge => discoveredIds.includes(badge.id))
  }, [discoveries])

  const randomizeTeams = async () => {
    if (isRandomizing) return
    setIsRandomizing(true)
    try {
      const teams = ['red', 'blue']
      let redScore = 0, blueScore = 0
      for (const art of ART_POINTS) {
        const randomTeam = teams[Math.floor(Math.random() * teams.length)]
        const points = getPointValue(art)
        if (randomTeam === 'red') redScore += points
        else blueScore += points
        await setDoc(doc(db, 'streetart-captures', art.id), {
          artId: art.id, capturedBy: randomTeam, capturedAt: new Date(),
          playerId: 'system', playerName: 'Game Master', points, isFirstCapture: true, isRecapture: false
        })
      }
      await setDoc(doc(db, 'streetart-teams', 'red'), { score: redScore }, { merge: true })
      await setDoc(doc(db, 'streetart-teams', 'blue'), { score: blueScore }, { merge: true })
    } catch (e) { console.error('Failed to randomize:', e) }
    setIsRandomizing(false)
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#FAFAFA] font-nohemi pb-20">
      {/* Header */}
      <div className="p-6 pt-10">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm tracking-widest text-black/40 mb-1"
        >
          YOUR COLLECTION
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-bold text-black tracking-tight"
        >
          {player.name}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ color: teamColor }}
        >
          Team {teamName}
        </motion.p>
      </div>

      {/* Main Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-6 mb-8"
      >
        <div className="flex gap-6">
          <div>
            <div className="text-5xl font-black text-black">{player.score}</div>
            <div className="text-xs text-black/40 mt-1">POINTS</div>
          </div>
          <div>
            <div className="text-5xl font-black text-black">{player.captureCount || capturedArt.length}</div>
            <div className="text-xs text-black/40 mt-1">CAPTURES</div>
          </div>
          <div>
            <div className="text-5xl font-black text-black">{player.maxStreak || 0}</div>
            <div className="text-xs text-black/40 mt-1">BEST STREAK</div>
          </div>
        </div>
      </motion.div>

      {/* Chomps Badge Collection */}
      {TOTAL_BADGES > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="px-6 mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm tracking-widest text-black/40">CHOMPS</p>
            <p className="text-sm text-black/40">
              <span className="font-bold text-black">{collectedBadges.length}</span> / {TOTAL_BADGES}
            </p>
          </div>

          {collectedBadges.length === 0 ? (
            <div className="py-8 text-center">
              <div className="text-4xl font-black text-black/10 mb-2">?</div>
              <p className="text-black/30 text-sm">Scan street art to collect Chomps!</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {collectedBadges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.3 + index * 0.05,
                    type: 'spring',
                    stiffness: 300,
                    damping: 15
                  }}
                  className="relative"
                >
                  <div
                    className="w-16 h-16 rounded-full overflow-hidden shadow-lg"
                    style={{
                      boxShadow: `0 4px 15px ${teamColor}40`,
                      border: `2px solid ${teamColor}`
                    }}
                  >
                    <img
                      src={badge.image}
                      alt={badge.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: teamColor }}
                  >
                    {badge.badgeNumber}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Achievements Link */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="px-6 mb-4"
      >
        <Link to="/achievements" className="block">
          <div className="flex items-center justify-between py-3 border-b border-black/10">
            <p className="text-sm tracking-widest text-black/40">ACHIEVEMENTS</p>
            <p className="text-sm text-black/40">→</p>
          </div>
        </Link>
      </motion.div>

      {/* Collection Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="px-6 mb-8"
      >
        <p className="text-sm tracking-widest text-black/40 mb-4">COLLECTION</p>

        {/* City total */}
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="font-bold text-black">Total Collected</span>
            <span className="text-black/40">{totalProgress.found} / {totalProgress.total}</span>
          </div>
          <div className="h-2 bg-black/5">
            <motion.div
              className="h-full"
              style={{ backgroundColor: teamColor }}
              initial={{ width: 0 }}
              animate={{ width: `${totalProgress.percent}%` }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />
          </div>
        </div>

        {/* Districts */}
        <div className="space-y-3">
          {Object.entries(DISTRICTS).map(([key, district], i) => {
            const prog = districtProgress[key] || { found: 0, total: 0, complete: false }
            const percent = prog.total > 0 ? Math.round((prog.found / prog.total) * 100) : 0
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="w-8 text-2xl font-black text-black/10">{prog.found}</div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className={`text-sm ${prog.complete ? 'font-bold text-black' : 'text-black/60'}`}>
                      {district.name}
                      {prog.complete && <span className="ml-2 text-green-600">COMPLETE</span>}
                    </span>
                    <span className="text-xs text-black/30">{prog.found}/{prog.total}</span>
                  </div>
                  <div className="h-1 bg-black/5">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        backgroundColor: prog.complete ? '#22c55e' : 'rgba(0,0,0,0.2)',
                        width: `${percent}%`
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Detailed Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="px-6 mb-8"
      >
        <p className="text-sm tracking-widest text-black/40 mb-4">STATS</p>

        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <div className="flex justify-between border-b border-black/5 pb-2">
            <span className="text-black/50">Recaptures</span>
            <span className="font-bold text-black">{player.recaptureCount || 0}</span>
          </div>
          <div className="flex justify-between border-b border-black/5 pb-2">
            <span className="text-black/50">First captures</span>
            <span className="font-bold text-black">{player.firstCaptureCount || 0}</span>
          </div>
          <div className="flex justify-between border-b border-black/5 pb-2">
            <span className="text-black/50">Current streak</span>
            <span className="font-bold text-black">{player.streak || 0}</span>
          </div>
          <div className="flex justify-between border-b border-black/5 pb-2">
            <span className="text-black/50">Areas</span>
            <span className="font-bold text-black">{areasExplored} / {Object.keys(DISTRICTS).length}</span>
          </div>
        </div>
      </motion.div>

      {/* Admin */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="px-6 mb-8"
      >
        <p className="text-sm tracking-widest text-black/40 mb-4">ADMIN</p>

        <div className="space-y-2">
          <button
            onClick={randomizeTeams}
            disabled={isRandomizing}
            className="w-full py-3 bg-black/5 text-black/60 font-bold text-sm tracking-wide hover:bg-black/10 transition-colors disabled:opacity-50"
          >
            {isRandomizing ? 'RANDOMIZING...' : 'RANDOMIZE TERRITORIES'}
          </button>

          <button
            onClick={resetAll}
            className="w-full py-3 text-black/30 font-bold text-sm tracking-wide hover:text-red-500 transition-colors"
          >
            RESET ALL DATA
          </button>
        </div>
      </motion.div>

      {/* Install & Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="px-6 mb-6"
      >
        {!isPWA && (
          <button
            onClick={() => setShowInstallPrompt(true)}
            className="w-full py-3 bg-black text-white font-bold text-sm tracking-wide mb-3"
          >
            ADD TO HOME SCREEN
          </button>
        )}
        <p className="text-center text-xs text-black/40">
          Best experience on Chrome browser
        </p>
      </motion.div>

      {/* iOS Install Instructions Modal */}
      <AnimatePresence>
        {showInstallPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-6"
            onClick={() => setShowInstallPrompt(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 max-w-sm w-full"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-black mb-4">Add to Home Screen</h3>
              {isIOS() ? (
                <div className="space-y-4 text-black/70">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">1.</span>
                    <p>Tap the <strong>Share</strong> button <span className="inline-block w-5 h-5 align-middle">
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 5l-1.42 1.42-1.59-1.59V16h-2V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z" /></svg>
                    </span> at the bottom of Safari</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">2.</span>
                    <p>Scroll down and tap <strong>"Add to Home Screen"</strong></p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">3.</span>
                    <p>Tap <strong>"Add"</strong> in the top right</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-black/70">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">1.</span>
                    <p>Tap the <strong>menu</strong> (⋮) in Chrome</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">2.</span>
                    <p>Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong></p>
                  </div>
                </div>
              )}
              <button
                onClick={() => setShowInstallPrompt(false)}
                className="w-full mt-6 py-3 bg-black text-white font-bold text-sm"
              >
                GOT IT
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Social links */}
      <div className="flex justify-center gap-6 py-6">
        <a
          href="https://www.instagram.com/postptacek/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-black/40 hover:text-black transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
          <span className="text-sm font-bold">Instagram</span>
        </a>
        <a
          href="https://discord.gg/UdR2Gkpd"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-black/40 hover:text-black transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
          <span className="text-sm font-bold">Discord</span>
        </a>
      </div>

      <p className="text-center text-xs text-black/20 pb-4">v3.0.5</p>
    </div>
  )
}

export default Profile
