import { useEffect, useState, useCallback } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

let socket = null

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState(null)

  useEffect(() => {
    if (!socket) {
      socket = io(SOCKET_URL, {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      })
    }

    function onConnect() {
      setIsConnected(true)
      console.log('Socket connected')
    }

    function onDisconnect() {
      setIsConnected(false)
      console.log('Socket disconnected')
    }

    function onArtCaptured(data) {
      setLastEvent({ type: 'art-captured', data, timestamp: Date.now() })
    }

    function onSectorUpdate(data) {
      setLastEvent({ type: 'sector-update', data, timestamp: Date.now() })
    }

    function onArtUpdate(data) {
      setLastEvent({ type: 'art-update', data, timestamp: Date.now() })
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('art-captured', onArtCaptured)
    socket.on('sector-update', onSectorUpdate)
    socket.on('art-update', onArtUpdate)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('art-captured', onArtCaptured)
      socket.off('sector-update', onSectorUpdate)
      socket.off('art-update', onArtUpdate)
    }
  }, [])

  const joinTeam = useCallback((team) => {
    if (socket) {
      socket.emit('join-team', team)
    }
  }, [])

  const emitArtCaptured = useCallback((data) => {
    if (socket) {
      socket.emit('art-captured', data)
    }
  }, [])

  const emitSectorCaptured = useCallback((data) => {
    if (socket) {
      socket.emit('sector-captured', data)
    }
  }, [])

  return {
    isConnected,
    lastEvent,
    joinTeam,
    emitArtCaptured,
    emitSectorCaptured
  }
}

export default useSocket
