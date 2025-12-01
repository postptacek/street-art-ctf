import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGame, GAME_MODES } from '../context/GameContext'
import { Users, Map, Camera, ChevronRight, Shuffle, Target, Zap, Compass, Swords, Star, Trophy } from 'lucide-react'
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
  const { player, joinTeam, setPlayerName, setGameMode, gameMode, allPlayers } = useGame()
  // Steps: 0=intro, 1=name, 2=mode select, 3=team reveal (team mode only), 4=tutorial
  const [step, setStep] = useState(0)
  const [name, setName] = useState(() => player.name && player.name !== 'Street Artist' ? player.name : generateRandomName())
  const [selectedMode, setSelectedMode] = useState(GAME_MODES.SOLO)
  const [assignedTeam, setAssignedTeam] = useState(null)
  
  // Skip if already onboarded (has name set)
  useEffect(() => {
    if (player.name && player.name !== 'Street Artist' && player.discoveryCount > 0) {
      navigate('/map')
    }
  }, [])
  
  // Auto-assign team based on player count balance (for team mode)
  useEffect(() => {
    const redCount = allPlayers.filter(p => p.team === 'red').length
    const blueCount = allPlayers.filter(p => p.team === 'blue').length
    const team = redCount < blueCount ? 'red' : blueCount < redCount ? 'blue' : (Math.random() < 0.5 ? 'red' : 'blue')
    setAssignedTeam(team)
  }, [allPlayers])
  
  const handleGenerateName = () => {
    setName(generateRandomName())
  }
  
  const handleNext = () => {
    if (step === 1 && name.trim()) {
      setPlayerName(name.trim())
    }
    
    if (step === 2) {
      // Set game mode
      setGameMode(selectedMode)
      
      if (selectedMode === GAME_MODES.TEAM && assignedTeam) {
        // Team mode - join team and show reveal
        joinTeam(assignedTeam)
        setStep(3) // Go to team reveal
        return
      } else {
        // Solo mode - skip team reveal, go to tutorial
        setStep(4)
        return
      }
    }
    
    // Final step
    if ((selectedMode === GAME_MODES.TEAM && step === 4) || 
        (selectedMode === GAME_MODES.SOLO && step === 4)) {
      navigate('/map')
      return
    }
    
    if (step === 3) {
      // After team reveal, go to tutorial
      setStep(4)
      return
    }
    
    setStep(step + 1)
  }
  
  const canProceed = () => {
    if (step === 1) return name.trim().length >= 2
    if (step === 2) return selectedMode !== null
    return true
  }
  
  const teamColor = assignedTeam === 'red' ? '#ff6b6b' : '#4dabf7'
  const teamName = assignedTeam === 'red' ? 'Red' : 'Blue'
  
  // Calculate total steps based on mode
  const totalSteps = selectedMode === GAME_MODES.TEAM ? 5 : 4 // Solo skips team reveal
  const getStepIndex = () => {
    if (selectedMode === GAME_MODES.SOLO && step > 2) return step - 1 // Adjust for skipped step
    return step
  }

  return (
    <div className="h-screen bg-[#0a0a0f] flex flex-col overflow-hidden">
      {/* Progress dots */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div 
            key={i}
            className={`h-1.5 rounded-sm transition-all duration-300 ${
              getStepIndex() === i ? 'bg-white w-8' : getStepIndex() > i ? 'bg-white/60 w-1.5' : 'bg-white/20 w-1.5'
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

        {/* Step 2: Game Mode Selection */}
        {step === 2 && (
          <motion.div
            key="mode-select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-y-auto"
          >
            <h1 className="text-2xl font-bold mb-2">Choose Your Mode</h1>
            <p className="text-white/40 mb-8 max-w-xs">How do you want to explore?</p>
            
            <div className="w-full max-w-sm space-y-4">
              {/* Solo Mode */}
              <motion.button
                onClick={() => setSelectedMode(GAME_MODES.SOLO)}
                className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
                  selectedMode === GAME_MODES.SOLO
                    ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/50'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    selectedMode === GAME_MODES.SOLO
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                      : 'bg-white/10'
                  }`}>
                    <Compass size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">Solo Explorer</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300">Recommended</span>
                    </div>
                    <p className="text-sm text-white/50 mt-1">
                      Discover street art at your own pace. Build your personal collection without competition.
                    </p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-white/40">
                      <span className="flex items-center gap-1"><Star size={12} /> Personal Portfolio</span>
                      <span className="flex items-center gap-1"><Trophy size={12} /> Achievements</span>
                    </div>
                  </div>
                </div>
              </motion.button>
              
              {/* Team Mode */}
              <motion.button
                onClick={() => setSelectedMode(GAME_MODES.TEAM)}
                className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
                  selectedMode === GAME_MODES.TEAM
                    ? 'bg-gradient-to-br from-red-500/20 to-blue-500/20 border-blue-500/50'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    selectedMode === GAME_MODES.TEAM
                      ? 'bg-gradient-to-br from-red-500 to-blue-500'
                      : 'bg-white/10'
                  }`}>
                    <Swords size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">Team Battle</h3>
                    <p className="text-sm text-white/50 mt-1">
                      Join a team and compete for territory. Capture flags and defend your turf.
                    </p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-white/40">
                      <span className="flex items-center gap-1"><Users size={12} /> Team Play</span>
                      <span className="flex items-center gap-1"><Map size={12} /> Territory Control</span>
                    </div>
                  </div>
                </div>
              </motion.button>
            </div>
            
            <p className="text-xs text-white/30 mt-6">
              You can switch modes anytime in settings
            </p>
          </motion.div>
        )}

        {/* Step 3: Team Reveal - Full Screen (Team mode only) */}
        {step === 3 && selectedMode === GAME_MODES.TEAM && (
          <motion.div
            key="team-reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden"
          >
            {/* Background glow */}
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.15 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div 
                className="w-[600px] h-[600px] rounded-full blur-3xl"
                style={{ backgroundColor: teamColor }}
              />
            </motion.div>
            
            {/* Content */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="relative z-10"
            >
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-white/50 text-lg mb-2"
              >
                Welcome, {name}!
              </motion.p>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-white/40 text-sm mb-6"
              >
                You've been assigned to
              </motion.p>
              
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
              >
                <h1 
                  className="text-6xl font-bold mb-4"
                  style={{ color: teamColor }}
                >
                  Team {teamName}
                </h1>
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="text-white/30 text-sm"
              >
                {assignedTeam === 'red' ? 'The Flames 🔥' : 'The Waves 🌊'}
              </motion.p>
            </motion.div>
          </motion.div>
        )}

        {/* Step 4: Tutorial */}
        {step === 4 && (
          <motion.div
            key="tutorial"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-y-auto"
          >
            <h1 className="text-2xl font-bold mb-2">
              {selectedMode === GAME_MODES.SOLO ? 'How to Explore' : 'How to Play'}
            </h1>
            <p className="text-white/40 mb-8 text-sm">It's simple!</p>
            
            <div className="w-full max-w-sm space-y-4">
              {/* Step 1 - Find & Scan (both modes) */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center flex-shrink-0">
                  <Camera size={24} className="text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-base mb-1">Find & Scan</h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    Explore Prague to find street art. Use your camera to scan and {selectedMode === GAME_MODES.SOLO ? 'discover' : 'capture'} it.
                  </p>
                </div>
              </motion.div>
              
              {/* Step 2 - Mode-specific */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                  selectedMode === GAME_MODES.SOLO 
                    ? 'from-purple-500/30 to-pink-500/30' 
                    : 'from-blue-500/30 to-cyan-500/30'
                } flex items-center justify-center flex-shrink-0`}>
                  {selectedMode === GAME_MODES.SOLO ? (
                    <Star size={24} className="text-white" />
                  ) : (
                    <Map size={24} className="text-white" />
                  )}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-base mb-1">
                    {selectedMode === GAME_MODES.SOLO ? 'Build Your Collection' : 'Claim Territory'}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    {selectedMode === GAME_MODES.SOLO 
                      ? 'Every discovery is yours forever. Build a portfolio of the art you find.'
                      : 'Each capture claims territory for your team. Check the map to see who controls what.'
                    }
                  </p>
                </div>
              </motion.div>
              
              {/* Step 3 - Mode-specific */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                  selectedMode === GAME_MODES.SOLO 
                    ? 'from-green-500/30 to-emerald-500/30' 
                    : 'from-yellow-500/30 to-orange-500/30'
                } flex items-center justify-center flex-shrink-0`}>
                  {selectedMode === GAME_MODES.SOLO ? (
                    <Trophy size={24} className="text-white" />
                  ) : (
                    <Zap size={24} className="text-white" />
                  )}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-base mb-1">
                    {selectedMode === GAME_MODES.SOLO ? 'Earn Achievements' : 'Score Points'}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    {selectedMode === GAME_MODES.SOLO 
                      ? 'No pressure, no competition. Just explore and enjoy discovering hidden art.'
                      : 'Bigger art = more points. Steal from enemies for bonus points!'
                    }
                  </p>
                </div>
              </motion.div>
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
          {step === 4 ? "Let's Go!" : 'Continue'}
          <ChevronRight size={20} />
        </motion.button>
      </div>
    </div>
  )
}
