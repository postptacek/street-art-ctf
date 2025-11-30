import { motion } from 'framer-motion'
import PragueMap from '../components/PragueMap'

function Map() {
  return (
    <motion.div 
      className="flex-1 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <PragueMap />
    </motion.div>
  )
}

export default Map
