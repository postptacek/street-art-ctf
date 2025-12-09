/**
 * Achievement Definitions
 * Each achievement has an id, name, description, icon, category, and check function
 * The check function receives (player, discoveries, artPoints, teamStats) and returns true if unlocked
 */

export const ACHIEVEMENT_CATEGORIES = {
    SOLO: 'solo',
    BATTLE: 'battle',
    SPECIAL: 'special',
    SESSION: 'session',
    SOCIAL: 'social'
}

export const ACHIEVEMENTS = [
    // === SOLO MODE - Discovery Milestones ===
    {
        id: 'first_find',
        name: 'First Find',
        description: 'Discover your first street art',
        icon: '🔍',
        category: ACHIEVEMENT_CATEGORIES.SOLO,
        check: (player) => player.discoveryCount >= 1
    },
    {
        id: 'explorer',
        name: 'Explorer',
        description: 'Discover 10 pieces of street art',
        icon: '🗺️',
        category: ACHIEVEMENT_CATEGORIES.SOLO,
        check: (player) => player.discoveryCount >= 10
    },
    {
        id: 'collector',
        name: 'Collector',
        description: 'Discover 25 pieces of street art',
        icon: '📦',
        category: ACHIEVEMENT_CATEGORIES.SOLO,
        check: (player) => player.discoveryCount >= 25
    },

    // === SOLO MODE - Area Achievements ===
    {
        id: 'tourist',
        name: 'Tourist',
        description: 'Visit 3 different areas',
        icon: '🚶',
        category: ACHIEVEMENT_CATEGORIES.SOLO,
        check: (player) => (player.uniqueAreasVisited?.length || 0) >= 3
    },
    {
        id: 'wanderer',
        name: 'Wanderer',
        description: 'Visit all areas',
        icon: '🌍',
        category: ACHIEVEMENT_CATEGORIES.SOLO,
        check: (player) => (player.uniqueAreasVisited?.length || 0) >= 6
    },

    // === SOLO MODE - Streak Achievements ===
    {
        id: 'getting_started',
        name: 'Getting Started',
        description: '3 captures in one day',
        icon: '🔥',
        category: ACHIEVEMENT_CATEGORIES.SOLO,
        check: (player) => player.streak >= 3
    },
    {
        id: 'on_fire',
        name: 'On Fire',
        description: '5 captures in one day',
        icon: '🔥',
        category: ACHIEVEMENT_CATEGORIES.SOLO,
        check: (player) => player.streak >= 5
    },
    {
        id: 'unstoppable',
        name: 'Unstoppable',
        description: '10 captures in one day',
        icon: '💥',
        category: ACHIEVEMENT_CATEGORIES.SOLO,
        check: (player) => player.streak >= 10
    },

    // === BATTLE MODE - Capture Milestones ===
    {
        id: 'first_blood',
        name: 'First Blood',
        description: 'Capture your first territory',
        icon: '⚔️',
        category: ACHIEVEMENT_CATEGORIES.BATTLE,
        check: (player) => player.captureCount >= 1
    },
    {
        id: 'warrior',
        name: 'Warrior',
        description: 'Capture 10 territories',
        icon: '🗡️',
        category: ACHIEVEMENT_CATEGORIES.BATTLE,
        check: (player) => player.captureCount >= 10
    },
    {
        id: 'conqueror',
        name: 'Conqueror',
        description: 'Capture 50 territories',
        icon: '👑',
        category: ACHIEVEMENT_CATEGORIES.BATTLE,
        check: (player) => player.captureCount >= 50
    },

    // === BATTLE MODE - Steal Achievements ===
    {
        id: 'thief',
        name: 'Thief',
        description: 'Steal your first territory',
        icon: '🦊',
        category: ACHIEVEMENT_CATEGORIES.BATTLE,
        check: (player) => player.recaptureCount >= 1
    },
    {
        id: 'raider',
        name: 'Raider',
        description: 'Steal 10 territories',
        icon: '🏴‍☠️',
        category: ACHIEVEMENT_CATEGORIES.BATTLE,
        check: (player) => player.recaptureCount >= 10
    },
    {
        id: 'nemesis',
        name: 'Nemesis',
        description: 'Steal 25 territories',
        icon: '💀',
        category: ACHIEVEMENT_CATEGORIES.BATTLE,
        check: (player) => player.recaptureCount >= 25
    },

    // === BATTLE MODE - Team Contribution ===
    {
        id: 'team_player',
        name: 'Team Player',
        description: 'Contribute 500 points to your team',
        icon: '🤝',
        category: ACHIEVEMENT_CATEGORIES.BATTLE,
        check: (player) => player.score >= 500
    },
    {
        id: 'mvp',
        name: 'MVP',
        description: 'Contribute 2000 points to your team',
        icon: '⭐',
        category: ACHIEVEMENT_CATEGORIES.BATTLE,
        check: (player) => player.score >= 2000
    },
    {
        id: 'legend',
        name: 'Legend',
        description: 'Contribute 5000 points to your team',
        icon: '🌟',
        category: ACHIEVEMENT_CATEGORIES.BATTLE,
        check: (player) => player.score >= 5000
    },

    // === SPECIAL ACHIEVEMENTS ===
    {
        id: 'pioneer',
        name: 'Pioneer',
        description: 'Be the first to capture a territory',
        icon: '🚀',
        category: ACHIEVEMENT_CATEGORIES.SPECIAL,
        check: (player) => player.firstCaptureCount >= 1
    },
    {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Capture before 7 AM',
        icon: '🌅',
        category: ACHIEVEMENT_CATEGORIES.SPECIAL,
        check: (player) => player.hasEarlyCapture === true
    },
    {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Capture after 10 PM',
        icon: '🦉',
        category: ACHIEVEMENT_CATEGORIES.SPECIAL,
        check: (player) => player.hasNightCapture === true
    }
]

// Helper to get achievement by ID
export function getAchievement(id) {
    return ACHIEVEMENTS.find(a => a.id === id)
}

// Helper to check which achievements are unlocked
export function checkAchievements(player, discoveries = {}, artPoints = [], teamStats = {}) {
    const unlocked = []
    ACHIEVEMENTS.forEach(achievement => {
        if (achievement.check(player, discoveries, artPoints, teamStats)) {
            unlocked.push(achievement.id)
        }
    })
    return unlocked
}

// Helper to get newly unlocked achievements
export function getNewlyUnlocked(previousUnlocked = [], currentUnlocked = []) {
    return currentUnlocked.filter(id => !previousUnlocked.includes(id))
}

export const TOTAL_ACHIEVEMENTS = ACHIEVEMENTS.length
