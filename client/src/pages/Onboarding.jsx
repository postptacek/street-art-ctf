import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { Users, Map, Camera, ChevronRight, Shuffle, Target, Zap } from 'lucide-react'
import ChumpAnimation from '../components/ChumpAnimation'

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
  const { player, joinTeam, setPlayerName, allPlayers } = useGame()
  const [step, setStep] = useState(0) // 0: intro, 1: name, 2: tutorial (team auto-assigned)
  const [name, setName] = useState(() => player.name && player.name !== 'Street Artist' ? player.name : generateRandomName())
  const [assignedTeam, setAssignedTeam] = useState(null)
  
  // Skip if already onboarded
  useEffect(() => {
    if (player.team && player.name && player.name !== 'Street Artist') {
      navigate('/map')
    }
  }, [])
  
  // Auto-assign team based on player count balance
  useEffect(() => {
    const redCount = allPlayers.filter(p => p.team === 'red').length
    const blueCount = allPlayers.filter(p => p.team === 'blue').length
    // Assign to team with fewer players, or random if equal
    const team = redCount < blueCount ? 'red' : blueCount < redCount ? 'blue' : (Math.random() < 0.5 ? 'red' : 'blue')
    setAssignedTeam(team)
  }, [allPlayers])
  
  const handleGenerateName = () => {
    setName(generateRandomName())
  }
  
  const handleNext = () => {
    if (step === 1 && name.trim()) {
      setPlayerName(name.trim())
      // Auto-join the balanced team
      if (assignedTeam) {
        joinTeam(assignedTeam)
      }
    }
    if (step === 2) {
      navigate('/map')
      return
    }
    setStep(step + 1)
  }
  
  const canProceed = () => {
    if (step === 1) return name.trim().length >= 2 && assignedTeam
    return true
  }

  return (
    <div className="h-screen bg-[#0a0a0f] flex flex-col overflow-hidden">
      {/* Progress dots */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {[0, 1, 2].map(i => (
          <div 
            key={i}
            className={`h-1.5 rounded-sm transition-all duration-300 ${
              i === step ? 'bg-white w-8' : i < step ? 'bg-white/60 w-1.5' : 'bg-white/20 w-1.5'
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
              className="mb-6"
            >
              <ChumpAnimation size={140} />
            </motion.div>
            
            <h1 className="text-3xl font-bold mb-3">Street Art CTF</h1>
            <p className="text-white/40 max-w-xs mb-8">
              Scan real street art to capture territory for your team. The city is your battlefield.
            </p>
            
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Camera size={20} className="text-white/70" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">Scan Art</div>
                  <div className="text-xs text-white/40">Find and capture street art</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Map size={20} className="text-white/70" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">Control Territory</div>
                  <div className="text-xs text-white/40">Expand your team's area</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Users size={20} className="text-white/70" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">Win Together</div>
                  <div className="text-xs text-white/40">Lead your team to victory</div>
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
            <p className="text-white/40 mb-8">This is how others will see you</p>
            
            <div className="w-full max-w-xs mb-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                maxLength={20}
                className="w-full px-4 py-4 rounded-lg bg-white/5 border border-white/10 text-center text-xl font-medium placeholder:text-white/30 focus:outline-none focus:border-white/30"
              />
            </div>
            
            <button
              onClick={handleGenerateName}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 transition-colors"
            >
              <Shuffle size={16} />
              Generate random name
            </button>
          </motion.div>
        )}

        {/* Step 2: Tutorial (team auto-assigned) */}
        {step === 2 && (
          <motion.div
            key="tutorial"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-y-auto"
          >
            <div className="mb-4">
              <ChumpAnimation size={100} />
            </div>
            
            <h1 className="text-2xl font-bold mb-2">Welcome, {name}!</h1>
            <p className="text-white/40 mb-8">
              You've been assigned to Team <span style={{ color: assignedTeam === 'red' ? '#ff6b6b' : '#4dabf7' }} className="font-bold">
                {assignedTeam === 'red' ? 'Red' : 'Blue'}
              </span> for balance
            </p>
            
            <div className="w-full max-w-xs space-y-3 mb-8">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-left">
                <div className="font-medium mb-1 flex items-center gap-2">
                  <Target size={14} className="text-white/50" />
                  How to Play
                </div>
                <div className="text-xs text-white/40">
                  Find street art around you. Point your camera at it to scan and capture it for your team.
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-left">
                <div className="font-medium mb-1 flex items-center gap-2">
                  <Map size={14} className="text-white/50" />
                  Check the Map
                </div>
                <div className="text-xs text-white/40">
                  See which art is nearby and which territories each team controls.
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-left">
                <div className="font-medium mb-1 flex items-center gap-2">
                  <Zap size={14} className="text-white/50" />
                  Score Points
                </div>
                <div className="text-xs text-white/40">
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
          className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all ${
            canProceed()
              ? 'bg-white text-black'
              : 'bg-white/10 text-white/30 cursor-not-allowed'
          }`}
        >
          {step === 2 ? "Let's Go" : 'Continue'}
          <ChevronRight size={20} />
        </motion.button>
      </div>
    </div>
  )
}
