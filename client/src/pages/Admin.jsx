import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { doc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useGame } from '../context/GameContext'
import { ART_POINTS, SIZES, STATUS, HOODS } from '../data/pragueMap'
import { 
  Shield, Ghost, Flame, Trash2, RefreshCw, MapPin, 
  ChevronLeft, Eye, EyeOff, Zap, Users, CheckCircle, XCircle
} from 'lucide-react'

const ADMIN_PASSWORD = '123' // Simple password protection

export default function Admin() {
  const navigate = useNavigate()
  const { artPoints, allPlayers, teamScores } = useGame()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [selectedHood, setSelectedHood] = useState('all')
  const [loading, setLoading] = useState({})
  const [message, setMessage] = useState(null)
  
  // Check if already authenticated this session
  useEffect(() => {
    const auth = sessionStorage.getItem('admin-auth')
    if (auth === 'true') setIsAuthenticated(true)
  }, [])
  
  const handleLogin = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      sessionStorage.setItem('admin-auth', 'true')
    } else {
      setMessage({ type: 'error', text: 'Wrong password' })
      setTimeout(() => setMessage(null), 2000)
    }
  }
  
  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }
  
  // Toggle point status (active/ghost)
  const toggleStatus = async (pointId, currentStatus) => {
    setLoading(prev => ({ ...prev, [pointId]: true }))
    try {
      const newStatus = currentStatus === 'ghost' ? 'active' : 'ghost'
      await setDoc(doc(db, 'streetart-points-meta', pointId), {
        status: newStatus,
        updatedAt: new Date()
      }, { merge: true })
      showMessage('success', `Point ${pointId} set to ${newStatus}`)
    } catch (err) {
      showMessage('error', 'Failed to update status')
      console.error(err)
    }
    setLoading(prev => ({ ...prev, [pointId]: false }))
  }
  
  // Reset point ownership
  const resetOwnership = async (pointId) => {
    setLoading(prev => ({ ...prev, [`reset-${pointId}`]: true }))
    try {
      await deleteDoc(doc(db, 'streetart-captures', pointId))
      showMessage('success', `Ownership reset for ${pointId}`)
    } catch (err) {
      showMessage('error', 'Failed to reset ownership')
      console.error(err)
    }
    setLoading(prev => ({ ...prev, [`reset-${pointId}`]: false }))
  }
  
  // Reset ALL captures
  const resetAllCaptures = async () => {
    if (!confirm('Are you sure? This will reset ALL captures!')) return
    setLoading(prev => ({ ...prev, resetAll: true }))
    try {
      const snapshot = await getDocs(collection(db, 'streetart-captures'))
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)
      showMessage('success', 'All captures reset!')
    } catch (err) {
      showMessage('error', 'Failed to reset all captures')
      console.error(err)
    }
    setLoading(prev => ({ ...prev, resetAll: false }))
  }
  
  // Reset ALL players
  const resetAllPlayers = async () => {
    if (!confirm('Are you sure? This will delete ALL player data!')) return
    setLoading(prev => ({ ...prev, resetPlayers: true }))
    try {
      const snapshot = await getDocs(collection(db, 'streetart-players'))
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)
      showMessage('success', 'All players reset!')
    } catch (err) {
      showMessage('error', 'Failed to reset players')
      console.error(err)
    }
    setLoading(prev => ({ ...prev, resetPlayers: false }))
  }
  
  // Filter points by hood
  const filteredPoints = selectedHood === 'all' 
    ? artPoints 
    : artPoints.filter(p => p.hood === selectedHood)
  
  // Stats
  const stats = {
    total: artPoints.length,
    captured: artPoints.filter(p => p.capturedBy).length,
    red: artPoints.filter(p => p.capturedBy === 'red').length,
    blue: artPoints.filter(p => p.capturedBy === 'blue').length,
    ghost: ART_POINTS.filter(p => p.status === 'ghost').length,
    players: allPlayers.length
  }
  
  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-500/20 flex items-center justify-center">
              <Shield size={32} className="text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold">Admin Access</h1>
            <p className="text-white/40 text-sm mt-1">God Mode Panel</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-center focus:outline-none focus:border-purple-500/50"
            />
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-purple-500 text-white font-bold"
            >
              Enter
            </button>
          </form>
          
          {message && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mt-4 p-3 rounded-lg text-center text-sm ${
                message.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
              }`}
            >
              {message.text}
            </motion.div>
          )}
          
          <button
            onClick={() => navigate(-1)}
            className="mt-6 w-full py-2 text-white/40 text-sm"
          >
            ← Back
          </button>
        </motion.div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ChevronLeft size={24} className="text-white/70" />
          </button>
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-purple-400" />
            <span className="font-bold">God Mode</span>
          </div>
          <div className="w-10" />
        </div>
      </div>
      
      {/* Message toast */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`fixed top-16 left-4 right-4 z-50 p-3 rounded-xl text-center text-sm font-medium ${
            message.type === 'error' ? 'bg-red-500/90' : 'bg-green-500/90'
          }`}
        >
          {message.text}
        </motion.div>
      )}
      
      {/* Stats */}
      <div className="p-4 grid grid-cols-3 gap-2">
        <div className="p-3 rounded-xl bg-white/5 text-center">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-xs text-white/40">Points</div>
        </div>
        <div className="p-3 rounded-xl bg-red-500/20 text-center">
          <div className="text-2xl font-bold text-red-400">{stats.red}</div>
          <div className="text-xs text-red-400/60">Red</div>
        </div>
        <div className="p-3 rounded-xl bg-blue-500/20 text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.blue}</div>
          <div className="text-xs text-blue-400/60">Blue</div>
        </div>
        <div className="p-3 rounded-xl bg-white/5 text-center">
          <div className="text-2xl font-bold text-white/60">{stats.ghost}</div>
          <div className="text-xs text-white/40">Ghost</div>
        </div>
        <div className="p-3 rounded-xl bg-white/5 text-center">
          <div className="text-2xl font-bold">{stats.players}</div>
          <div className="text-xs text-white/40">Players</div>
        </div>
        <div className="p-3 rounded-xl bg-white/5 text-center">
          <div className="text-2xl font-bold">{stats.captured}</div>
          <div className="text-xs text-white/40">Captured</div>
        </div>
      </div>
      
      {/* Danger Zone */}
      <div className="px-4 mb-6">
        <h2 className="text-sm font-bold text-red-400 mb-2 flex items-center gap-2">
          <Zap size={14} />
          Danger Zone
        </h2>
        <div className="flex gap-2">
          <button
            onClick={resetAllCaptures}
            disabled={loading.resetAll}
            className="flex-1 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-medium text-sm flex items-center justify-center gap-2"
          >
            {loading.resetAll ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Reset Captures
          </button>
          <button
            onClick={resetAllPlayers}
            disabled={loading.resetPlayers}
            className="flex-1 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-medium text-sm flex items-center justify-center gap-2"
          >
            {loading.resetPlayers ? <RefreshCw size={16} className="animate-spin" /> : <Users size={16} />}
            Reset Players
          </button>
        </div>
      </div>
      
      {/* Hood filter */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedHood('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              selectedHood === 'all' ? 'bg-white text-black' : 'bg-white/10 text-white/60'
            }`}
          >
            All
          </button>
          {Object.values(HOODS).map(hood => (
            <button
              key={hood.id}
              onClick={() => setSelectedHood(hood.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                selectedHood === hood.id ? 'bg-white text-black' : 'bg-white/10 text-white/60'
              }`}
            >
              {hood.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Points list */}
      <div className="px-4 space-y-2">
        <h2 className="text-sm font-bold text-white/60 mb-2">
          Art Points ({filteredPoints.length})
        </h2>
        
        {filteredPoints.map(point => {
          const basePoint = ART_POINTS.find(p => p.id === point.id)
          const isGhost = basePoint?.status === 'ghost'
          
          return (
            <div 
              key={point.id}
              className={`p-4 rounded-xl border ${
                isGhost ? 'bg-white/5 border-white/10 opacity-60' : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{point.name}</span>
                    {isGhost && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-white/40">GHOST</span>
                    )}
                  </div>
                  <div className="text-xs text-white/40 mt-0.5">
                    {point.id} • {point.area} • {point.size} • {SIZES[point.size]?.points}pts
                  </div>
                </div>
                {point.capturedBy && (
                  <div 
                    className="px-2 py-1 rounded text-xs font-bold"
                    style={{ 
                      backgroundColor: point.capturedBy === 'red' ? '#ff6b6b20' : '#4dabf720',
                      color: point.capturedBy === 'red' ? '#ff6b6b' : '#4dabf7'
                    }}
                  >
                    {point.capturedBy.toUpperCase()}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => toggleStatus(point.id, basePoint?.status)}
                  disabled={loading[point.id]}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 ${
                    isGhost 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-white/10 text-white/60'
                  }`}
                >
                  {loading[point.id] ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : isGhost ? (
                    <><Eye size={14} /> Make Active</>
                  ) : (
                    <><Ghost size={14} /> Make Ghost</>
                  )}
                </button>
                
                {point.capturedBy && (
                  <button
                    onClick={() => resetOwnership(point.id)}
                    disabled={loading[`reset-${point.id}`]}
                    className="py-2 px-3 rounded-lg bg-white/10 text-white/60 text-xs font-medium flex items-center gap-1.5"
                  >
                    {loading[`reset-${point.id}`] ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <><XCircle size={14} /> Reset</>
                    )}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Players section */}
      <div className="px-4 mt-8">
        <h2 className="text-sm font-bold text-white/60 mb-2 flex items-center gap-2">
          <Users size={14} />
          Players ({allPlayers.length})
        </h2>
        <div className="space-y-2">
          {allPlayers.map(player => (
            <div 
              key={player.id}
              className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
            >
              <div>
                <div className="font-medium">{player.name}</div>
                <div className="text-xs text-white/40">{player.captures || 0} captures</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{player.score || 0}</span>
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: player.team === 'red' ? '#ff6b6b' : '#4dabf7' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
