import { motion } from 'framer-motion'
import { useGame, TEAM_COLORS } from '../context/GameContext'
import { Trophy, TrendingUp, Users, Crown, Medal, Flame } from 'lucide-react'

const MOCK_PLAYERS = [
  { id: 1, name: 'StreetKing', team: 'red', score: 1250, captures: 12 },
  { id: 2, name: 'ArtHunter', team: 'blue', score: 980, captures: 9 },
  { id: 3, name: 'GraffitiMaster', team: 'green', score: 875, captures: 8 },
  { id: 4, name: 'WallWalker', team: 'yellow', score: 720, captures: 7 },
  { id: 5, name: 'SprayQueen', team: 'red', score: 650, captures: 6 },
  { id: 6, name: 'UrbanExplorer', team: 'blue', score: 580, captures: 5 },
  { id: 7, name: 'TramRider', team: 'green', score: 490, captures: 4 },
  { id: 8, name: 'NightOwl', team: 'yellow', score: 380, captures: 3 },
]

const teamNames = {
  red: 'Crimson',
  blue: 'Azure', 
  green: 'Emerald',
  yellow: 'Gold'
}

function TeamScoreCard({ team, score, rank, totalScore }) {
  const percentage = (score / totalScore) * 100
  const isLeader = rank === 0

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1, type: 'spring', stiffness: 100 }}
    >
      {/* Background with gradient */}
      <div 
        className="absolute inset-0"
        style={{ 
          background: `linear-gradient(135deg, ${TEAM_COLORS[team].hex}15 0%, transparent 60%)`,
        }}
      />
      
      {/* Progress fill */}
      <motion.div
        className="absolute inset-y-0 left-0 opacity-10"
        style={{ backgroundColor: TEAM_COLORS[team].hex }}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, delay: 0.3 + rank * 0.1, ease: 'easeOut' }}
      />
      
      <div 
        className="relative p-4 border rounded-2xl"
        style={{ borderColor: `${TEAM_COLORS[team].hex}30` }}
      >
        <div className="flex items-center gap-4">
          {/* Rank badge */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isLeader ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-white/5'
          }`}>
            {isLeader ? (
              <Crown size={20} className="text-white" />
            ) : (
              <span className="text-lg font-bold text-white/40">{rank + 1}</span>
            )}
          </div>
          
          {/* Team info */}
          <div className="flex-1">
            <p className="font-semibold text-white">{teamNames[team]}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: TEAM_COLORS[team].hex }}
              />
              <span className="text-xs text-white/40">{percentage.toFixed(0)}% territory</span>
            </div>
          </div>
          
          {/* Score */}
          <div className="text-right">
            <p className="text-2xl font-bold" style={{ color: TEAM_COLORS[team].hex }}>
              {score.toLocaleString()}
            </p>
            <p className="text-xs text-white/30">points</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function PlayerRow({ player, rank, isCurrentPlayer }) {
  const isTop3 = rank < 3
  const rankColors = ['from-amber-400 to-orange-500', 'from-slate-300 to-slate-400', 'from-amber-600 to-amber-700']

  return (
    <motion.div
      className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
        isCurrentPlayer 
          ? 'bg-white/10 border border-white/20' 
          : 'bg-white/[0.02] border border-transparent hover:bg-white/[0.04]'
      }`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.03, type: 'spring', stiffness: 100 }}
    >
      {/* Rank */}
      <div className="w-8 flex justify-center">
        {isTop3 ? (
          <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${rankColors[rank]} flex items-center justify-center`}>
            <span className="text-xs font-bold text-white">{rank + 1}</span>
          </div>
        ) : (
          <span className="text-sm text-white/30 font-medium">{rank + 1}</span>
        )}
      </div>
      
      {/* Avatar placeholder with team color */}
      <div 
        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
        style={{ 
          backgroundColor: `${TEAM_COLORS[player.team].hex}20`,
          color: TEAM_COLORS[player.team].hex
        }}
      >
        {player.name.slice(0, 2).toUpperCase()}
      </div>
      
      {/* Player name */}
      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${isCurrentPlayer ? 'text-white' : 'text-white/80'}`}>
          {player.name}
          {isCurrentPlayer && (
            <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-white/10 text-white/50">you</span>
          )}
        </p>
        <p className="text-xs text-white/30">{player.captures} captures</p>
      </div>
      
      {/* Score */}
      <div className="text-right">
        <p className="font-bold text-white">{player.score.toLocaleString()}</p>
      </div>
    </motion.div>
  )
}

function Leaderboard() {
  const { teamScores, player } = useGame()
  
  const sortedTeams = Object.entries(teamScores).sort((a, b) => b[1] - a[1])
  const totalScore = Object.values(teamScores).reduce((a, b) => a + b, 0)

  const allPlayers = [...MOCK_PLAYERS]
  if (player.score > 0) {
    allPlayers.push({
      id: 'current',
      name: player.name,
      team: player.team,
      score: player.score,
      captures: player.capturedArt.length
    })
  }
  
  const sortedPlayers = allPlayers.sort((a, b) => b.score - a.score)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  return (
    <motion.div
      className="flex-1 overflow-y-auto pb-24 px-5 pt-12"
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Trophy size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
            <p className="text-sm text-white/40">Real-time rankings</p>
          </div>
        </div>
      </motion.div>

      {/* Team Scores */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-white/40" />
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Team Standings</h2>
        </div>
        <div className="space-y-3">
          {sortedTeams.map(([team, score], index) => (
            <TeamScoreCard 
              key={team}
              team={team}
              score={score}
              rank={index}
              totalScore={totalScore}
            />
          ))}
        </div>
      </div>

      {/* Player Leaderboard */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Flame size={16} className="text-white/40" />
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Top Players</h2>
        </div>
        <div className="space-y-2">
          {sortedPlayers.map((p, index) => (
            <PlayerRow 
              key={p.id}
              player={p}
              rank={index}
              isCurrentPlayer={p.id === 'current'}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default Leaderboard
