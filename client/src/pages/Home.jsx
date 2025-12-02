import { motion } from 'framer-motion'
import { useGame, TEAM_COLORS } from '../context/GameContext'
import { Users, Clock, Cloud, WifiOff } from 'lucide-react'
import ChumpAnimation from '../components/ChumpAnimation'

const CHUMPER_URL = `${import.meta.env.BASE_URL}chumper.png`

const teams = [
  { color: 'red', name: 'Red Team' },
  { color: 'blue', name: 'Blue Team' },
]

// Format time ago
function timeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function Home() {
  const { player, joinTeam, teamScores, recentCaptures, isOnline } = useGame()

  const handleTeamSelect = (teamColor) => {
    joinTeam(teamColor)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  }

  const totalScore = Object.values(teamScores).reduce((a, b) => a + b, 0)

  return (
    <motion.div
      className="flex-1 overflow-y-auto pb-24 px-5 pt-8"
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: 20 }}
      variants={containerVariants}
    >
      {/* Hero Section - Compact */}
      <motion.div 
        className="text-center mb-6"
        variants={itemVariants}
      >
        <motion.div
          className="relative inline-block mb-3"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChumpAnimation size={70} />
        </motion.div>
        <h1 className="text-2xl font-bold text-white mb-1">
          Street Art CTF
        </h1>
        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] ${
          isOnline ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
        }`}>
          {isOnline ? <Cloud size={10} /> : <WifiOff size={10} />}
          {isOnline ? 'Live' : 'Offline'}
        </div>
      </motion.div>

      {/* Team War Status */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/40">Red Team</span>
          <span className="text-xs text-white/40">Blue Team</span>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden bg-white/10">
          <motion.div 
            className="h-full"
            style={{ backgroundColor: TEAM_COLORS.red.hex }}
            initial={{ width: '50%' }}
            animate={{ width: totalScore > 0 ? `${(teamScores.red / totalScore) * 100}%` : '50%' }}
            transition={{ duration: 0.8 }}
          />
          <motion.div 
            className="h-full"
            style={{ backgroundColor: TEAM_COLORS.blue.hex }}
            initial={{ width: '50%' }}
            animate={{ width: totalScore > 0 ? `${(teamScores.blue / totalScore) * 100}%` : '50%' }}
            transition={{ duration: 0.8 }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-bold" style={{ color: TEAM_COLORS.red.hex }}>{teamScores.red} pts</span>
          <span className="text-sm font-bold" style={{ color: TEAM_COLORS.blue.hex }}>{teamScores.blue} pts</span>
        </div>
      </motion.div>

      {/* Team Selection or Player Status */}
      {!player.team ? (
        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Users size={14} className="text-white/40" />
            <h2 className="text-xs font-medium text-white/40 uppercase tracking-wider">Choose Your Side</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {teams.map(({ color, name }) => (
              <motion.button
                key={color}
                onClick={() => handleTeamSelect(color)}
                className="p-4 rounded-xl text-center border-2 transition-all"
                style={{ 
                  borderColor: TEAM_COLORS[color].hex + '50',
                  backgroundColor: TEAM_COLORS[color].hex + '10'
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div 
                  className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                  style={{ backgroundColor: TEAM_COLORS[color].hex + '30' }}
                >
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: TEAM_COLORS[color].hex }} />
                </div>
                <p className="font-semibold text-white">{name}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div 
          className="mb-6 p-4 rounded-xl border-2"
          variants={itemVariants}
          style={{ 
            borderColor: TEAM_COLORS[player.team].hex + '50',
            backgroundColor: TEAM_COLORS[player.team].hex + '10'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: TEAM_COLORS[player.team].hex + '30' }}
              >
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: TEAM_COLORS[player.team].hex }} />
              </div>
              <div>
                <p className="font-bold text-white">{player.name}</p>
                <p className="text-xs" style={{ color: TEAM_COLORS[player.team].hex }}>
                  {player.team === 'red' ? 'Red Team' : 'Blue Team'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{player.score}</p>
              <p className="text-[10px] text-white/40">points</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Captures - Live Feed */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 mb-3">
          <Clock size={14} className="text-white/40" />
          <h2 className="text-xs font-medium text-white/40 uppercase tracking-wider">Live Activity</h2>
        </div>
        
        {recentCaptures.length === 0 ? (
          <div className="text-center py-8 text-white/30 text-sm">
            No captures yet. Be the first!
          </div>
        ) : (
          <div className="space-y-2">
            {recentCaptures.map((capture, index) => {
              const teamColor = TEAM_COLORS[capture.team]?.hex || '#888'
              return (
                <motion.div
                  key={capture.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${teamColor}20` }}
                  >
                    <img 
                      src={CHUMPER_URL} 
                      alt="" 
                      className="w-5 h-5"
                      style={{ 
                        filter: capture.team === 'red' 
                          ? 'hue-rotate(160deg) saturate(1.5)' 
                          : 'none' 
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{capture.artName}</p>
                    <p className="text-[10px] text-white/40">
                      <span style={{ color: teamColor }}>{capture.playerName}</span>
                      {' · '}{capture.area}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-semibold" style={{ color: teamColor }}>+{capture.points}</p>
                    <p className="text-[10px] text-white/30">{timeAgo(capture.capturedAt)}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default Home
