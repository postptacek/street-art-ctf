import { motion } from 'framer-motion'
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
  const { player, teamScores, recentCaptures, isOnline } = useGame()
  
  const totalScore = teamScores.red + teamScores.blue
  const redPercent = totalScore > 0 ? Math.round((teamScores.red / totalScore) * 100) : 50
  const bluePercent = 100 - redPercent
  const leading = teamScores.red > teamScores.blue ? 'red' : teamScores.blue > teamScores.red ? 'blue' : null

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
          War Room
        </motion.h1>
      </div>

      {/* Score Battle */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-6 mb-8"
      >
        <div className="flex justify-between items-end mb-4">
          <div>
            <div className="text-sm text-black/40 mb-1">RED</div>
            <div 
              className="text-5xl font-black"
              style={{ color: leading === 'red' ? TEAM_CONFIG.red.color : 'rgba(0,0,0,0.2)' }}
            >
              {teamScores.red}
            </div>
          </div>
          <div className="text-2xl font-bold text-black/20 pb-2">vs</div>
          <div className="text-right">
            <div className="text-sm text-black/40 mb-1">BLUE</div>
            <div 
              className="text-5xl font-black"
              style={{ color: leading === 'blue' ? TEAM_CONFIG.blue.color : 'rgba(0,0,0,0.2)' }}
            >
              {teamScores.blue}
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
        <div className="flex justify-between mt-2 text-xs text-black/30">
          <span>{redPercent}%</span>
          <span>{bluePercent}%</span>
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

      {/* Solo Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="px-6 mb-8"
      >
        <p className="text-sm tracking-widest text-black/40 mb-4">YOUR COLLECTION</p>
        
        <div className="flex gap-6 mb-4">
          <div>
            <div className="text-4xl font-black text-black">{player.capturedArt?.length || 0}</div>
            <div className="text-xs text-black/40">discovered</div>
          </div>
          <div>
            <div className="text-4xl font-black text-black">{player.maxStreak || 0}</div>
            <div className="text-xs text-black/40">best streak</div>
          </div>
          <div>
            <div className="text-4xl font-black text-black">{player.streak || 0}</div>
            <div className="text-xs text-black/40">current</div>
          </div>
        </div>
        
        {/* Collection progress bar */}
        <div className="h-1 bg-black/5">
          <motion.div 
            className="h-full bg-black"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(((player.capturedArt?.length || 0) / 21) * 100, 100)}%` }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />
        </div>
        <div className="text-xs text-black/30 mt-2">
          {player.capturedArt?.length || 0} / 21 Chumpsters found
        </div>
      </motion.div>

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
                    <div className="text-xs text-black/30">{timeAgo(capture.capturedAt)}</div>
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
