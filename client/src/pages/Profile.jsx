import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGame, TEAM_COLORS } from '../context/GameContext'
import { 
  User, Settings, Palette, MapPin, Trophy, 
  ChevronRight, Camera, LogOut, Bell, Shield 
} from 'lucide-react'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      className="glass rounded-xl p-4 text-center"
      whileHover={{ scale: 1.02 }}
    >
      <Icon size={24} className="mx-auto mb-2" style={{ color }} />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </motion.div>
  )
}

function CapturedArtItem({ art }) {
  return (
    <motion.div
      className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${TEAM_COLORS[art.capturedBy]?.hex}30` }}
      >
        <Palette size={20} style={{ color: TEAM_COLORS[art.capturedBy]?.hex }} />
      </div>
      <div className="flex-1">
        <p className="font-medium text-sm">{art.name}</p>
        <p className="text-xs text-gray-400">{art.points} pts</p>
      </div>
      <ChevronRight size={18} className="text-gray-500" />
    </motion.div>
  )
}

function SettingsItem({ icon: Icon, label, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
      whileTap={{ scale: 0.98 }}
    >
      <Icon size={20} className="text-gray-400" />
      <span className="flex-1 text-left">{label}</span>
      <ChevronRight size={18} className="text-gray-500" />
    </motion.button>
  )
}

function Profile() {
  const { player, streetArt, joinTeam } = useGame()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(player.name)

  // Get player's captured art
  const capturedArt = streetArt.filter(art => 
    player.capturedArt.includes(art.id)
  )

  const teamColor = player.team ? TEAM_COLORS[player.team].hex : '#64748b'

  return (
    <motion.div
      className="flex-1 overflow-y-auto pb-20 px-4 pt-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Profile Header */}
      <div className="text-center mb-6">
        <motion.div
          className="relative inline-block"
          whileHover={{ scale: 1.05 }}
        >
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ 
              background: `linear-gradient(135deg, ${teamColor}50, ${teamColor}20)`,
              border: `3px solid ${teamColor}`
            }}
          >
            <User size={40} style={{ color: teamColor }} />
          </div>
          <button className="absolute bottom-2 right-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Camera size={14} />
          </button>
        </motion.div>
        
        {isEditing ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setIsEditing(false)}
            className="text-xl font-bold bg-transparent border-b-2 border-white/30 text-center outline-none"
            autoFocus
          />
        ) : (
          <h1 
            className="text-xl font-bold cursor-pointer"
            onClick={() => setIsEditing(true)}
          >
            {player.name}
          </h1>
        )}
        
        {player.team && (
          <p className="text-sm mt-1" style={{ color: teamColor }}>
            {player.team.charAt(0).toUpperCase() + player.team.slice(1)} Team
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard 
          icon={Trophy} 
          label="Score" 
          value={player.score} 
          color="#eab308" 
        />
        <StatCard 
          icon={Palette} 
          label="Captures" 
          value={capturedArt.length} 
          color="#22c55e" 
        />
        <StatCard 
          icon={MapPin} 
          label="Sectors" 
          value="3" 
          color="#3b82f6" 
        />
      </div>

      {/* Captured Art */}
      {capturedArt.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
            <Palette size={16} /> YOUR CAPTURES
          </h2>
          <div className="space-y-2">
            {capturedArt.map(art => (
              <CapturedArtItem key={art.id} art={art} />
            ))}
          </div>
        </div>
      )}

      {/* Team Selection (if no team) */}
      {!player.team && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-400 mb-3">
            SELECT YOUR TEAM
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {['red', 'blue', 'green', 'yellow'].map(team => (
              <motion.button
                key={team}
                onClick={() => joinTeam(team)}
                className="p-4 rounded-xl glass text-center"
                style={{ borderColor: TEAM_COLORS[team].hex, borderWidth: 2 }}
                whileTap={{ scale: 0.95 }}
              >
                <div 
                  className="w-8 h-8 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: TEAM_COLORS[team].hex }}
                />
                <p className="text-sm font-medium capitalize">{team}</p>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
          <Settings size={16} /> SETTINGS
        </h2>
        <SettingsItem icon={Bell} label="Notifications" />
        <SettingsItem icon={Shield} label="Privacy" />
        <SettingsItem icon={Settings} label="Preferences" />
        <SettingsItem 
          icon={LogOut} 
          label="Sign Out" 
          onClick={() => {/* Handle logout */}}
        />
      </div>

      {/* App Version */}
      <p className="text-center text-xs text-gray-500 mt-6">
        Street Art CTF v1.0.0
      </p>
    </motion.div>
  )
}

export default Profile
