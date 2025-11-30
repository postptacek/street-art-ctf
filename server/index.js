import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

// Routes
import authRoutes from './routes/auth.js'
import gameRoutes from './routes/game.js'
import artRoutes from './routes/art.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST']
  }
})

// Middleware
app.use(cors())
app.use(express.json())

// Make io accessible to routes
app.set('io', io)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/game', gameRoutes)
app.use('/api/art', artRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id)

  // Join team room
  socket.on('join-team', (team) => {
    socket.join(`team-${team}`)
    console.log(`Player ${socket.id} joined team ${team}`)
  })

  // Handle art capture (broadcast to all players)
  socket.on('art-captured', (data) => {
    io.emit('art-update', data)
  })

  // Handle sector control change
  socket.on('sector-captured', (data) => {
    io.emit('sector-update', data)
  })

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id)
  })
})

// Connect to MongoDB (optional - game works without it)
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI)
      console.log('Connected to MongoDB')
    }
  } catch (err) {
    console.log('MongoDB not available, using in-memory data')
  }
}

const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  connectDB()
})
