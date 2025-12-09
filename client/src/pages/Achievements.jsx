import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES, checkAchievements } from '../data/achievements'

const CATEGORY_LABELS = {
    [ACHIEVEMENT_CATEGORIES.SOLO]: { label: 'SOLO', color: '#10b981' },
    [ACHIEVEMENT_CATEGORIES.BATTLE]: { label: 'BATTLE', color: '#ef4444' },
    [ACHIEVEMENT_CATEGORIES.SPECIAL]: { label: 'SPECIAL', color: '#f59e0b' },
    [ACHIEVEMENT_CATEGORIES.SESSION]: { label: 'SESSION', color: '#8b5cf6' },
    [ACHIEVEMENT_CATEGORIES.SOCIAL]: { label: 'SOCIAL', color: '#ec4899' }
}

function Achievements() {
    const navigate = useNavigate()
    const { player, discoveries, artPoints, unlockedAchievements } = useGame()
    const [selectedCategory, setSelectedCategory] = useState(null)

    // Calculate which achievements should be unlocked based on current state
    const currentlyUnlocked = useMemo(() => {
        return checkAchievements(player, discoveries, artPoints, {})
    }, [player, discoveries, artPoints])

    // Use stored unlocked achievements (merged with calculated)
    const allUnlocked = useMemo(() => {
        const stored = unlockedAchievements || []
        return [...new Set([...stored, ...currentlyUnlocked])]
    }, [unlockedAchievements, currentlyUnlocked])

    // Filter achievements by category
    const filteredAchievements = useMemo(() => {
        if (!selectedCategory) return ACHIEVEMENTS
        return ACHIEVEMENTS.filter(a => a.category === selectedCategory)
    }, [selectedCategory])

    const unlockedCount = allUnlocked.length
    const totalCount = ACHIEVEMENTS.length

    return (
        <div className="flex-1 overflow-y-auto bg-[#FAFAFA] font-nohemi">
            {/* Header */}
            <div className="p-6 pt-10">
                <motion.button
                    onClick={() => navigate(-1)}
                    className="text-black/40 text-sm mb-4 flex items-center gap-2"
                    whileTap={{ scale: 0.95 }}
                >
                    ← Back
                </motion.button>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold text-black tracking-tight"
                >
                    Achievements
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-2 mt-2"
                >
                    <span className="text-xl font-bold text-black">{unlockedCount}</span>
                    <span className="text-black/40">/ {totalCount} unlocked</span>
                </motion.div>
            </div>

            {/* Category Filter */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="px-6 mb-6 flex gap-2 overflow-x-auto pb-2"
            >
                <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === null
                            ? 'bg-black text-white'
                            : 'bg-black/5 text-black/60'
                        }`}
                >
                    ALL
                </button>
                {Object.entries(CATEGORY_LABELS).map(([key, { label, color }]) => (
                    <button
                        key={key}
                        onClick={() => setSelectedCategory(key)}
                        className={`px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === key
                                ? 'text-white'
                                : 'bg-black/5 text-black/60'
                            }`}
                        style={selectedCategory === key ? { backgroundColor: color } : {}}
                    >
                        {label}
                    </button>
                ))}
            </motion.div>

            {/* Achievements Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="px-6 pb-32"
            >
                <div className="grid grid-cols-3 gap-3">
                    {filteredAchievements.map((achievement, index) => {
                        const isUnlocked = allUnlocked.includes(achievement.id)
                        const categoryInfo = CATEGORY_LABELS[achievement.category]

                        return (
                            <motion.div
                                key={achievement.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 + index * 0.03 }}
                                className={`aspect-square flex flex-col items-center justify-center p-3 border-2 ${isUnlocked
                                        ? 'bg-white border-black'
                                        : 'bg-black/5 border-transparent'
                                    }`}
                            >
                                <div
                                    className={`text-3xl mb-2 ${isUnlocked ? '' : 'grayscale opacity-30'}`}
                                >
                                    {achievement.icon}
                                </div>
                                <div
                                    className={`text-[10px] font-bold text-center leading-tight ${isUnlocked ? 'text-black' : 'text-black/30'
                                        }`}
                                >
                                    {achievement.name}
                                </div>
                                {isUnlocked && (
                                    <div
                                        className="text-[8px] font-bold mt-1 px-1.5 py-0.5"
                                        style={{ backgroundColor: categoryInfo?.color, color: 'white' }}
                                    >
                                        {categoryInfo?.label}
                                    </div>
                                )}
                            </motion.div>
                        )
                    })}
                </div>
            </motion.div>
        </div>
    )
}

export default Achievements
