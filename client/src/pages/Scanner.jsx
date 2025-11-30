import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'
import { AlertCircle, Loader2, Target } from 'lucide-react'

function Scanner() {
  const { player } = useGame()
  const [redirecting, setRedirecting] = useState(false)
  
  // Redirect to HTML scanner (works better than React bundled MindAR)
  useEffect(() => {
    if (player.team && !redirecting) {
      setRedirecting(true)
      setTimeout(() => {
        const basePath = import.meta.env.BASE_URL || '/'
        window.location.href = basePath + 'ar-scanner.html'
      }, 300)
    }
  }, [player.team, redirecting])

  // No team selected
  if (!player.team) {
    return (
      <motion.div 
        className="flex-1 flex items-center justify-center p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={36} className="text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-white">Join a Team First</h2>
          <p className="text-white/40 text-sm max-w-xs">Select your team from the home screen to start scanning street art</p>
        </div>
      </motion.div>
    )
  }

  // Loading while redirecting
  return (
    <motion.div 
      className="flex-1 flex items-center justify-center p-8 bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="text-center">
        <motion.div 
          className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Target size={48} className="text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-3 text-white">Opening Scanner</h2>
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-400" />
      </div>
    </motion.div>
  )
}

export default Scanner
