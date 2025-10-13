import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3003'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    // Solo agregar token si estamos en el navegador (localStorage disponible)
    if (typeof window !== 'undefined' && localStorage) {
      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor para manejar respuestas y renovar token si es necesario
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido, limpiar datos y redirigir a login
      if (typeof window !== 'undefined' && localStorage) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const authService = {
  login: async (credentials) => {
    console.log('🔐 Intentando login con:', credentials)
    const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials)
    return response
  },
  logout: () => {
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
    }
  },
}

export const userService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/usuarios', { params })
      return response
    } catch (error) {
      // Don't return fallback data in production - let the component handle the error
      throw error
    }
  },
  getById: (id) => api.get(`/usuarios/${id}`),
  create: (userData) => api.post('/usuarios', userData),
  update: (id, userData) => api.put(`/usuarios/${id}`, userData),
  delete: (id) => api.delete(`/usuarios/${id}`),
}

// Servicios placeholder para mantener compatibilidad con las páginas existentes
// Estos servicios devolverán datos vacíos o errores apropiados hasta que se implementen funcionalidades específicas

export const aulaService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/aulas', { params })
      return response
    } catch (error) {
      throw error
    }
  },
  getById: (id) => api.get(`/aulas/${id}`),
  create: (aulaData) => api.post('/aulas', aulaData),
  update: (id, aulaData) => api.put(`/aulas/${id}`, aulaData),
  delete: (id) => api.delete(`/aulas/${id}`),
  heartbeat: (id) => api.post(`/aulas/${id}/heartbeat`),
  updateSensores: (id, sensoresData) => api.put(`/aulas/${id}/sensores`, sensoresData),
}

export const classroomService = aulaService

export const historyService = {
  getAll: (params) => Promise.resolve({ data: [] }),
  getByClassroom: (classroomId, params) => Promise.resolve({ data: [] }),
  getBySensor: (sensorId, params) => Promise.resolve({ data: [] }),
  getEstadisticas: (params) => Promise.resolve({ data: {} }),
  exportarCSV: (params) => Promise.reject(new Error('Funcionalidad no disponible')),
}

export default api
