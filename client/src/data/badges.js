// Badge Collection Data
// Maps art IDs to their unique Chomp badge images

export const BADGES = {
    'art-46': {
        id: 'art-46',
        badgeNumber: 1,
        name: 'Centrum Chomp #1',
        image: 'badges/badge-1.png',
        area: 'Florenc'
    },
    'art-47': {
        id: 'art-47',
        badgeNumber: 2,
        name: 'Centrum Chomp #2',
        image: 'badges/badge-2.png',
        area: 'Florenc'
    },
    'art-48': {
        id: 'art-48',
        badgeNumber: 3,
        name: 'Centrum Chomp #3',
        image: 'badges/badge-3.png',
        area: 'Karlín'
    },
    'art-49': {
        id: 'art-49',
        badgeNumber: 4,
        name: 'Centrum Chomp #4',
        image: 'badges/badge-4.png',
        area: 'Karlín'
    },
    'art-50': {
        id: 'art-50',
        badgeNumber: 5,
        name: 'Centrum Chomp #5',
        image: 'badges/badge-5.png',
        area: 'Karlín'
    },
    'art-51': {
        id: 'art-51',
        badgeNumber: 6,
        name: 'Centrum Chomp #6',
        image: 'badges/badge-6.png',
        area: 'Centrum'
    },
    'art-52': {
        id: 'art-52',
        badgeNumber: 7,
        name: 'Centrum Chomp #7',
        image: 'badges/badge-7.png',
        area: 'Centrum'
    },
    'art-53': {
        id: 'art-53',
        badgeNumber: 8,
        name: 'Centrum Chomp #8',
        image: 'badges/badge-8.png',
        area: 'Centrum'
    },
    'art-54': {
        id: 'art-54',
        badgeNumber: 9,
        name: 'Centrum Chomp #9',
        image: 'badges/badge-9.png',
        area: 'Centrum'
    },
    'art-55': {
        id: 'art-55',
        badgeNumber: 10,
        name: 'Centrum Chomp #10',
        image: 'badges/badge-10.png',
        area: 'Centrum'
    },
    'art-56': {
        id: 'art-56',
        badgeNumber: 11,
        name: 'Centrum Chomp #11',
        image: 'badges/badge-11.png',
        area: 'Florenc'
    }
}

// Get all badges as an array sorted by badge number
export const BADGE_LIST = Object.values(BADGES).sort((a, b) => a.badgeNumber - b.badgeNumber)

// Total badge count
export const TOTAL_BADGES = BADGE_LIST.length

// Check if an art ID has a badge
export function hasBadge(artId) {
    return artId in BADGES
}

// Get badge for an art ID
export function getBadge(artId) {
    return BADGES[artId] || null
}
