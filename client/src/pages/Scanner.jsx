import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'
import { AlertCircle } from 'lucide-react'
import ARScanner from '../components/ARScanner'

function Scanner() {
  const { player } = useGame()
  
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

  // Use React ARScanner component directly
  return <ARScanner />
}

export default Scanner
