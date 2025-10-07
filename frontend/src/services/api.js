import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001'

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
  login: (credentials) => {
    console.log('🔐 Intentando login con:', credentials)
    // Usar axios directamente para login (sin token de autorización)
    return axios.post(`${API_BASE_URL}/api/auth/login`, credentials)
  },
  logout: () => {
    // Para nuestro backend, solo necesitamos limpiar el token localmente
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
    }
  },
}

export const userService = {
  getAll: (params = {}) => api.get('/usuarios', { params }),
  getById: (id) => api.get(`/usuarios/${id}`),
  create: (userData) => api.post('/usuarios', userData),
  update: (id, userData) => api.put(`/usuarios/${id}`, userData),
  delete: (id) => api.delete(`/usuarios/${id}`),
}

export default api
