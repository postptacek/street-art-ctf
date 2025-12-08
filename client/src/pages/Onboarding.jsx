import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'

// Random name generator
const ADJECTIVES = ['Swift', 'Bold', 'Neon', 'Urban', 'Wild', 'Cosmic', 'Pixel', 'Mystic', 'Shadow', 'Electric']
const NOUNS = ['Artist', 'Hunter', 'Rebel', 'Ghost', 'Ninja', 'Pirate', 'Wizard', 'Rogue', 'Phoenix', 'Storm']

function generateRandomName() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  const num = Math.floor(Math.random() * 99) + 1
  return `${adj}${noun}${num}`
}

// Word animation component
function AnimatedWords({ text, className = '', delay = 0 }) {
  const words = text.split(' ')
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + i * 0.08, duration: 0.4 }}
          className="inline-block mr-[0.3em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}

// Letter animation component
function AnimatedLetters({ text, className = '', delay = 0 }) {
  return (
    <span className={className}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 40, rotate: -10 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{
            delay: delay + i * 0.04,
            duration: 0.5,
            type: 'spring',
            stiffness: 200
          }}
          className="inline-block"
          style={{ display: char === ' ' ? 'inline' : 'inline-block' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  )
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { player, joinTeam, setPlayerName, allPlayers } = useGame()
  const [step, setStep] = useState(0)
  const [name, setName] = useState(() => player.name && player.name !== 'Street Artist' ? player.name : generateRandomName())
  const [assignedTeam, setAssignedTeam] = useState(null)

  useEffect(() => {
    if (player.team && player.name && player.name !== 'Street Artist') {
      navigate('/map')
    }
  }, [])

  // Assign team only once when entering step 2 (team reveal)
  const assignTeamOnce = () => {
    if (assignedTeam) return assignedTeam // Already assigned
    const redCount = allPlayers.filter(p => p.team === 'red').length
    const blueCount = allPlayers.filter(p => p.team === 'blue').length
    const team = redCount < blueCount ? 'red' : blueCount < redCount ? 'blue' : (Math.random() < 0.5 ? 'red' : 'blue')
    return team
  }

  const handleGenerateName = () => setName(generateRandomName())

  const handleNext = async () => {
    if (step === 1 && name.trim()) {
      // Assign team NOW and save it
      const team = assignTeamOnce()
      setAssignedTeam(team)
      // Wait for both async operations to complete
      await setPlayerName(name.trim())
      await joinTeam(team)
    }
    if (step === 3) { navigate('/map'); return }
    setStep(step + 1)
  }

  const canProceed = () => step === 1 ? name.trim().length >= 2 : true

  const teamColor = assignedTeam === 'red' ? '#E53935' : '#1E88E5'
  const teamName = assignedTeam === 'red' ? 'RED' : 'BLUE'

  return (
    <div className="h-screen bg-[#FAFAFA] flex flex-col overflow-hidden font-nohemi">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-black/5 z-10">
        <motion.div
          className="h-full bg-black"
          initial={{ width: '0%' }}
          animate={{ width: `${((step + 1) / 4) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      <AnimatePresence mode="wait">
        {/* Step 0: Intro */}
        {step === 0 && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col justify-center items-center p-6 pt-16 text-center"
          >
            {/* Jumping animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
              className="mb-8"
            >
              <img
                src={`${import.meta.env.BASE_URL}animations/jump.gif`}
                alt="Chomp jumping"
                className="w-48 h-48 object-contain"
              />
            </motion.div>

            <h1 className="text-[4rem] leading-[0.95] font-black text-black mb-4 tracking-tight">
              <AnimatedLetters text="CHOMP" delay={0.3} /><br />
              <AnimatedLetters text="GAME" delay={0.6} />
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
              className="text-lg text-black/40 max-w-[280px] leading-relaxed"
            >
              Find. Scan. Collect.
            </motion.p>
          </motion.div>
        )}

        {/* Step 1: Name */}
        {step === 1 && (
          <motion.div
            key="name"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col justify-center p-6"
          >
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm tracking-widest text-black/40 mb-4"
            >
              STEP 1 OF 3
            </motion.p>

            <h1 className="text-4xl font-bold text-black mb-3 tracking-tight">
              <AnimatedWords text="Who are you?" delay={0.2} />
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-black/40 mb-10"
            >
              Pick a name. Make it memorable.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                maxLength={20}
                className="w-full py-4 text-3xl font-bold text-black bg-transparent border-b-2 border-black/20 focus:border-black focus:outline-none placeholder:text-black/20 transition-colors"
              />

              <button
                onClick={handleGenerateName}
                className="mt-6 text-sm text-black/40 hover:text-black transition-colors underline underline-offset-4"
              >
                Randomize
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Step 2: Team Reveal */}
        {step === 2 && (
          <motion.div
            key="team"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col justify-center items-center p-6 text-center relative overflow-hidden"
            style={{ backgroundColor: teamColor }}
          >
            {/* Eating animation */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
              className="mb-4"
            >
              <img
                src={`${import.meta.env.BASE_URL}animations/eat.gif`}
                alt="Chomp eating"
                className="w-40 h-40 object-contain"
              />
            </motion.div>

            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 150 }}
            >
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-white/60 text-sm tracking-widest mb-2"
              >
                {name.toUpperCase()}, YOU ARE
              </motion.p>

              <h1 className="text-[4rem] leading-none font-black text-white tracking-tight">
                <AnimatedLetters text="TEAM" delay={0.6} /><br />
                <AnimatedLetters text={teamName} delay={0.9} />
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="mt-4 text-white/50 text-lg"
              >
                {assignedTeam === 'red' ? 'Burn bright. Conquer all.' : 'Flow strong. Take over.'}
              </motion.p>
            </motion.div>
          </motion.div>
        )}

        {/* Step 3: How it works */}
        {step === 3 && (
          <motion.div
            key="how"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col p-6 pt-12 overflow-y-auto"
          >
            {/* Scan animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
              className="flex justify-center mb-6"
            >
              <img
                src={`${import.meta.env.BASE_URL}animations/scan.gif`}
                alt="Scanning"
                className="w-32 h-32 object-contain"
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm tracking-widest text-black/40 mb-3 text-center"
            >
              HOW TO PLAY
            </motion.p>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex gap-4"
              >
                <div className="text-4xl font-black text-black/10">1</div>
                <div>
                  <h3 className="text-lg font-bold text-black mb-1">Find Chomps</h3>
                  <p className="text-sm text-black/50 leading-relaxed">
                    Walk the streets and look for Chomp stickers hiding in the city.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex gap-4"
              >
                <div className="text-4xl font-black text-black/10">2</div>
                <div>
                  <h3 className="text-lg font-bold text-black mb-1">Scan to Collect</h3>
                  <p className="text-sm text-black/50 leading-relaxed">
                    Use the AR scanner to recognize and capture the Chomp.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="flex gap-4"
              >
                <div className="text-4xl font-black text-black/10">3</div>
                <div>
                  <h3 className="text-lg font-bold text-black mb-1">Two Ways to Play</h3>
                  <p className="text-sm text-black/50 leading-relaxed">
                    <span className="font-bold text-black">Solo:</span> Collect Chomps for your personal collection.<br />
                    <span className="font-bold text-black">Battle:</span> Claim territory for your team and compete!
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom button */}
      <div className="p-6 flex-shrink-0" style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          disabled={!canProceed()}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`w-full py-5 font-bold text-lg tracking-wide transition-all ${step === 2
            ? 'bg-white text-black'
            : canProceed()
              ? 'bg-black text-white'
              : 'bg-black/10 text-black/30 cursor-not-allowed'
            }`}
        >
          {step === 3 ? "LET'S GO" : step === 2 ? 'CONTINUE' : 'NEXT'}
        </motion.button>
      </div>
    </div>
  )
}
