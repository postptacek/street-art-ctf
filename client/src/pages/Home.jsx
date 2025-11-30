import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGame, TEAM_COLORS } from '../context/GameContext'
import { Palette, Users, Map, Scan, Trophy, ChevronRight, RotateCcw, Cloud, WifiOff } from 'lucide-react'
import ChumpAnimation from '../components/ChumpAnimation'

const teams = [
  { color: 'red', name: 'Red Team' },
  { color: 'blue', name: 'Blue Team' },
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
        className="text-center mb-8"
        variants={itemVariants}
      >
        <motion.div
          className="relative inline-block mb-4"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChumpAnimation size={100} />
        </motion.div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Street Art CTF
        </h1>
        <p className="text-white/40 text-sm max-w-xs mx-auto">
          Capture the city, one masterpiece at a time
        </p>
        {/* Sync Status */}
        <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded text-xs ${
          isOnline ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
        }`}>
          {isOnline ? <Cloud size={12} /> : <WifiOff size={12} />}
          {isOnline ? 'Synced' : 'Offline'}
        </div>
      </motion.div>

      {/* Team Selection or Status */}
      {!player.team ? (
        <motion.div variants={itemVariants} className="mb-8">
          {/* Welcome message for new players */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-white mb-2">Welcome, Street Artist!</h3>
            <p className="text-sm text-white/50 leading-relaxed">
              Explore the city, find street art, and capture it for your team! 
              Point your camera at art pieces and scan to claim them.
            </p>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-white/40" />
            <h2 className="text-xs font-medium text-white/40 uppercase tracking-wider">Choose Your Side</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {teams.map(({ color, name }, index) => (
              <motion.button
                key={color}
                onClick={() => handleTeamSelect(color)}
                className="group relative p-4 rounded-lg text-left bg-white/5 border border-white/10 hover:border-opacity-50 transition-all"
                style={{ 
                  borderColor: TEAM_COLORS[color].hex + '30'
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="relative">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                    style={{ backgroundColor: TEAM_COLORS[color].hex + '30' }}
                  >
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: TEAM_COLORS[color].hex }} />
                  </div>
                  <p className="font-semibold text-white">{name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-white/40">{teamScores[color]} pts</span>
                    <div className="flex-1 h-1 rounded bg-white/10 overflow-hidden">
                      <motion.div 
                        className="h-full"
                        style={{ backgroundColor: TEAM_COLORS[color].hex }}
                        initial={{ width: 0 }}
                        animate={{ width: totalScore > 0 ? `${(teamScores[color] / totalScore) * 100}%` : '50%' }}
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
          className="mb-8 p-4 rounded-lg relative overflow-hidden bg-white/5 border border-white/10"
          variants={itemVariants}
          style={{ borderColor: TEAM_COLORS[player.team].hex + '30' }}
        >
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Your Team</p>
              <p className="text-xl font-bold" style={{ color: TEAM_COLORS[player.team].hex }}>
                {teams.find(t => t.color === player.team)?.name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Score</p>
              <p className="text-2xl font-bold text-white">{player.score}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div className="space-y-2 mb-8" variants={itemVariants}>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-xs font-medium text-white/40 uppercase tracking-wider">Quick Actions</h2>
        </div>
        
        <motion.button
          onClick={() => navigate('/map')}
          className="w-full group p-3 rounded-lg flex items-center gap-3 bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all"
          whileTap={{ scale: 0.98 }}
          disabled={!player.team}
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Map size={20} className="text-indigo-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-white text-sm">Explore Map</p>
            <p className="text-xs text-white/40">View territories</p>
          </div>
          <ChevronRight size={18} className="text-white/20" />
        </motion.button>

        <motion.button
          onClick={() => navigate('/scanner')}
          className="w-full group p-3 rounded-lg flex items-center gap-3 bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all"
          whileTap={{ scale: 0.98 }}
          disabled={!player.team}
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Scan size={20} className="text-emerald-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-white text-sm">Scan Art</p>
            <p className="text-xs text-white/40">Capture for your team</p>
          </div>
          <ChevronRight size={18} className="text-white/20" />
        </motion.button>

        <motion.button
          onClick={() => navigate('/leaderboard')}
          className="w-full group p-3 rounded-lg flex items-center gap-3 bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all"
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Trophy size={20} className="text-amber-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-white text-sm">Leaderboard</p>
            <p className="text-xs text-white/40">See team rankings</p>
          </div>
          <ChevronRight size={18} className="text-white/20" />
        </motion.button>
      </motion.div>

      {/* Stats Overview */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 mb-3">
          <Palette size={14} className="text-white/40" />
          <h2 className="text-xs font-medium text-white/40 uppercase tracking-wider">Game Stats</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: artPoints.length, label: 'Art Spots' },
            { value: artPoints.filter(p => p.capturedBy).length, label: 'Captured' },
            { value: player.capturedArt.length, label: 'Your Claims' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="p-3 rounded-lg text-center bg-white/5 border border-white/10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-[10px] text-white/40 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      {/* Reset button (dev) */}
      <motion.div variants={itemVariants} className="mt-6">
        <motion.button
          onClick={resetAll}
          className="w-full p-3 rounded-lg flex items-center justify-center gap-2 bg-white/[0.02] border border-white/[0.05] text-white/30 hover:text-white/50 hover:bg-white/[0.04] transition-all text-xs"
          whileTap={{ scale: 0.98 }}
        >
          <RotateCcw size={12} />
          Reset Game Data
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

export default Home
