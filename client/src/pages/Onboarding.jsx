import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'

// Random name generator - Czech-friendly
const ADJECTIVES = ['Super', 'Mega', 'Turbo', 'Ultra', 'Hyper', 'Ninja', 'Pixel', 'Neon', 'Cyber', 'Power']
const NOUNS = ['Lovec', 'Hrdina', 'Skokan', 'Běžec', 'Střelec', 'Bojovník', 'Závodník', 'Hráč', 'Mazák', 'Šampion']

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
  
  useEffect(() => {
    const redCount = allPlayers.filter(p => p.team === 'red').length
    const blueCount = allPlayers.filter(p => p.team === 'blue').length
    const team = redCount < blueCount ? 'red' : blueCount < redCount ? 'blue' : (Math.random() < 0.5 ? 'red' : 'blue')
    setAssignedTeam(team)
  }, [allPlayers])
  
  const handleGenerateName = () => setName(generateRandomName())
  
  const handleNext = () => {
    if (step === 1 && name.trim()) {
      setPlayerName(name.trim())
      if (assignedTeam) joinTeam(assignedTeam)
    }
    if (step === 3) { navigate('/map'); return }
    setStep(step + 1)
  }
  
  const canProceed = () => step === 1 ? name.trim().length >= 2 && assignedTeam : true
  
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
            className="flex-1 flex flex-col justify-between p-6 pt-16"
          >
            <div className="flex-1 flex flex-col justify-center">
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm tracking-widest text-black/40 mb-4"
              >
                VÍTEJ VE HŘE
              </motion.p>
              
              <h1 className="text-[3.5rem] leading-[0.95] font-bold text-black mb-8 tracking-tight">
                <AnimatedLetters text="Street" delay={0.3} /><br/>
                <AnimatedLetters text="Art" delay={0.5} /><br/>
                <AnimatedLetters text="CTF" delay={0.7} />
              </h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="text-lg text-black/50 max-w-[280px] leading-relaxed"
              >
                Město se stává tvým plátnem. Najdi street art. Obsaď území. Vyhraj hru.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              className="space-y-6"
            >
              <div className="flex gap-8 text-sm text-black/40">
                <div>
                  <div className="text-2xl font-bold text-black">21</div>
                  <div>míst</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-black">2</div>
                  <div>týmy</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-black">1</div>
                  <div>vítěz</div>
                </div>
              </div>
            </motion.div>
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
              KROK 1 ZE 3
            </motion.p>
            
            <h1 className="text-4xl font-bold text-black mb-3 tracking-tight">
              <AnimatedWords text="Jak se jmenuješ?" delay={0.2} />
            </h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-black/40 mb-10"
            >
              Vyber si přezdívku. Ať je zapamatovatelná.
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
                placeholder="Tvoje jméno"
                maxLength={20}
                className="w-full py-4 text-3xl font-bold text-black bg-transparent border-b-2 border-black/20 focus:border-black focus:outline-none placeholder:text-black/20 transition-colors"
              />
              
              <button
                onClick={handleGenerateName}
                className="mt-6 text-sm text-black/40 hover:text-black transition-colors underline underline-offset-4"
              >
                Náhodné jméno
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
                {name.toUpperCase()}, JSI V
              </motion.p>
              
              <h1 className="text-[5rem] leading-none font-black text-white tracking-tight">
                <AnimatedLetters text="TÝMU" delay={0.6} /><br/>
                <AnimatedLetters text={assignedTeam === 'red' ? 'ČERVENÍ' : 'MODŘÍ'} delay={0.9} />
              </h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="mt-6 text-white/50 text-lg"
              >
                {assignedTeam === 'red' ? 'Hoř jasně. Dobij vše.' : 'Teč silně. Ovládni mapu.'}
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
            className="flex-1 flex flex-col justify-center p-6"
          >
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm tracking-widest text-black/40 mb-4"
            >
              JAK TO FUNGUJE
            </motion.p>
            
            <h1 className="text-4xl font-bold text-black mb-10 tracking-tight">
              <AnimatedWords text="Tři jednoduché kroky" delay={0.1} />
            </h1>
            
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex gap-5"
              >
                <div className="text-5xl font-black text-black/10">1</div>
                <div>
                  <h3 className="text-xl font-bold text-black mb-1">Najdi</h3>
                  <p className="text-black/50 leading-relaxed">
                    Procházej ulice. Hledej Chumpstry schované na zdech.
                  </p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex gap-5"
              >
                <div className="text-5xl font-black text-black/10">2</div>
                <div>
                  <h3 className="text-xl font-bold text-black mb-1">Naskenuj</h3>
                  <p className="text-black/50 leading-relaxed">
                    Namiř kameru. AR skener rozpozná obrázek okamžitě.
                  </p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="flex gap-5"
              >
                <div className="text-5xl font-black text-black/10">3</div>
                <div>
                  <h3 className="text-xl font-bold text-black mb-1">Obsaď</h3>
                  <p className="text-black/50 leading-relaxed">
                    Získej body pro svůj tým. Sbírej série. Ovládni mapu.
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
          className={`w-full py-5 font-bold text-lg tracking-wide transition-all ${
            step === 2 
              ? 'bg-white text-black'
              : canProceed()
                ? 'bg-black text-white'
                : 'bg-black/10 text-black/30 cursor-not-allowed'
          }`}
        >
          {step === 3 ? "JDEME NA TO!" : step === 2 ? 'POKRAČOVAT' : 'DALŠÍ'}
        </motion.button>
      </div>
    </div>
  )
}
