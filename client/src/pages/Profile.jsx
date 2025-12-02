import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useGame, TEAM_COLORS } from '../context/GameContext'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { ART_POINTS, getPointValue } from '../data/pragueMap'
import { 
  Trophy, Target, Flame, RotateCcw, Shuffle, Zap, MapPin, CheckCircle2,
  Swords, Flag, Footprints, TrendingUp, Map, Building2
} from 'lucide-react'

// District definitions
const DISTRICTS = {
  'Vysocany': { name: 'Vysočany', color: '#4dabf7' },
  'Hloubetin': { name: 'Hloubětín', color: '#ff6b6b' },
  'Podebrady': { name: 'Poděbrady', color: '#51cf66' }
}

function Profile() {
  const { player, artPoints, resetAll, discoveries } = useGame()
  const [isRandomizing, setIsRandomizing] = useState(false)

  // Get player's captured art with points
  const capturedArt = artPoints?.filter(art => 
    player.capturedArt.includes(art.id)
  ) || []
  
  // Calculate district progress
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
  
  // Total city progress
  const totalProgress = useMemo(() => {
    const total = ART_POINTS.length
    const found = Object.keys(discoveries || {}).length
    return { total, found, percent: Math.round((found / total) * 100) }
  }, [discoveries])

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
    <div className="flex-1 overflow-y-auto pb-24 px-4 pt-6">
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${teamColor}20` }}
        >
          <span className="text-xl font-bold" style={{ color: teamColor }}>
            {player.name?.charAt(0)?.toUpperCase() || '?'}
          </span>
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">{player.name}</h1>
          <p className="text-xs text-white/40">{teamName}</p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-center">
          <Trophy size={18} className="mx-auto mb-1.5 text-yellow-500/80" />
          <p className="text-xl font-semibold text-white">{player.score}</p>
          <p className="text-[9px] text-white/30 uppercase">Score</p>
        </div>
        
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-center">
          <Target size={18} className="mx-auto mb-1.5 text-green-500/80" />
          <p className="text-xl font-semibold text-white">{player.captureCount || capturedArt.length}</p>
          <p className="text-[9px] text-white/30 uppercase">Captures</p>
        </div>
        
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-center">
          <Flame size={18} className="mx-auto mb-1.5 text-orange-500/80" />
          <p className="text-xl font-semibold text-white">{player.maxStreak || 0}</p>
          <p className="text-[9px] text-white/30 uppercase">Best Streak</p>
        </div>
      </div>

      {/* Collection Progress */}
      <div className="mb-6">
        <h2 className="text-xs font-medium text-white/30 uppercase tracking-wider mb-3">
          Collection
        </h2>
        
        {/* City Progress */}
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 mb-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Map size={14} className="text-white/40" />
              <span className="text-sm text-white/80">Prague</span>
            </div>
            <span className="text-xs text-white/40">{totalProgress.found}/{totalProgress.total}</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ backgroundColor: teamColor, width: `${totalProgress.percent}%` }}
            />
          </div>
        </div>
        
        {/* Districts */}
        <div className="space-y-2">
          {Object.entries(DISTRICTS).map(([key, district]) => {
            const prog = districtProgress[key] || { found: 0, total: 0, complete: false }
            const percent = prog.total > 0 ? Math.round((prog.found / prog.total) * 100) : 0
            return (
              <div
                key={key}
                className={`p-3 rounded-lg border flex items-center gap-3 ${
                  prog.complete 
                    ? 'bg-green-500/10 border-green-500/20' 
                    : 'bg-white/[0.02] border-white/5'
                }`}
              >
                <div 
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${district.color}15` }}
                >
                  {prog.complete 
                    ? <CheckCircle2 size={18} className="text-green-400" /> 
                    : <Building2 size={18} style={{ color: district.color }} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white/90">{district.name}</span>
                    <span className="text-xs text-white/40">{prog.found}/{prog.total}</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        backgroundColor: prog.complete ? '#22c55e' : district.color,
                        width: `${percent}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-6">
        <h2 className="text-xs font-medium text-white/30 uppercase tracking-wider mb-3">
          Stats
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <Swords size={16} className="text-purple-400" />
            <div>
              <p className="text-base font-semibold text-white">{player.recaptureCount || 0}</p>
              <p className="text-[10px] text-white/40">Recaptures</p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <Flag size={16} className="text-blue-400" />
            <div>
              <p className="text-base font-semibold text-white">{player.firstCaptureCount || 0}</p>
              <p className="text-[10px] text-white/40">First Captures</p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <Footprints size={16} className="text-green-400" />
            <div>
              <p className="text-base font-semibold text-white">{player.totalDistance ? (player.totalDistance / 1000).toFixed(1) : '0'} km</p>
              <p className="text-[10px] text-white/40">Distance</p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <TrendingUp size={16} className="text-orange-400" />
            <div>
              <p className="text-base font-semibold text-white">{player.streak || 0}</p>
              <p className="text-[10px] text-white/40">Current Streak</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Discoveries */}
      {capturedArt.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-medium text-white/30 uppercase tracking-wider mb-3">
            Recent Discoveries
          </h2>
          <div className="space-y-1">
            {capturedArt.slice(0, 5).map((art) => (
              <div
                key={art.id}
                className="p-2 rounded-lg bg-white/[0.02] border border-white/5 flex items-center gap-3"
              >
                <div 
                  className="w-8 h-8 rounded flex items-center justify-center"
                  style={{ backgroundColor: `${teamColor}15` }}
                >
                  <Target size={14} style={{ color: teamColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 truncate">{art.name}</p>
                  <p className="text-[10px] text-white/30">{art.area}</p>
                </div>
              </div>
            ))}
            {capturedArt.length > 5 && (
              <p className="text-[10px] text-white/30 text-center pt-1">
                +{capturedArt.length - 5} more
              </p>
            )}
          </div>
        </div>
      )}

      {/* Admin Tools */}
      <div className="mb-6">
        <h2 className="text-xs font-medium text-white/30 uppercase tracking-wider mb-3">
          Admin
        </h2>
        <div className="space-y-2">
          <button
            onClick={randomizeTeams}
            disabled={isRandomizing}
            className="w-full p-3 rounded-lg bg-white/[0.02] border border-white/5 flex items-center gap-3 text-white/60 hover:text-white/80 transition-colors disabled:opacity-50"
          >
            <Shuffle size={16} />
            <span className="text-sm">
              {isRandomizing ? 'Randomizing...' : 'Randomize Territories'}
            </span>
          </button>
          
          <button
            onClick={resetAll}
            className="w-full p-3 rounded-lg bg-white/[0.02] border border-white/5 flex items-center gap-3 text-white/40 hover:text-red-400 transition-colors"
          >
            <RotateCcw size={16} />
            <span className="text-sm">Reset All Data</span>
          </button>
        </div>
      </div>

      <p className="text-center text-[10px] text-white/20">
        v2.1.0
      </p>
    </div>
  )
}

export default Profile
