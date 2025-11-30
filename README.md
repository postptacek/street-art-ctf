# 🎨 Street Art CTF

An augmented reality capture-the-flag game where teams compete to claim street art in their city!

## Features

- **AR Street Art Scanning**: Use MindAR to scan and capture street art
- **Team-Based Gameplay**: Join a team and capture art for your faction
- **3D Interactive Map**: Explore sectors with Three.js visualization
- **Real-Time Scoring**: Track team scores and individual contributions
- **Sector System**: Neighborhood and tram line territories
- **Smooth Animations**: Framer Motion powered UI

## Tech Stack

### Frontend
- React 18 + Vite
- Three.js + React Three Fiber
- Framer Motion
- MindAR (Image Tracking)
- TailwindCSS

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT Authentication
- Socket.IO (real-time updates)

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
# Install all dependencies
npm run install:all

# Start development servers
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Game Mechanics

1. **Join a Team**: Red, Blue, Green, or Yellow
2. **Explore the Map**: View sectors and tram lines
3. **Find Street Art**: Navigate to sectors (exact locations hidden)
4. **Scan to Capture**: Use AR camera to recognize and claim art
5. **Earn Points**: Score points for your team
6. **Dominate Sectors**: Control neighborhoods and tram lines

## Environment Variables

Create `.env` files in both client and server directories:

### Server (.env)
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/street-art-ctf
JWT_SECRET=your-secret-key
```

### Client (.env)
```
VITE_API_URL=http://localhost:3001/api
```
