import express from 'express'

const router = express.Router()

// In-memory street art database
const streetArt = [
  { id: 'art-1', name: 'Lennon Wall Fragment', sectorId: 'sector-3', capturedBy: 'blue', points: 100, imageHash: 'lennon-wall', location: { lat: 50.0865, lng: 14.4066 } },
  { id: 'art-2', name: 'Dancing House Mural', sectorId: 'sector-2', capturedBy: 'red', points: 150, imageHash: 'dancing-house', location: { lat: 50.0755, lng: 14.4149 } },
  { id: 'art-3', name: 'Metronome Graffiti', sectorId: 'sector-8', capturedBy: null, points: 200, imageHash: 'metronome', location: { lat: 50.0963, lng: 14.4180 } },
  { id: 'art-4', name: 'Astronomical Clock Art', sectorId: 'sector-1', capturedBy: null, points: 250, imageHash: 'astronomical', location: { lat: 50.0870, lng: 14.4207 } },
  { id: 'art-5', name: 'Kafka Street Art', sectorId: 'sector-1', capturedBy: null, points: 175, imageHash: 'kafka', location: { lat: 50.0900, lng: 14.4180 } },
  { id: 'art-6', name: 'TV Tower Baby', sectorId: 'sector-6', capturedBy: null, points: 300, imageHash: 'tv-tower', location: { lat: 50.0810, lng: 14.4500 } },
  { id: 'art-7', name: 'Tram 22 Tag', sectorId: 'tram-22', capturedBy: 'red', points: 125, imageHash: 'tram22', location: { lat: 50.0800, lng: 14.4000 } },
  { id: 'art-8', name: 'Smíchov Underground', sectorId: 'sector-7', capturedBy: 'yellow', points: 180, imageHash: 'smichov', location: { lat: 50.0706, lng: 14.4039 } },
  { id: 'art-9', name: 'Vinohrady Vineyard', sectorId: 'sector-5', capturedBy: 'green', points: 140, imageHash: 'vinohrady', location: { lat: 50.0750, lng: 14.4400 } },
  { id: 'art-10', name: 'Castle Dragon', sectorId: 'sector-4', capturedBy: null, points: 275, imageHash: 'dragon', location: { lat: 50.0910, lng: 14.4010 } },
]

// Team scores (shared reference)
const teamScores = {
  red: 375,
  blue: 208,
  green: 140,
  yellow: 180
}

// Get all street art
router.get('/', (req, res) => {
  // Don't expose exact locations - only sector info
  const publicArt = streetArt.map(art => ({
    id: art.id,
    name: art.name,
    sectorId: art.sectorId,
    capturedBy: art.capturedBy,
    points: art.points
  }))
  
  res.json(publicArt)
})

// Get art by sector
router.get('/sector/:sectorId', (req, res) => {
  const { sectorId } = req.params
  const sectorArt = streetArt.filter(art => art.sectorId === sectorId)
  
  res.json(sectorArt.map(art => ({
    id: art.id,
    name: art.name,
    capturedBy: art.capturedBy,
    points: art.points
  })))
})

// Verify and capture art (simulates MindAR recognition)
router.post('/capture', (req, res) => {
  const { artId, imageHash, team, playerId } = req.body
  
  if (!team || !['red', 'blue', 'green', 'yellow'].includes(team)) {
    return res.status(400).json({ error: 'Invalid team' })
  }
  
  // Find art by ID or image hash
  let art = artId 
    ? streetArt.find(a => a.id === artId)
    : streetArt.find(a => a.imageHash === imageHash)
  
  if (!art) {
    return res.status(404).json({ 
      success: false, 
      error: 'Street art not found' 
    })
  }
  
  // Check if already captured by same team
  if (art.capturedBy === team) {
    return res.json({ 
      success: false, 
      error: 'Already captured by your team',
      art: { id: art.id, name: art.name }
    })
  }
  
  // Record previous team for scoring
  const previousTeam = art.capturedBy
  
  // Update capture
  art.capturedBy = team
  
  // Update team scores
  teamScores[team] += art.points
  if (previousTeam) {
    teamScores[previousTeam] = Math.max(0, teamScores[previousTeam] - art.points)
  }
  
  // Emit real-time update
  const io = req.app.get('io')
  io.emit('art-captured', {
    artId: art.id,
    artName: art.name,
    team,
    previousTeam,
    points: art.points,
    playerId
  })
  
  res.json({
    success: true,
    art: {
      id: art.id,
      name: art.name,
      points: art.points
    },
    teamScores
  })
})

// Get art recognition targets (for MindAR setup)
router.get('/targets', (req, res) => {
  // In production, this would return MindAR .mind file or image targets
  const targets = streetArt.map(art => ({
    id: art.id,
    imageHash: art.imageHash,
    name: art.name
  }))
  
  res.json(targets)
})

export default router
