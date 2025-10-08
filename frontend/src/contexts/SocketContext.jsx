import { createContext, useContext, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      socketRef.current = io(import.meta.env.VITE_WS_URL || 'http://localhost:3002', {
        auth: {
          token
        }
      })

      socketRef.current.on('connect', () => {
        console.log('✅ Connected to WebSocket')
      })

      socketRef.current.on('disconnect', () => {
        console.log('❌ Disconnected from WebSocket')
      })

      socketRef.current.on('connect_error', (error) => {
        console.log('⚠️ WebSocket connection error:', error.message)
      })

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect()
        }
      }
    }
  }, [])

  const emit = (event, data) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data)
    } else {
      console.log('Socket not connected, cannot emit:', event, data)
    }
  }

  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback)
    } else {
      console.log('Socket not connected, cannot listen to:', event)
    }
  }

  const off = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback)
    }
  }

  const value = {
    socket: socketRef.current,
    emit,
    on,
    off
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}
