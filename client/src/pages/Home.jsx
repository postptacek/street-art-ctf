import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGame, TEAM_COLORS } from '../context/GameContext'
import { Palette, Users, Map, Scan, Trophy, ChevronRight, Sparkles, RotateCcw, Wifi, WifiOff, Cloud } from 'lucide-react'

const teams = [
  { color: 'red', name: 'Crimson', icon: '🔴' },
  { color: 'blue', name: 'Azure', icon: '🔵' },
]

function Home() {
  const navigate = useNavigate()
  const { player, joinTeam, teamScores, artPoints, resetAll, isOnline } = useGame()

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
      className="flex-1 overflow-y-auto pb-24 px-5 pt-12"
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: 20 }}
      variants={containerVariants}
    >
      {/* Hero Section */}
      <motion.div 
        className="text-center mb-10"
        variants={itemVariants}
      >
        <motion.div
          className="relative inline-block mb-6"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto backdrop-blur-sm border border-white/10">
            <span className="text-4xl">🎨</span>
          </div>
          <motion.div 
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-400"
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
        <h1 className="text-4xl font-bold gradient-text mb-3">
          Street Art CTF
        </h1>
        <p className="text-white/50 text-sm max-w-xs mx-auto">
          Capture the city, one masterpiece at a time
        </p>
        {/* Sync Status */}
        <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs ${
          isOnline ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
        }`}>
          {isOnline ? <Cloud size={12} /> : <WifiOff size={12} />}
          {isOnline ? 'Synced' : 'Offline'}
        </div>
      </motion.div>

      {/* Team Selection or Status */}
      {!player.team ? (
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center gap-2 mb-5">
            <Users size={18} className="text-white/40" />
            <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Select Team</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {teams.map(({ color, name, icon }, index) => (
              <motion.button
                key={color}
                onClick={() => handleTeamSelect(color)}
                className="group relative p-5 rounded-2xl text-left overflow-hidden"
                style={{ 
                  background: `linear-gradient(135deg, ${TEAM_COLORS[color].hex}15 0%, transparent 100%)`,
                  border: `1px solid ${TEAM_COLORS[color].hex}30`
                }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ 
                    background: `radial-gradient(circle at 50% 50%, ${TEAM_COLORS[color].hex}20 0%, transparent 70%)`
                  }}
                />
                <div className="relative">
                  <span 
                    className="text-2xl font-bold"
                    style={{ color: TEAM_COLORS[color].hex }}
                  >
                    {icon}
                  </span>
                  <p className="font-semibold mt-3 text-white">{name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-white/40">{teamScores[color]} pts</span>
                    <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                      <motion.div 
                        className="h-full rounded-full"
                        style={{ backgroundColor: TEAM_COLORS[color].hex }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(teamScores[color] / totalScore) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                      />
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div 
          className="mb-8 p-5 rounded-2xl relative overflow-hidden"
          variants={itemVariants}
          style={{ 
            background: `linear-gradient(135deg, ${TEAM_COLORS[player.team].hex}15 0%, transparent 100%)`,
            border: `1px solid ${TEAM_COLORS[player.team].hex}30`
          }}
        >
          <div 
            className="absolute top-0 right-0 w-32 h-32 opacity-20 blur-3xl"
            style={{ backgroundColor: TEAM_COLORS[player.team].hex }}
          />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Your Team</p>
              <p className="text-2xl font-bold" style={{ color: TEAM_COLORS[player.team].hex }}>
                {teams.find(t => t.color === player.team)?.name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Score</p>
              <p className="text-3xl font-bold text-white">{player.score}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div className="space-y-3 mb-8" variants={itemVariants}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-white/40" />
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Quick Actions</h2>
        </div>
        
        <motion.button
          onClick={() => navigate('/map')}
          className="w-full group p-4 rounded-2xl flex items-center gap-4 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300"
          whileTap={{ scale: 0.98 }}
          disabled={!player.team}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Map size={22} className="text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-white">Explore Map</p>
            <p className="text-sm text-white/40">View sectors & tram lines</p>
          </div>
          <ChevronRight size={20} className="text-white/20 group-hover:text-white/40 group-hover:translate-x-1 transition-all" />
        </motion.button>

        <motion.button
          onClick={() => navigate('/scanner')}
          className="w-full group p-4 rounded-2xl flex items-center gap-4 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300"
          whileTap={{ scale: 0.98 }}
          disabled={!player.team}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Scan size={22} className="text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-white">Scan Art</p>
            <p className="text-sm text-white/40">Capture for your team</p>
          </div>
          <ChevronRight size={20} className="text-white/20 group-hover:text-white/40 group-hover:translate-x-1 transition-all" />
        </motion.button>

        <motion.button
          onClick={() => navigate('/leaderboard')}
          className="w-full group p-4 rounded-2xl flex items-center gap-4 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300"
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Trophy size={22} className="text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-white">Leaderboard</p>
            <p className="text-sm text-white/40">See team rankings</p>
          </div>
          <ChevronRight size={20} className="text-white/20 group-hover:text-white/40 group-hover:translate-x-1 transition-all" />
        </motion.button>
      </motion.div>

      {/* Stats Overview */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 mb-4">
          <Palette size={18} className="text-white/40" />
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Game Stats</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: artPoints.length, label: 'Art Spots', color: 'from-purple-500/20 to-pink-500/20' },
            { value: artPoints.filter(p => p.capturedBy).length, label: 'Captured', color: 'from-green-500/20 to-emerald-500/20' },
            { value: player.capturedArt.length, label: 'Your Claims', color: 'from-blue-500/20 to-indigo-500/20' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className={`p-4 rounded-2xl text-center bg-gradient-to-br ${stat.color} border border-white/[0.06]`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-white/40 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      {/* Reset button (dev) */}
      <motion.div variants={itemVariants} className="mt-6">
        <motion.button
          onClick={resetAll}
          className="w-full p-3 rounded-xl flex items-center justify-center gap-2 bg-white/[0.02] border border-white/[0.04] text-white/30 hover:text-white/50 hover:bg-white/[0.04] transition-all text-sm"
          whileTap={{ scale: 0.98 }}
        >
          <RotateCcw size={14} />
          Reset Game Data
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

export default Home
