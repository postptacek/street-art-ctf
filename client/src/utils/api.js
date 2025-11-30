import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth API
export const authAPI = {
  register: (username, password, team) => 
    api.post('/auth/register', { username, password, team }),
  
  login: (username, password) => 
    api.post('/auth/login', { username, password }),
  
  joinTeam: (username, team) => 
    api.post('/auth/join-team', { username, team })
}

// Game API
export const gameAPI = {
  getState: () => api.get('/game/state'),
  getSectors: () => api.get('/game/sectors'),
  getScores: () => api.get('/game/scores'),
  getLeaderboard: () => api.get('/game/leaderboard'),
  
  captureSector: (sectorId, team) => 
    api.post(`/game/sector/${sectorId}/capture`, { team })
}

// Street Art API
export const artAPI = {
  getAll: () => api.get('/art'),
  getBySector: (sectorId) => api.get(`/art/sector/${sectorId}`),
  getTargets: () => api.get('/art/targets'),
  
  capture: (artId, imageHash, team, playerId) =>
    api.post('/art/capture', { artId, imageHash, team, playerId })
}

// Health check
export const checkHealth = () => api.get('/health')

export default api
