import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'

const TEAM_CONFIG = {
  red: { color: '#E53935', name: 'RED' },
  blue: { color: '#1E88E5', name: 'BLUE' }
}

function Leaderboard() {
  const { player, allPlayers } = useGame()

  // Build players list - filter out "Street Artist" entries and merge with current player
  const playersList = allPlayers.filter(p => p.name && p.name !== 'Street Artist')

  // Update current player's data if they exist in list, or add them
  const currentPlayerIndex = playersList.findIndex(p => p.id === player.id || p.name === player.name)
  if (currentPlayerIndex >= 0) {
    // Update existing entry with latest local data
    playersList[currentPlayerIndex] = {
      ...playersList[currentPlayerIndex],
      score: Math.max(playersList[currentPlayerIndex].score, player.score || 0),
      captures: Math.max(playersList[currentPlayerIndex].captures || 0, player.captureCount || player.capturedArt?.length || 0)
    }
  } else if (player.team && player.name && player.name !== 'Street Artist') {
    // Add current player if not in list
    playersList.push({
      id: player.id || 'current',
      name: player.name,
      team: player.team,
      score: player.score || 0,
      captures: player.captureCount || player.capturedArt?.length || 0
    })
  }

  // Sort by score descending
  const sortedPlayers = playersList.sort((a, b) => (b.score || 0) - (a.score || 0))

  return (
    <div className="flex-1 overflow-y-auto bg-[#FAFAFA] font-nohemi pb-20">
      {/* Header */}
      <div className="p-6 pt-10">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm tracking-widest text-black/40 mb-1"
        >
          SOLO RANKINGS
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-bold text-black tracking-tight"
        >
          Top Players
        </motion.h1>
      </div>


      {/* Player Rankings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="px-6"
      >
        <p className="text-sm tracking-widest text-black/40 mb-4">PLAYERS</p>

        <div className="space-y-1">
          {sortedPlayers.map((p, index) => {
            const isCurrentPlayer = p.name === player.name
            const teamColor = TEAM_CONFIG[p.team]?.color || '#888'
            const isTop3 = index < 3

            return (
              <motion.div
                key={p.id || p.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.03 }}
                className={`flex items-center gap-4 py-3 border-b border-black/5 ${isCurrentPlayer ? 'bg-black/5 -mx-2 px-2' : ''
                  }`}
              >
                {/* Rank */}
                <div className="w-8">
                  <span className={`text-2xl font-black ${isTop3 ? 'text-black' : 'text-black/20'
                    }`}>
                    {index + 1}
                  </span>
                </div>

                {/* Team indicator */}
                <div
                  className="w-1 h-8"
                  style={{ backgroundColor: teamColor }}
                />

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold truncate ${isCurrentPlayer ? 'text-black' : 'text-black/80'}`}>
                      {p.name}
                    </span>
                    {isCurrentPlayer && (
                      <span className="text-[10px] tracking-widest text-black/40">YOU</span>
                    )}
                  </div>
                  <div className="text-xs text-black/40">{p.captures || 0} captures</div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div className="text-xl font-black text-black">{p.score}</div>
                </div>
              </motion.div>
            )
          })}

          {sortedPlayers.length === 0 && (
            <div className="py-12 text-center">
              <div className="text-6xl font-black text-black/5 mb-2">0</div>
              <div className="text-black/30">No players yet</div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default Leaderboard
