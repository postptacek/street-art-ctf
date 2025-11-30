import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Map, Scan, Trophy, User, Home } from 'lucide-react'

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/map', icon: Map, label: 'Map' },
  { path: '/scanner', icon: Scan, label: 'Scan' },
  { path: '/leaderboard', icon: Trophy, label: 'Ranks' },
  { path: '/profile', icon: User, label: 'You' },
]

function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[2000]">
      {/* Blur background */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xl border-t border-white/[0.06]" />
      
      {/* Safe area padding for iOS */}
      <div className="relative flex justify-around items-center h-16 px-4 pb-safe">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className="flex-1 flex justify-center"
          >
            {({ isActive }) => (
              <motion.div
                className="relative flex flex-col items-center justify-center py-2 px-4"
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl bg-white/[0.08]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <motion.div
                  className="relative z-10"
                  animate={{ 
                    scale: isActive ? 1 : 0.9,
                    opacity: isActive ? 1 : 0.5 
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
                <motion.span 
                  className="relative z-10 text-[10px] mt-1 font-medium"
                  animate={{ 
                    opacity: isActive ? 1 : 0.4,
                    y: isActive ? 0 : 2
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  {label}
                </motion.span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default Navigation
