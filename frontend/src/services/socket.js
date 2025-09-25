import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
  }

  connect(token = null) {
    const options = {
      transports: ['websocket', 'polling'],
    }

    if (token) {
      options.auth = { token }
    }

    this.socket = io(SOCKET_URL, options)

    this.socket.on('connect', () => {
      this.isConnected = true
      console.log('Connected to WebSocket')
    })

    this.socket.on('disconnect', () => {
      this.isConnected = false
      console.log('Disconnected from WebSocket')
    })

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.isConnected = false
    }
  }

  // Sensor events
  onSensorUpdate(callback) {
    if (this.socket) {
      this.socket.on('sensor_update', callback)
    }
  }

  offSensorUpdate(callback) {
    if (this.socket) {
      this.socket.off('sensor_update', callback)
    }
  }

  // Classroom events
  onClassroomStatusChange(callback) {
    if (this.socket) {
      this.socket.on('classroom_status_change', callback)
    }
  }

  offClassroomStatusChange(callback) {
    if (this.socket) {
      this.socket.off('classroom_status_change', callback)
    }
  }

  // Alert events
  onAlert(callback) {
    if (this.socket) {
      this.socket.on('alert', callback)
    }
  }

  offAlert(callback) {
    if (this.socket) {
      this.socket.off('alert', callback)
    }
  }

  // Join room
  joinRoom(roomId) {
    if (this.socket) {
      this.socket.emit('join', roomId)
    }
  }

  // Leave room
  leaveRoom(roomId) {
    if (this.socket) {
      this.socket.emit('leave', roomId)
    }
  }

  // Emit custom event
  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data)
    }
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected
  }
}

export default new SocketService()
