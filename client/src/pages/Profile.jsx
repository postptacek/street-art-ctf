import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { ART_POINTS, getPointValue } from '../data/pragueMap'

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
  'Prosek': { name: 'Prosek' }
}

function Profile() {
  const { player, artPoints, resetAll, discoveries } = useGame()
  const [isRandomizing, setIsRandomizing] = useState(false)

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
            <span className="text-black/50">Distance</span>
            <span className="font-bold text-black">{player.totalDistance ? (player.totalDistance / 1000).toFixed(1) : '0'} km</span>
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

      <p className="text-center text-xs text-black/20 pb-4">v3.0.4</p>
    </div>
  )
}

export default Profile
