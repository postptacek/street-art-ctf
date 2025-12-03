import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'

function Scanner() {
  const { player } = useGame()
  const [redirecting, setRedirecting] = useState(false)
  
  useEffect(() => {
    if (player.team && !redirecting) {
      setRedirecting(true)
      const basePath = import.meta.env.BASE_URL || '/'
      window.location.href = basePath + 'ar-scanner.html'
    }
  }, [player.team, redirecting])

  if (!player.team) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-[#FAFAFA] font-nohemi">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-8xl font-black text-black/5 mb-4">!</div>
          <h2 className="text-2xl font-bold mb-2 text-black">Join a Team</h2>
          <p className="text-black/40 text-sm">Select your team from home to start scanning</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-[#FAFAFA] font-nohemi">
      <motion.div 
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div 
          className="text-7xl font-black text-black/10 mb-4"
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          AR
        </motion.div>
        <h2 className="text-xl font-bold mb-2 text-black">Opening Scanner</h2>
        <p className="text-black/40 text-sm">Point camera at street art</p>
      </motion.div>
    </div>
  )
}

export default Scanner
