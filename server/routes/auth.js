import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const router = express.Router()

// In-memory user store (replace with MongoDB in production)
const users = new Map()

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password, team } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' })
    }

    if (users.has(username)) {
      return res.status(400).json({ error: 'Username already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = {
      id: Date.now().toString(),
      username,
      password: hashedPassword,
      team: team || null,
      score: 0,
      capturedArt: [],
      createdAt: new Date()
    }

    users.set(username, user)

    const token = jwt.sign(
      { id: user.id, username },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        team: user.team,
        score: user.score,
        capturedArt: user.capturedArt
      }
    })
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    const user = users.get(username)
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { id: user.id, username },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        team: user.team,
        score: user.score,
        capturedArt: user.capturedArt
      }
    })
  } catch (err) {
    res.status(500).json({ error: 'Login failed' })
  }
})

// Join team
router.post('/join-team', (req, res) => {
  try {
    const { username, team } = req.body

    if (!['red', 'blue', 'green', 'yellow'].includes(team)) {
      return res.status(400).json({ error: 'Invalid team' })
    }

    const user = users.get(username)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    user.team = team
    users.set(username, user)

    res.json({ success: true, team })
  } catch (err) {
    res.status(500).json({ error: 'Failed to join team' })
  }
})

export default router
