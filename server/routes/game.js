import express from 'express'

const router = express.Router()

// In-memory game state
const gameState = {
  sectors: [
    { id: 'sector-1', name: 'Old Town', type: 'neighborhood', position: [0, 0], controlledBy: null, artCount: 5 },
    { id: 'sector-2', name: 'New Town', type: 'neighborhood', position: [2, 0], controlledBy: 'red', artCount: 4 },
    { id: 'sector-3', name: 'Lesser Town', type: 'neighborhood', position: [-2, 1], controlledBy: 'blue', artCount: 6 },
    { id: 'sector-4', name: 'Castle District', type: 'neighborhood', position: [-2, -1], controlledBy: null, artCount: 3 },
    { id: 'sector-5', name: 'Vinohrady', type: 'neighborhood', position: [3, 1], controlledBy: 'green', artCount: 7 },
    { id: 'sector-6', name: 'Žižkov', type: 'neighborhood', position: [3, -1], controlledBy: null, artCount: 8 },
    { id: 'sector-7', name: 'Smíchov', type: 'neighborhood', position: [-3, 0], controlledBy: 'yellow', artCount: 4 },
    { id: 'sector-8', name: 'Holešovice', type: 'neighborhood', position: [0, 2], controlledBy: null, artCount: 5 },
    { id: 'tram-22', name: 'Tram Line 22', type: 'tramline', path: [[-3, 0], [-2, 0], [0, 0], [2, 0], [3, 1]], controlledBy: 'red', artCount: 10 },
    { id: 'tram-9', name: 'Tram Line 9', type: 'tramline', path: [[0, 2], [0, 0], [0, -2]], controlledBy: null, artCount: 6 },
    { id: 'tram-17', name: 'Tram Line 17', type: 'tramline', path: [[-2, 1], [0, 0], [3, -1]], controlledBy: 'blue', artCount: 8 },
  ],
  teamScores: {
    red: 375,
    blue: 208,
    green: 140,
    yellow: 180
  }
}

// Get game state
router.get('/state', (req, res) => {
  res.json(gameState)
})

// Get sectors
router.get('/sectors', (req, res) => {
  res.json(gameState.sectors)
})

// Get team scores
router.get('/scores', (req, res) => {
  res.json(gameState.teamScores)
})

// Update sector control
router.post('/sector/:sectorId/capture', (req, res) => {
  const { sectorId } = req.params
  const { team } = req.body
  
  const sector = gameState.sectors.find(s => s.id === sectorId)
  if (!sector) {
    return res.status(404).json({ error: 'Sector not found' })
  }
  
  const previousTeam = sector.controlledBy
  sector.controlledBy = team
  
  // Emit real-time update
  const io = req.app.get('io')
  io.emit('sector-update', { sectorId, team, previousTeam })
  
  res.json({ success: true, sector })
})

// Get leaderboard
router.get('/leaderboard', (req, res) => {
  const leaderboard = {
    teams: Object.entries(gameState.teamScores)
      .sort((a, b) => b[1] - a[1])
      .map(([team, score], index) => ({
        rank: index + 1,
        team,
        score
      })),
    // Mock player leaderboard
    players: [
      { rank: 1, name: 'StreetKing', team: 'red', score: 1250, captures: 12 },
      { rank: 2, name: 'ArtHunter', team: 'blue', score: 980, captures: 9 },
      { rank: 3, name: 'GraffitiMaster', team: 'green', score: 875, captures: 8 },
      { rank: 4, name: 'WallWalker', team: 'yellow', score: 720, captures: 7 },
      { rank: 5, name: 'SprayQueen', team: 'red', score: 650, captures: 6 },
    ]
  }
  
  res.json(leaderboard)
})

export default router
