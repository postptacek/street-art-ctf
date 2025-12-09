import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
    const [selectedAchievement, setSelectedAchievement] = useState(null)

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

    const handleAchievementClick = (achievement, isUnlocked) => {
        if (isUnlocked) {
            setSelectedAchievement(achievement)
        }
    }

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
                                transition={{ delay: 0.3 + index * 0.02 }}
                                onClick={() => handleAchievementClick(achievement, isUnlocked)}
                                className={`aspect-square flex flex-col items-center justify-center p-3 border-2 ${isUnlocked
                                    ? 'bg-white border-black cursor-pointer active:bg-black/5'
                                    : 'bg-black/5 border-transparent'
                                    }`}
                            >
                                {/* Chumper icon */}
                                <div className="w-16 h-16 mb-2 relative flex items-center justify-center">
                                    <img
                                        src={`${import.meta.env.BASE_URL}chumper.png`}
                                        alt=""
                                        className="w-full h-full object-contain"
                                        style={{
                                            filter: isUnlocked
                                                ? `hue-rotate(${player.team === 'red' ? '0deg' : '200deg'}) saturate(1.2)`
                                                : 'grayscale(100%) opacity(0.3)'
                                        }}
                                    />
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

            {/* Achievement Detail Modal */}
            <AnimatePresence>
                {selectedAchievement && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50"
                        onClick={() => setSelectedAchievement(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#FAFAFA] p-8 max-w-sm w-full text-center"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Large chumper icon */}
                            <div className="w-28 h-28 mx-auto mb-4">
                                <img
                                    src={`${import.meta.env.BASE_URL}chumper.png`}
                                    alt=""
                                    className="w-full h-full object-contain"
                                    style={{
                                        filter: `hue-rotate(${player.team === 'red' ? '0deg' : '200deg'}) saturate(1.2)`
                                    }}
                                />
                            </div>

                            <h2 className="text-2xl font-black text-black mb-2">
                                {selectedAchievement.name}
                            </h2>

                            <p className="text-black/50 mb-4">
                                {selectedAchievement.description}
                            </p>

                            <div
                                className="inline-block px-3 py-1 text-xs font-bold text-white mb-6"
                                style={{ backgroundColor: CATEGORY_LABELS[selectedAchievement.category]?.color }}
                            >
                                {CATEGORY_LABELS[selectedAchievement.category]?.label}
                            </div>

                            <button
                                onClick={() => setSelectedAchievement(null)}
                                className="block w-full py-3 bg-black text-white font-bold text-sm"
                            >
                                CLOSE
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Achievements
