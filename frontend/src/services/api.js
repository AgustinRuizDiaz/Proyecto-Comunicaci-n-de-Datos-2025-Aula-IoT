import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001/api'

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
        config.headers.Authorization = `Bearer ${token}`  // ← Usar Bearer para JWT
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
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const authService = {
  login: (credentials) => {
    console.log('🔐 Intentando login con:', credentials)
    // Usar axios directamente para login (sin token de autorización)
    return axios.post(`${API_BASE_URL}/auth/login`, credentials)
  },
  logout: () => {
    // Para nuestro backend, solo necesitamos limpiar el token localmente
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
    }
  },
  getProfile: () => api.get('/api/auth/profile'),
}

export const aulaService = {
  getAll: (params = {}) => api.get('/api/aulas', { params }),
  getById: (id) => api.get(`/api/aulas/${id}`),
  create: (aulaData) => api.post('/api/aulas', aulaData),
  update: (id, aulaData) => api.put(`/api/aulas/${id}`, aulaData),
  delete: (id) => api.delete(`/api/aulas/${id}`),
  search: (query) => api.get(`/api/aulas/search?q=${query}`),
  getStats: () => api.get('/api/aulas/stats'),
}

// Mantener compatibilidad hacia atrás
export const classroomService = aulaService

export const userService = {
  getAll: (params = {}) => api.get('/api/usuarios', { params }),
  getById: (id) => api.get(`/api/usuarios/${id}`),
  create: (userData) => api.post('/api/usuarios', userData),
  update: (id, userData) => api.put(`/api/usuarios/${id}`, userData),
  delete: (id) => api.delete(`/api/usuarios/${id}`),
  getStats: () => api.get('/api/usuarios/stats'),
}

export const historyService = {
  getAll: (params) => api.get('/history/', { params }),
  getByClassroom: (classroomId, params) => api.get(`/history/classroom/${classroomId}/`, { params }),
  getBySensor: (sensorId, params) => api.get(`/history/sensor/${sensorId}/`, { params }),
  getEstadisticas: (params) => api.get('/history/estadisticas/', { params }),
  exportarCSV: (params) => api.get('/history/exportar_csv/', { params, responseType: 'blob' }),
}

export default api
