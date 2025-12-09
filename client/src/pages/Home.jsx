import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'

const TEAM_CONFIG = {
  red: { color: '#E53935', name: 'RED' },
  blue: { color: '#1E88E5', name: 'BLUE' }
}

function timeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000)
  if (seconds < 60) return 'now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

function Home() {
  const navigate = useNavigate()
  const { player, recentCaptures, isOnline, artPoints } = useGame()

  // Count chomps held by each team (no decay)
  const teamStats = useMemo(() => {
    const activePoints = artPoints?.filter(p => p.status !== 'ghost') || []
    const total = activePoints.length
    const red = activePoints.filter(p => p.capturedBy === 'red').length
    const blue = activePoints.filter(p => p.capturedBy === 'blue').length
    const unclaimed = total - red - blue

    const redPercent = total > 0 ? Math.round((red / total) * 100) : 0
    const bluePercent = total > 0 ? Math.round((blue / total) * 100) : 0

    return { total, red, blue, unclaimed, redPercent, bluePercent }
  }, [artPoints])

  // Determine who's winning and by how much
  const getStatusMessage = () => {
    if (!player.team) return ''

    const diff = Math.abs(teamStats.redPercent - teamStats.bluePercent)
    const redLeading = teamStats.red > teamStats.blue
    const blueLeading = teamStats.blue > teamStats.red
    const yourTeamLeading = (player.team === 'red' && redLeading) || (player.team === 'blue' && blueLeading)

    if (diff === 0 && teamStats.red === teamStats.blue) {
      return teamStats.red === 0 ? 'No territory claimed yet' : 'Teams are tied!'
    }

    if (yourTeamLeading) {
      return diff >= 20 ? `Dominating by ${diff}%!` : `Leading by ${diff}%`
    } else {
      return diff >= 20 ? `Behind by ${diff}%` : `Trailing by ${diff}%`
    }
  }

  const yourTeamColor = TEAM_CONFIG[player.team]?.color || '#888'

  return (
    <div className="flex-1 overflow-y-auto bg-[#FAFAFA] font-nohemi">
      {/* Header */}
      <div className="p-6 pt-10">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs tracking-widest text-black/30 mb-1"
        >
          {isOnline ? 'LIVE' : 'OFFLINE'}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold text-black tracking-tight"
        >
          Battle
        </motion.h1>
      </div>

      {/* Territory Control - THE primary metric */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-6 mb-6"
      >
        {/* Percentage display */}
        <div className="flex justify-between items-baseline mb-2">
          <div className="flex items-baseline gap-2">
            <span
              className="text-4xl font-black"
              style={{ color: TEAM_CONFIG.red.color }}
            >
              {teamStats.redPercent}%
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="text-4xl font-black"
              style={{ color: TEAM_CONFIG.blue.color }}
            >
              {teamStats.bluePercent}%
            </span>
          </div>
        </div>

        {/* Territory bar */}
        <div className="h-3 bg-black/10 flex overflow-hidden mb-3">
          <motion.div
            className="h-full"
            style={{ backgroundColor: TEAM_CONFIG.red.color }}
            initial={{ width: '0%' }}
            animate={{ width: `${teamStats.redPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          {teamStats.unclaimed > 0 && (
            <div
              className="h-full bg-black/5"
              style={{ width: `${100 - teamStats.redPercent - teamStats.bluePercent}%` }}
            />
          )}
          <motion.div
            className="h-full"
            style={{ backgroundColor: TEAM_CONFIG.blue.color }}
            initial={{ width: '0%' }}
            animate={{ width: `${teamStats.bluePercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        {/* Chomps count */}
        <div className="flex justify-between text-xs text-black/40">
          <span>{teamStats.red} chomps</span>
          {teamStats.unclaimed > 0 && (
            <span className="text-black/20">{teamStats.unclaimed} unclaimed</span>
          )}
          <span>{teamStats.blue} chomps</span>
        </div>
      </motion.div>

      {/* Status message */}
      {player.team && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="px-6 mb-8"
        >
          <div
            className="text-center py-3 text-sm font-bold"
            style={{
              color: yourTeamColor,
              backgroundColor: `${yourTeamColor}10`
            }}
          >
            {getStatusMessage()}
          </div>
        </motion.div>
      )}

      {/* Activity Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="px-6 pb-32"
      >
        <p className="text-xs tracking-widest text-black/30 mb-4">ACTIVITY</p>

        {recentCaptures.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-5xl font-black text-black/5 mb-2">0</div>
            <div className="text-black/30 text-sm">No captures yet</div>
          </div>
        ) : (
          <div className="space-y-0">
            {recentCaptures.map((capture, index) => {
              const config = TEAM_CONFIG[capture.team] || { color: '#888' }
              const isYou = capture.playerName === player.name
              return (
                <motion.div
                  key={capture.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + index * 0.03 }}
                  onClick={() => navigate('/map', { state: { targetArtId: capture.id } })}
                  className={`flex items-center gap-3 py-3 border-b border-black/5 cursor-pointer active:bg-black/5 ${isYou ? 'bg-black/[0.02] -mx-3 px-3' : ''}`}
                >
                  <div
                    className="w-1 h-8 flex-shrink-0"
                    style={{ backgroundColor: config.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-black truncate">
                      {isYou ? 'You' : capture.playerName}
                    </div>
                    <div className="text-xs text-black/40 truncate">
                      {capture.artName}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold" style={{ color: config.color }}>
                      +{capture.points}
                    </div>
                    <div className="text-[10px] text-black/30">
                      {timeAgo(capture.capturedAt)}
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
