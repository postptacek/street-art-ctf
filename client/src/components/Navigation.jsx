import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'

const navItems = [
  { path: '/', label: 'BATTLE' },
  { path: '/map', label: 'MAP' },
  { path: '/scanner', label: 'SCAN' },
  { path: '/leaderboard', label: 'RANKS' },
  { path: '/profile', label: 'COLLECTION' },
]

function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[2000] font-nohemi">
      {/* White background */}
      <div className="absolute inset-0 bg-[#FAFAFA] shadow-[0_-4px_20px_rgba(0,0,0,0.1)]" />
      
      {/* Safe area padding for iOS */}
      <div className="relative flex justify-around items-center h-14 px-2" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {navItems.map(({ path, label }) => (
          <NavLink
            key={path}
            to={path}
            className="flex-1 flex justify-center"
          >
            {({ isActive }) => (
              <motion.div
                className="relative py-2 px-3"
                whileTap={{ scale: 0.95 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-black"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span 
                  className={`text-xs font-bold tracking-wider transition-colors ${
                    isActive ? 'text-black' : 'text-black/30'
                  }`}
                >
                  {label}
                </span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default Navigation
