# Achievements System Design

## Overview

Achievements reward players for milestones and special actions. Designed to scale as more street art is added.

---

## Solo Mode Achievements 🎨

### Discovery Milestones
| Achievement | Trigger | Icon |
|-------------|---------|------|
| **First Find** | Discover 1 art | 🔍 |
| **Explorer** | Discover 10 art | 🗺️ |
| **Collector** | Discover 25 art | 📦 |
| **Curator** | Discover 50% of all art | 🏛️ |
| **Completionist** | Discover 100% of all art | 🏆 |

### Area Achievements
| Achievement | Trigger | Icon |
|-------------|---------|------|
| **Local** | Discover all art in 1 area | 📍 |
| **Tourist** | Visit 3 different areas | 🚶 |
| **Wanderer** | Visit all areas | 🌍 |

### Streak Achievements
| Achievement | Trigger | Icon |
|-------------|---------|------|
| **Getting Started** | 3 captures in one day | 🔥 |
| **On Fire** | 5 captures in one day | 🔥🔥 |
| **Unstoppable** | 10 captures in one day | 💥 |

---

## Battle Mode Achievements ⚔️

### Capture Milestones
| Achievement | Trigger | Icon |
|-------------|---------|------|
| **First Blood** | Capture 1 territory | ⚔️ |
| **Warrior** | Capture 10 territories | 🗡️ |
| **Conqueror** | Capture 50 territories | 👑 |

### Recapture/Steal Achievements
| Achievement | Trigger | Icon |
|-------------|---------|------|
| **Thief** | Steal 1 territory | 🦊 |
| **Raider** | Steal 10 territories | 🏴‍☠️ |
| **Nemesis** | Steal 25 territories | 💀 |

### Team Contribution
| Achievement | Trigger | Icon |
|-------------|---------|------|
| **Team Player** | Contribute 500 points | 🤝 |
| **MVP** | Contribute 2000 points | ⭐ |
| **Legend** | Contribute 5000 points | 🌟 |

### Dominance
| Achievement | Trigger | Icon |
|-------------|---------|------|
| **Foothold** | Team controls 25% of map | 📊 |
| **Majority** | Team controls 50% of map | 📈 |
| **Domination** | Team controls 75% of map | 🚩 |

---

## Special Achievements 🎯

| Achievement | Trigger | Icon |
|-------------|---------|------|
| **Early Bird** | Capture before 7 AM | 🌅 |
| **Night Owl** | Capture after 10 PM | 🦉 |
| **Speedrunner** | 3 captures in 10 minutes | ⚡ |
| **Comeback** | Recapture territory your team lost | 🔄 |
| **Defender** | Hold same territory for 24h+ | 🛡️ |

---

## Session Achievements 🏃

| Achievement | Trigger | Icon |
|-------------|---------|------|
| **World Traveler** | Scan 3+ different areas in one session | 🌐 |
| **Loyal Fan** | Return to the same piece 5 times | 💕 |
| **Pioneer** | Be the first person EVER to scan a piece | 🚀 |

---

## Social/Competitive Achievements 🔥

| Achievement | Trigger | Icon |
|-------------|---------|------|
| **Hot Trail** | Scan a piece someone else scanned <1 hour ago | 🔥 |
| **Underdog** | Capture territory while your team is <20% control | 🐕 |
| **Nemesis** | Steal from the same player 5 times | 😈 |
| **Rivalry** | Have your territory stolen by same person 3x | 🤼 |

---

## Implementation Notes

### Scaling with More Art
- Use **percentage-based** milestones (50%, 100%) instead of fixed numbers
- Area achievements auto-scale as areas are added
- "Completionist" always means ALL available art

### Storage
- Store unlocked achievements in `localStorage` + Firebase
- Track progress toward each achievement
- Show progress bars for in-progress achievements

### UI Suggestions
- Achievement popup when unlocked
- Achievement gallery in Profile page
- Progress indicators for close achievements
