import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGame, TEAM_COLORS } from '../context/GameContext'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { ART_POINTS, getPointValue } from '../data/pragueMap'
import { 
  Trophy, Target, Flame, RotateCcw, Shuffle, Zap
} from 'lucide-react'

function Profile() {
  const { player, artPoints, resetAll } = useGame()
  const [isRandomizing, setIsRandomizing] = useState(false)

  // Get player's captured art with points
  const capturedArt = artPoints?.filter(art => 
    player.capturedArt.includes(art.id)
  ) || []

  const teamColor = player.team ? TEAM_COLORS[player.team].hex : '#64748b'
  const teamName = player.team === 'red' ? 'Red Team' : 'Blue Team'

  // Randomly assign all points to teams
  const randomizeTeams = async () => {
    if (isRandomizing) return
    setIsRandomizing(true)
    
    try {
      const teams = ['red', 'blue']
      let redScore = 0
      let blueScore = 0
      
      for (const art of ART_POINTS) {
        const randomTeam = teams[Math.floor(Math.random() * teams.length)]
        const points = getPointValue(art)
        
        if (randomTeam === 'red') redScore += points
        else blueScore += points
        
        await setDoc(doc(db, 'streetart-captures', art.id), {
          artId: art.id,
          capturedBy: randomTeam,
          capturedAt: new Date(),
          playerId: 'system',
          playerName: 'Game Master',
          points: points,
          isFirstCapture: true,
          isRecapture: false
        })
      }
      
      await setDoc(doc(db, 'streetart-teams', 'red'), { score: redScore }, { merge: true })
      await setDoc(doc(db, 'streetart-teams', 'blue'), { score: blueScore }, { merge: true })
    } catch (e) {
      console.error('Failed to randomize:', e)
    }
    
    setIsRandomizing(false)
  }

  return (
    <motion.div
      className="flex-1 overflow-y-auto pb-24 px-5 pt-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Profile Header */}
      <div className="text-center mb-8">
        <motion.div
          className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ 
            background: `linear-gradient(135deg, ${teamColor}, ${teamColor}50)`,
          }}
          whileHover={{ scale: 1.05 }}
        >
          <span className="text-3xl font-black text-white">
            {player.name?.charAt(0)?.toUpperCase() || '?'}
          </span>
        </motion.div>
        
        <h1 className="text-2xl font-bold text-white mb-1">{player.name}</h1>
        <p className="text-sm" style={{ color: teamColor }}>{teamName}</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <motion.div 
          className="p-4 rounded-2xl text-center"
          style={{ backgroundColor: '#eab30815', border: '1px solid #eab30830' }}
          whileHover={{ scale: 1.02 }}
        >
          <Trophy size={24} className="mx-auto mb-2 text-yellow-500" />
          <p className="text-2xl font-bold text-white">{player.score}</p>
          <p className="text-[10px] text-white/40 uppercase">Score</p>
        </motion.div>
        
        <motion.div 
          className="p-4 rounded-2xl text-center"
          style={{ backgroundColor: '#22c55e15', border: '1px solid #22c55e30' }}
          whileHover={{ scale: 1.02 }}
        >
          <Target size={24} className="mx-auto mb-2 text-green-500" />
          <p className="text-2xl font-bold text-white">{player.captureCount || capturedArt.length}</p>
          <p className="text-[10px] text-white/40 uppercase">Captures</p>
        </motion.div>
        
        <motion.div 
          className="p-4 rounded-2xl text-center"
          style={{ backgroundColor: '#f9731615', border: '1px solid #f9731630' }}
          whileHover={{ scale: 1.02 }}
        >
          <Flame size={24} className="mx-auto mb-2 text-orange-500" />
          <p className="text-2xl font-bold text-white">{player.maxStreak || 0}</p>
          <p className="text-[10px] text-white/40 uppercase">Best Streak</p>
        </motion.div>
      </div>

      {/* Detailed Stats */}
      <div className="mb-8">
        <h2 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
          Lifetime Stats
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <span className="text-sm">⚔️</span>
            </div>
            <div>
              <p className="text-lg font-bold text-white">{player.recaptureCount || 0}</p>
              <p className="text-[10px] text-white/40">Recaptures</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <span className="text-sm">🏴</span>
            </div>
            <div>
              <p className="text-lg font-bold text-white">{player.firstCaptureCount || 0}</p>
              <p className="text-[10px] text-white/40">First Captures</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <span className="text-sm">🚶</span>
            </div>
            <div>
              <p className="text-lg font-bold text-white">{player.totalDistance ? (player.totalDistance / 1000).toFixed(1) : '0'}km</p>
              <p className="text-[10px] text-white/40">Distance Walked</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <span className="text-sm">🔥</span>
            </div>
            <div>
              <p className="text-lg font-bold text-white">{player.streak || 0}</p>
              <p className="text-[10px] text-white/40">Current Streak</p>
            </div>
          </div>
        </div>
      </div>

      {/* Your Captures */}
      {capturedArt.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
            Your Captures
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {capturedArt.slice(0, 8).map((art, idx) => (
              <motion.div
                key={art.id}
                className="aspect-square rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${teamColor}20`, border: `1px solid ${teamColor}30` }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <span className="text-lg">🎨</span>
              </motion.div>
            ))}
            {capturedArt.length > 8 && (
              <div 
                className="aspect-square rounded-xl flex items-center justify-center bg-white/5"
              >
                <span className="text-xs text-white/40">+{capturedArt.length - 8}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Game Master */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={14} className="text-purple-400" />
          <h2 className="text-xs font-medium text-white/40 uppercase tracking-wider">Game Master</h2>
        </div>
        <motion.button
          onClick={randomizeTeams}
          disabled={isRandomizing}
          className="w-full p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center gap-3 disabled:opacity-50"
          whileTap={{ scale: 0.98 }}
        >
          <Shuffle size={20} className="text-purple-400" />
          <span className="text-sm text-purple-300">
            {isRandomizing ? 'Randomizing...' : 'Randomize All Territories'}
          </span>
        </motion.button>
      </div>

      {/* Reset */}
      <motion.button
        onClick={resetAll}
        className="w-full p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-white/40 hover:text-white/60 transition-colors"
        whileTap={{ scale: 0.98 }}
      >
        <RotateCcw size={14} />
        <span className="text-xs">Reset Game Data</span>
      </motion.button>

      {/* Version */}
      <p className="text-center text-[10px] text-white/20 mt-6">
        Street Art CTF v1.2.0
      </p>
    </motion.div>
  )
}

export default Profile
