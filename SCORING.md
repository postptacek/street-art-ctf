# Street Art CTF - Scoring System

## Overview

The game has two modes:
- **Solo Mode**: Personal discovery collection (no multiplayer scoring)
- **Battle Mode**: Team-based territory control with competitive scoring

---

## Base Points by Art Size

Each street art piece has a size category that determines its base point value:

| Size | Base Points |
|------|-------------|
| Sticker | 25 pts |
| Small | 50 pts |
| Medium | 100 pts |
| Large | 200 pts |

---

## Scoring Bonuses (Multipliers)

When you capture an art piece, multiple bonuses can stack on top of the base points:

### 1. Streak Bonus (+10% per streak, max +100%)

Consecutive captures increase your bonus:
- 1st capture: +0% (no streak yet)
- 2nd capture: +10%
- 3rd capture: +20%
- 4th capture: +30%
- ...
- 10th+ capture: +100% (max)

**Example**: Medium art (100 pts) on 5th streak = 100 + 50 = **150 pts**

### 2. First Capture Bonus (+25%)

If the art has never been captured by anyone before:
- +25% of base points

**Example**: Large art (200 pts) first capture = 200 + 50 = **250 pts**

### 3. Recapture/Steal Bonus (+50%)

When you capture art that was held by the enemy team:
- +50% of base points

**Example**: Medium art (100 pts) stolen from enemy = 100 + 50 = **150 pts**

### 4. Speed Bonus (+20%)

If you capture within 5 minutes of your last capture:
- +20% of base points

**Example**: Small art (50 pts) captured quickly = 50 + 10 = **60 pts**

### 5. Distance Bonus (+5 pts per 100m, max +50)

Walking between captures rewards exploration:
- Minimum 50m to qualify
- +5 points per 100m walked
- Maximum +50 points

**Example**: 300m walked = +15 pts

---

## Combined Scoring Example

**Scenario**: You capture a Large art piece (200 pts base) that:
- Was owned by enemy team (recapture)
- Is your 5th capture in a row (4x streak)
- You captured it within 5 minutes (speed)
- You walked 400m from last capture

| Component | Calculation | Points |
|-----------|-------------|--------|
| Base | Large size | 200 |
| Streak (4x) | 200 × 40% | +80 |
| Recapture | 200 × 50% | +100 |
| Speed | 200 × 20% | +40 |
| Distance (400m) | 4 × 5 | +20 |
| **TOTAL** | | **440 pts** |

---

## Team Scoring (Battle Mode)

### How Teams Gain Points
- When a player captures art, points are added to their team's total
- All bonuses count toward team score

### How Teams Lose Points (Decay System)

**24-Hour Decay**: Captures gradually lose value over time:

- **0-12 hours**: Full point value
- **12-24 hours**: Points gradually decrease (visual fade on map)
- **After 24 hours**: Points no longer count toward team score

**Important**: 
- The capture still exists, but doesn't contribute to score
- Re-capturing the same art refreshes the timer
- Visual indicator: captured territories fade as they decay

### Territory Control

In Battle Mode, the team scores shown are calculated from **active captures only** (not fully decayed).

---

## Ghost/Archived Art

Some art pieces are marked as "ghost" (archived):
- These are real locations where art used to exist
- Worth 50% of normal base points
- Cannot be captured in Battle Mode
- Still count for Solo Mode discovery

---

## Solo Mode (Collection)

In Solo Mode, there's no competitive scoring. Instead:
- Track personal discoveries across all areas
- Progress shown per district (Vysočany, Palmovka, Poděbrady, etc.)
- Goal: discover all street art in Prague

---

## Player Stats

Your profile tracks:
- **Total Score**: Cumulative points earned
- **Captures**: Total art pieces captured
- **Best Streak**: Highest consecutive capture streak
- **First Captures**: How many virgin territories you've claimed
- **Current Streak**: Active capture streak
- **Areas**: Unique districts explored

---

## Summary Table

| Bonus Type | Multiplier | Condition |
|------------|------------|-----------|
| Streak | +10% per level (max 100%) | Consecutive captures |
| First Capture | +25% | Never captured before |
| Recapture | +50% | Steal from enemy |
| Speed | +20% | Within 5 min of last |
| Distance | +5/100m (max 50 pts) | Walk 50m+ between |
| Decay | -100% after 24h | Time since capture |
