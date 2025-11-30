import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { Sparkles, Users, Map, Camera, ChevronRight, Shuffle } from 'lucide-react'

// Random name generator
const ADJECTIVES = ['Swift', 'Bold', 'Neon', 'Urban', 'Wild', 'Cosmic', 'Pixel', 'Mystic', 'Shadow', 'Electric']
const NOUNS = ['Artist', 'Hunter', 'Rebel', 'Ghost', 'Ninja', 'Pirate', 'Wizard', 'Rogue', 'Phoenix', 'Storm']

function generateRandomName() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  const num = Math.floor(Math.random() * 99) + 1
  return `${adj}${noun}${num}`
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { player, joinTeam, setPlayerName } = useGame()
  const [step, setStep] = useState(0) // 0: intro, 1: name, 2: team, 3: tutorial
  const [name, setName] = useState(player.name || '')
  const [selectedTeam, setSelectedTeam] = useState(null)
  
  // Skip if already onboarded
  useEffect(() => {
    if (player.team && player.name && player.name !== 'Street Artist') {
      navigate('/map')
    }
  }, [])
  
  const handleGenerateName = () => {
    setName(generateRandomName())
  }
  
  const handleNext = () => {
    if (step === 1 && name.trim()) {
      setPlayerName(name.trim())
    }
    if (step === 2 && selectedTeam) {
      joinTeam(selectedTeam)
    }
    if (step === 3) {
      navigate('/map')
      return
    }
    setStep(step + 1)
  }
  
  const canProceed = () => {
    if (step === 1) return name.trim().length >= 2
    if (step === 2) return selectedTeam !== null
    return true
  }

  return (
    <div className="h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121a] to-[#0a0a0f] flex flex-col overflow-hidden">
      {/* Progress dots */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {[0, 1, 2, 3].map(i => (
          <div 
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === step ? 'bg-white w-6' : i < step ? 'bg-white/60' : 'bg-white/20'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 0: Intro */}
        {step === 0 && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-8 shadow-2xl shadow-purple-500/30"
            >
              <Sparkles size={48} className="text-white" />
            </motion.div>
            
            <h1 className="text-3xl font-bold mb-4">Street Art CTF</h1>
            <p className="text-white/60 text-lg mb-2">Capture the Flag</p>
            <p className="text-white/40 max-w-xs mb-8">
              Scan real street art to capture territory for your team. The city is your battlefield.
            </p>
            
            <div className="flex flex-col gap-4 w-full max-w-xs">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Camera size={24} className="text-blue-400" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Scan Art</div>
                  <div className="text-sm text-white/50">Find & capture street art</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <Map size={24} className="text-green-400" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Control Territory</div>
                  <div className="text-sm text-white/50">Expand your team's area</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <Users size={24} className="text-yellow-400" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Win Together</div>
                  <div className="text-sm text-white/50">Lead your team to victory</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 1: Name */}
        {step === 1 && (
          <motion.div
            key="name"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-y-auto"
          >
            <h1 className="text-2xl font-bold mb-2">What's your name?</h1>
            <p className="text-white/50 mb-8">This is how others will see you</p>
            
            <div className="w-full max-w-xs mb-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                maxLength={20}
                className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-center text-xl font-medium placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
            
            <button
              onClick={handleGenerateName}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-colors"
            >
              <Shuffle size={16} />
              Generate random name
            </button>
          </motion.div>
        )}

        {/* Step 2: Team */}
        {step === 2 && (
          <motion.div
            key="team"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-y-auto"
          >
            <h1 className="text-2xl font-bold mb-2">Choose your team</h1>
            <p className="text-white/50 mb-8">Fight for territory together</p>
            
            <div className="flex gap-4 w-full max-w-sm">
              {/* Red Team */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedTeam('red')}
                className={`flex-1 p-6 rounded-2xl border-2 transition-all ${
                  selectedTeam === 'red' 
                    ? 'bg-red-500/20 border-red-500 shadow-lg shadow-red-500/30' 
                    : 'bg-white/5 border-white/10 hover:border-red-500/50'
                }`}
              >
                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
                  selectedTeam === 'red' ? 'bg-red-500' : 'bg-red-500/30'
                }`}>
                  <span className="text-3xl">🔴</span>
                </div>
                <div className="font-bold text-lg mb-1" style={{ color: '#ff6b6b' }}>
                  Red Team
                </div>
                <div className="text-sm text-white/50">The Flames</div>
              </motion.button>
              
              {/* Blue Team */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedTeam('blue')}
                className={`flex-1 p-6 rounded-2xl border-2 transition-all ${
                  selectedTeam === 'blue' 
                    ? 'bg-blue-500/20 border-blue-500 shadow-lg shadow-blue-500/30' 
                    : 'bg-white/5 border-white/10 hover:border-blue-500/50'
                }`}
              >
                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
                  selectedTeam === 'blue' ? 'bg-blue-500' : 'bg-blue-500/30'
                }`}>
                  <span className="text-3xl">🔵</span>
                </div>
                <div className="font-bold text-lg mb-1" style={{ color: '#4dabf7' }}>
                  Blue Team
                </div>
                <div className="text-sm text-white/50">The Waves</div>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Tutorial */}
        {step === 3 && (
          <motion.div
            key="tutorial"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-y-auto"
          >
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 ${
              selectedTeam === 'red' ? 'bg-red-500/20' : 'bg-blue-500/20'
            }`}>
              <span className="text-4xl">{selectedTeam === 'red' ? '🔴' : '🔵'}</span>
            </div>
            
            <h1 className="text-2xl font-bold mb-2">Welcome, {name}!</h1>
            <p className="text-white/50 mb-8">
              You're on Team <span style={{ color: selectedTeam === 'red' ? '#ff6b6b' : '#4dabf7' }} className="font-bold">
                {selectedTeam === 'red' ? 'Red' : 'Blue'}
              </span>
            </p>
            
            <div className="w-full max-w-xs space-y-4 mb-8">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-left">
                <div className="font-medium mb-1">🎯 How to Play</div>
                <div className="text-sm text-white/50">
                  Find street art around you. Point your camera at it to scan and capture it for your team.
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-left">
                <div className="font-medium mb-1">📍 Check the Map</div>
                <div className="text-sm text-white/50">
                  See which art is nearby and which territories each team controls.
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-left">
                <div className="font-medium mb-1">⚡ Score Points</div>
                <div className="text-sm text-white/50">
                  Each capture earns points. Big murals = more points. Steal from enemies for bonus!
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom button */}
      <div className="p-4 pb-6 flex-shrink-0" style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          disabled={!canProceed()}
          className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
            canProceed()
              ? 'bg-white text-black'
              : 'bg-white/10 text-white/30 cursor-not-allowed'
          }`}
        >
          {step === 3 ? "Let's Go!" : 'Continue'}
          <ChevronRight size={20} />
        </motion.button>
      </div>
    </div>
  )
}
