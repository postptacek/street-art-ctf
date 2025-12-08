import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'
import { getPointValue } from '../data/pragueMap'

const TEAM_CONFIG = {
  red: { color: '#E53935', name: 'RED' },
  blue: { color: '#1E88E5', name: 'BLUE' }
}

// 24 hour decay
const DECAY_DURATION = 24 * 60 * 60 * 1000

function timeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000)
  if (seconds < 60) return 'now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

// Check if capture is still active (not fully decayed)
function isActiveCapture(capturedAt) {
  if (!capturedAt) return false
  const captureTime = capturedAt.toDate ? capturedAt.toDate() : new Date(capturedAt)
  const elapsed = Date.now() - captureTime.getTime()
  return elapsed < DECAY_DURATION
}

function Home() {
  const { player, teamScores, recentCaptures, isOnline, artPoints } = useGame()

  // Calculate effective scores - only count active (non-decayed) captures
  const effectiveScores = useMemo(() => {
    let red = 0, blue = 0
    artPoints?.forEach(p => {
      if (p.capturedBy && p.status !== 'ghost' && isActiveCapture(p.capturedAt)) {
        const points = getPointValue(p)
        if (p.capturedBy === 'red') red += points
        if (p.capturedBy === 'blue') blue += points
      }
    })
    return { red, blue }
  }, [artPoints])

  const totalScore = effectiveScores.red + effectiveScores.blue
  const redPercent = totalScore > 0 ? Math.round((effectiveScores.red / totalScore) * 100) : 50
  const bluePercent = 100 - redPercent
  const leading = effectiveScores.red > effectiveScores.blue ? 'red' : effectiveScores.blue > effectiveScores.red ? 'blue' : null

  // Count current chomps held by each team (only active, non-decayed)
  const redChomps = artPoints?.filter(p => p.capturedBy === 'red' && p.status !== 'ghost' && isActiveCapture(p.capturedAt)).length || 0
  const blueChomps = artPoints?.filter(p => p.capturedBy === 'blue' && p.status !== 'ghost' && isActiveCapture(p.capturedAt)).length || 0
  const totalChomps = artPoints?.filter(p => p.status !== 'ghost').length || 0
  const unclaimed = totalChomps - redChomps - blueChomps

  return (
    <div className="flex-1 overflow-y-auto bg-[#FAFAFA] font-nohemi">
      {/* Header */}
      <div className="p-6 pt-10">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm tracking-widest text-black/40 mb-1"
        >
          {isOnline ? 'LIVE' : 'OFFLINE'}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-bold text-black tracking-tight"
        >
          Battle Room
        </motion.h1>
      </div>

      {/* Score Battle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-6 mb-8"
      >
        {/* Active scores (current round) */}
        <div className="flex justify-between items-end mb-3">
          <div>
            <div className="text-xs text-black/30 mb-1">RED</div>
            <div
              className="text-4xl font-black"
              style={{ color: leading === 'red' ? TEAM_CONFIG.red.color : 'rgba(0,0,0,0.2)' }}
            >
              {effectiveScores.red}
            </div>
          </div>
          <div className="text-xl font-bold text-black/20 pb-1">vs</div>
          <div className="text-right">
            <div className="text-xs text-black/30 mb-1">BLUE</div>
            <div
              className="text-4xl font-black"
              style={{ color: leading === 'blue' ? TEAM_CONFIG.blue.color : 'rgba(0,0,0,0.2)' }}
            >
              {effectiveScores.blue}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-black/5 flex overflow-hidden">
          <motion.div
            className="h-full"
            style={{ backgroundColor: TEAM_CONFIG.red.color }}
            initial={{ width: '50%' }}
            animate={{ width: `${redPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          <motion.div
            className="h-full"
            style={{ backgroundColor: TEAM_CONFIG.blue.color }}
            initial={{ width: '50%' }}
            animate={{ width: `${bluePercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        {/* Chomps owned */}
        <div className="flex justify-between mt-4 pt-4 border-t border-black/5">
          <div className="text-center">
            <div className="text-2xl font-black" style={{ color: TEAM_CONFIG.red.color }}>{redChomps}</div>
            <div className="text-[10px] text-black/30">{redChomps === 1 ? 'chomp' : 'chomps'}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-black/20">{unclaimed}</div>
            <div className="text-[10px] text-black/30">unclaimed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black" style={{ color: TEAM_CONFIG.blue.color }}>{blueChomps}</div>
            <div className="text-[10px] text-black/30">{blueChomps === 1 ? 'chomp' : 'chomps'}</div>
          </div>
        </div>
      </motion.div>

      {/* Total Team Scores */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="px-6 mb-6"
      >
        <p className="text-sm tracking-widest text-black/40 mb-3">TOTAL SCORES</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8" style={{ backgroundColor: TEAM_CONFIG.red.color }} />
            <div>
              <div className="text-2xl font-black" style={{ color: TEAM_CONFIG.red.color }}>{teamScores.red}</div>
              <div className="text-xs text-black/30">all time</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <div className="text-2xl font-black text-right" style={{ color: TEAM_CONFIG.blue.color }}>{teamScores.blue}</div>
              <div className="text-xs text-black/30 text-right">all time</div>
            </div>
            <div className="w-2 h-8" style={{ backgroundColor: TEAM_CONFIG.blue.color }} />
          </div>
        </div>
      </motion.div>

      {/* Player Card */}
      {player.team && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mx-6 mb-8 p-5"
          style={{ backgroundColor: TEAM_CONFIG[player.team].color }}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="text-white/60 text-xs tracking-widest mb-1">YOU</div>
              <div className="text-2xl font-bold text-white">{player.name}</div>
              <div className="text-white/60 text-sm mt-1">Team {TEAM_CONFIG[player.team].name}</div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-white">{player.score}</div>
              <div className="text-white/60 text-xs">points</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Live Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="px-6 pb-32"
      >
        <p className="text-sm tracking-widest text-black/40 mb-4">ACTIVITY</p>

        {recentCaptures.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-6xl font-black text-black/5 mb-2">0</div>
            <div className="text-black/30">No captures yet</div>
            <div className="text-black/20 text-sm">Be the first to claim territory</div>
          </div>
        ) : (
          <div className="space-y-1">
            {recentCaptures.map((capture, index) => {
              const config = TEAM_CONFIG[capture.team] || { color: '#888', name: '?' }
              // Build score explanation
              const sizeLabel = capture.size ? capture.size.charAt(0).toUpperCase() : ''
              const bonusLabel = capture.isFirstCapture ? '+50%' : capture.isRecapture ? '+25%' : ''
              const bonusType = capture.isFirstCapture ? 'first' : capture.isRecapture ? 'steal' : ''
              return (
                <motion.div
                  key={capture.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="flex items-center gap-4 py-3 border-b border-black/5"
                >
                  <div
                    className="w-1 h-10 flex-shrink-0"
                    style={{ backgroundColor: config.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-black truncate">{capture.artName}</div>
                    <div className="text-sm text-black/40">
                      {capture.playerName} · {capture.area}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold" style={{ color: config.color }}>+{capture.points}</div>
                    <div className="text-[10px] text-black/30">
                      {sizeLabel && <span>{sizeLabel}</span>}
                      {bonusLabel && <span> {bonusLabel} {bonusType}</span>}
                      {!sizeLabel && !bonusLabel && <span>{timeAgo(capture.capturedAt)}</span>}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Home
