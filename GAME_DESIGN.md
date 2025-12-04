# Street Art CTF - Complete Game Design Document

## Table of Contents
1. [Game Overview](#game-overview)
2. [Game Modes](#game-modes)
3. [Core Gameplay Loop](#core-gameplay-loop)
4. [Map & Navigation](#map--navigation)
5. [Art Points System](#art-points-system)
6. [Scoring System](#scoring-system)
7. [Territory System](#territory-system)
8. [Decay Mechanic](#decay-mechanic)
9. [Player Progression](#player-progression)
10. [Team Mechanics](#team-mechanics)
11. [AR Scanner](#ar-scanner)
12. [Notifications](#notifications)
13. [Technical Architecture](#technical-architecture)

---

## Game Overview

**Street Art CTF** (Capture The Flag) is a location-based augmented reality game where players physically explore Prague to find and "capture" real street art for their team. Think Pokémon GO meets team-based territory control.

### Core Concept
- **Real World**: Players walk through Prague neighborhoods
- **Digital Overlay**: AR recognition identifies street art
- **Team Competition**: Red vs Blue battle for territory control
- **Personal Collection**: Solo mode for collectors

### Target Audience
- Urban explorers
- Street art enthusiasts
- Casual gamers who enjoy outdoor activities
- Competitive players who like territory control games

---

## Game Modes

### Solo Mode (Collection)
Personal discovery mode focused on exploration, not competition.

| Aspect | Description |
|--------|-------------|
| **Goal** | Discover all street art in Prague |
| **Progress** | Track found/total per district |
| **Scoring** | No competitive scoring |
| **Map Display** | Your discoveries in team color, unfound as gray |
| **Marker Opacity** | Undiscovered: 30%, Discovered: 100% |

### Battle Mode (Multiplayer)
Team-based territory control with real-time competition.

| Aspect | Description |
|--------|-------------|
| **Goal** | Control more territory than enemy team |
| **Teams** | Red vs Blue |
| **Scoring** | Points contribute to team total |
| **Map Display** | All captures with team colors + decay |
| **Marker Opacity** | Uncaptured: 30%, Captured: 100% (fading with decay) |

---

## Core Gameplay Loop

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│    1. FIND          2. SCAN           3. CAPTURE           │
│    ──────────       ──────────        ──────────           │
│    Walk streets     Point camera      Claim for team       │
│    Use map          AR recognizes     Earn points          │
│    Look for art     art instantly     Build streak         │
│                                                             │
│    ↓                    ↓                  ↓                │
│                                                             │
│    4. DOMINATE      5. DEFEND         6. REPEAT            │
│    ──────────       ──────────        ──────────           │
│    Control areas    Re-capture        Explore more         │
│    Build network    before decay      Climb leaderboard    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Find
- Use the in-game map to locate art markers
- Markers appear at GPS coordinates of real street art
- Navigate to the physical location

### Scan
- Open AR Scanner from SCAN tab
- Point device camera at street art
- Image recognition identifies the piece
- Must be within ~50m proximity

### Capture
- Successfully scanned art is captured for your team
- Points calculated based on size + bonuses
- Territory circle appears on map
- Notification shown to all players

---

## Map & Navigation

### Neighborhoods (Hoods)

| Hood | Location | Description | Art Count |
|------|----------|-------------|-----------|
| **Palmovka** | Prague 8 | Metro hub, urban center | ~6 pieces |
| **Vysočany** | Prague 9 | Industrial district, dense art | ~25 pieces |
| **Poděbrady** | East of Prague | Spa town, spread out | ~14 pieces |

### Map Features

| Feature | Description |
|---------|-------------|
| **Base Map** | CartoDB Light theme (clean, minimal) |
| **Zoom Range** | 13 (district) to 18 (street level) |
| **Markers** | Chumper mascot icons with color filters |
| **Territories** | Circle polygons around captured points |
| **Lines** | Connect nearby same-team captures |

### Marker Visual States

| State | Color | Opacity | Filter |
|-------|-------|---------|--------|
| Uncaptured | Gray | 30% | `grayscale(100%)` |
| Red Team | Red | 100% → fading | `hue-rotate(160deg)` |
| Blue Team | Blue | 100% → fading | `saturate(1)` |
| Ghost/Archived | Gray | 10% | `grayscale(100%)` |

---

## Art Points System

### Art Properties

Each street art piece has:

```javascript
{
  id: 'art-01',           // Unique identifier
  name: 'Kolbenova 1',    // Display name
  location: [lat, lng],   // GPS coordinates
  size: 'medium',         // sticker|small|medium|large
  status: 'active',       // active|ghost
  mhd: 'metroB',          // Nearby transit (metroB|tram12|null)
  capturedBy: null,       // red|blue|null
  area: 'Vysočany',       // Sub-district name
  hood: 'vysocany'        // Parent neighborhood
}
```

### Size Categories

| Size | Base Points | Territory Radius | Visual Size |
|------|-------------|------------------|-------------|
| Sticker | 25 pts | 0.001° (~100m) | Small |
| Small | 50 pts | 0.0012° (~120m) | Medium-small |
| Medium | 100 pts | 0.0015° (~150m) | Medium |
| Large | 200 pts | 0.002° (~200m) | Large |

### Status Types

| Status | Description | Capturable | Points |
|--------|-------------|------------|--------|
| **Active** | Exists in real world | Yes | Full value |
| **Ghost** | Removed/painted over | No (Battle) / Yes (Solo) | 50% value |

---

## Scoring System

### Base Points
Determined by art size (see above).

### Bonus Multipliers

All bonuses stack additively on top of base points:

| Bonus | Multiplier | Condition | Example (100pt base) |
|-------|------------|-----------|---------------------|
| **Streak** | +10% per level | Consecutive captures | 5th capture: +40 pts |
| **First Capture** | +25% | Never captured before | +25 pts |
| **Recapture** | +50% | Steal from enemy | +50 pts |
| **Speed** | +20% | Within 5 min of last | +20 pts |
| **Distance** | +5/100m (max 50) | Walk 50m+ between | 300m: +15 pts |

### Streak System

```
Capture 1: Base points (streak begins)
Capture 2: Base + 10%
Capture 3: Base + 20%
Capture 4: Base + 30%
...
Capture 10+: Base + 100% (maximum)
```

**Streak breaks when**: You don't capture anything (no time limit, just consecutive captures count)

### Maximum Points Example

Large art (200 pts) with all bonuses:
```
Base:           200
Streak (10x):   +200 (100%)
First Capture:  +50  (25%)
Recapture:      +100 (50%)
Speed:          +40  (20%)
Distance:       +50  (max)
─────────────────────────
TOTAL:          640 pts
```

---

## Territory System

### How Territories Work

1. **Capture Art** → Circle territory appears
2. **Circle Size** → Based on art size (large art = bigger territory)
3. **Nearby Captures** → Connected by lines (max 0.008° apart)
4. **Overlapping** → Creates stronger visual presence

### Territory Visualization

```
          ╭──────╮
         ╱        ╲
        │  🔵 Art  │    ← Blue team capture
        │   Point  │
         ╲        ╱
          ╰──────╯
              │
    ──────────┼──────────    ← Connection line
              │
          ╭──────╮
         ╱        ╲
        │  🔵 Art  │    ← Another blue capture
         ╲        ╱
          ╰──────╯
```

### Territory Properties

| Property | Value |
|----------|-------|
| Shape | Circle (24 segments) |
| Fill Opacity | 15% (fades with decay) |
| Stroke Opacity | 40% (fades with decay) |
| Connection Distance | Max 0.008° (~800m) |

---

## Decay Mechanic

### Core Concept
Captures are temporary. After 24 hours, a capture "decays" and no longer counts toward team score.

### Decay Timeline

```
0h ─────────── 12h ─────────── 24h ───────────→
│              │               │
Full points    Starts fading   No points
Full color     Desaturating    Grayed out
```

### Visual Decay

| Time | Saturation | Opacity | Score Value |
|------|------------|---------|-------------|
| 0-6h | 100% | 100% | 100% |
| 6-12h | 85% | 91% | 100% |
| 12-18h | 70% | 82% | 100% |
| 18-24h | 55% | 73% | 100% |
| 24h+ | 50% | 70% | **0%** |

### Strategic Implications

1. **Maintenance Required**: Teams must re-capture to maintain score
2. **Steal Opportunity**: Decayed enemy territories are easy targets
3. **Active Play**: Encourages regular gameplay, not one-time capture
4. **Comeback Mechanic**: Losing team can catch up if winning team stops playing

---

## Player Progression

### Player Profile Data

```javascript
{
  id: 'player-uuid',
  name: 'PlayerName',
  team: 'red' | 'blue',
  score: 0,              // Total points earned (lifetime)
  capturedArt: [],       // Array of captured art IDs
  streak: 0,             // Current consecutive captures
  maxStreak: 0,          // Best streak ever
  captureCount: 0,       // Total captures
  recaptureCount: 0,     // Total steals
  firstCaptureCount: 0,  // Virgin territories claimed
  lastCaptureTime: null,
  lastCaptureLocation: null
}
```

### Stats Tracked

| Stat | Description |
|------|-------------|
| **Total Score** | Lifetime points earned |
| **Captures** | Total art pieces captured |
| **Best Streak** | Highest consecutive capture count |
| **First Captures** | Never-before-captured art |
| **Current Streak** | Active streak |
| **Areas** | Unique districts explored |

### Leaderboard

- Ranked by total score
- Shows player name, team color, points
- Filters out "Street Artist" (default name)

---

## Team Mechanics

### Teams

| Team | Color | Hex Code |
|------|-------|----------|
| Red | 🔴 | #E53935 |
| Blue | 🔵 | #1E88E5 |

### Team Selection
- Chosen during onboarding
- Cannot be changed (tied to player identity)
- Affects all captured art color

### Team Score Calculation

```javascript
teamScore = sum(activeCaptures.map(capture => {
  if (isDecayed(capture)) return 0  // 24h+ = no points
  return capture.points
}))
```

### Battle Room Stats

| Metric | Description |
|--------|-------------|
| **Team Score** | Sum of active capture points |
| **% Control** | Score ratio as percentage |
| **Chomps Held** | Active (non-decayed) captures |
| **Unclaimed** | Art not yet captured by anyone |
| **Territory Breakdown** | Per-district control stats |

---

## AR Scanner

### How It Works

1. **Open Scanner** → Loads `ar-scanner.html`
2. **Camera Access** → Requests device camera
3. **Image Recognition** → Compares to known art database
4. **GPS Check** → Verifies player is near art location
5. **Capture Trigger** → On successful match, captures for team

### Scanner States

| State | UI Display |
|-------|------------|
| **Loading** | "Opening Scanner" animation |
| **Scanning** | Camera view with AR overlay |
| **Success** | Capture animation + points |
| **No Match** | "No art detected" message |
| **Too Far** | "Get closer" warning |

### Capture Flow in Scanner

```
Match Found
    │
    ├─── Is Ghost? ──→ "This art no longer exists"
    │
    ├─── Already Yours? ──→ "Already yours!"
    │
    └─── Valid Capture ──→ Calculate points
                              │
                              ├─── First capture? +25%
                              ├─── Recapture? +50%
                              ├─── Streak bonus
                              ├─── Speed bonus
                              └─── Distance bonus
                              │
                              └──→ Show success screen
                                   Update Firebase
                                   Trigger notification
```

---

## Notifications

### Capture Notification

Full-screen notification shown when territory changes hands.

#### For Active Player (You Captured)

```
┌─────────────────────────────┐
│    TERRITORY CAPTURED       │
│                             │
│        CAPTURED             │
│      "Kolbenova 1"          │
│                             │
│  [Eat Animation if steal]   │
│                             │
│         +150                │
│        POINTS               │
│                             │
│      STREAK x5              │
│                             │
│      by PlayerName          │
│       Team BLUE             │
└─────────────────────────────┘
```

#### For Victim (Your Art Stolen)

```
┌─────────────────────────────┐
│      TERRITORY LOST         │
│                             │
│          LOST               │
│      "Kolbenova 1"          │
│                             │
│  [Eat Animation]            │
│                             │
│      (no points shown)      │
│                             │
│      by EnemyName           │
│       Team RED              │
└─────────────────────────────┘
```

### Eat Animation

When territory is stolen, an animated "chomp eating" plays:
- **EAT_A**: Red team steals from Blue (red chomp eating blue)
- **EAT_B**: Blue team steals from Red (blue chomp eating red)
- 41 frames at ~24fps

### Notification Duration

- **Default**: 3.9 seconds
- Animation loop: ~1.7 seconds

---

## Technical Architecture

### Data Storage

| Store | Type | Purpose |
|-------|------|---------|
| **Firebase Firestore** | Cloud | Captures, players, team scores |
| **LocalStorage** | Device | Player data, discoveries, preferences |

### Firebase Collections

```
streetart-captures/
  └── {artId}/
      ├── artId
      ├── capturedBy (red|blue)
      ├── capturedAt (timestamp)
      ├── playerId
      ├── playerName
      ├── points
      ├── streak
      ├── isFirstCapture
      └── isRecapture

streetart-players/
  └── {playerId}/
      ├── id
      ├── name
      ├── team
      └── score

streetart-teams/
  └── red/ & blue/
      └── score
```

### Real-time Sync

- Firebase `onSnapshot` listeners for live updates
- All players see captures in real-time
- Team scores update immediately

### Offline Support

- LocalStorage caches player data
- Can view map/collection offline
- Captures require connectivity

---

## Game Constants Summary

### Points

| Item | Value |
|------|-------|
| Sticker base | 25 |
| Small base | 50 |
| Medium base | 100 |
| Large base | 200 |
| Ghost penalty | 50% |

### Bonuses

| Bonus | Value |
|-------|-------|
| Streak | +10%/level (max 100%) |
| First capture | +25% |
| Recapture | +50% |
| Speed (<5 min) | +20% |
| Distance | +5/100m (max 50 pts) |

### Timing

| Item | Duration |
|------|----------|
| Decay period | 24 hours |
| Speed bonus window | 5 minutes |
| Capture notification | 3.9 seconds |
| Eat animation | ~1.7 seconds |

### Map

| Item | Value |
|------|-------|
| Default zoom | 15 |
| Min zoom | 13 |
| Max zoom | 18 |
| Territory radius (large) | 0.002° |
| Connection distance | 0.008° |

---

## Future Considerations

### Potential Features
- [ ] More teams (4-way battle)
- [ ] Special events / limited-time art
- [ ] Achievements / badges
- [ ] Social features (friends, crews)
- [ ] Art submission by players
- [ ] Seasonal leaderboards
- [ ] Power-ups / special abilities

### Balance Considerations
- Decay rate tuning (24h may be too short/long)
- Bonus multiplier adjustments
- Territory size vs density
- New player experience
- Dominant team comeback mechanics

---

*Document Version: 1.0*
*Last Updated: December 2024*
