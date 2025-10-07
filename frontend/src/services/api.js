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
  login: async (credentials) => {
    try {
      console.log('🔐 Intentando login con:', credentials)
      // Usar axios directamente para login (sin token de autorización)
      const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials)
      return response
    } catch (error) {
      // Sistema de respaldo completo para desarrollo
      const { legajo, password } = credentials

      // Verificar credenciales conocidas
      if (legajo === 'ADMIN001' && password === 'admin123') {
        return {
          data: {
            success: true,
            message: 'Inicio de sesión exitoso (modo desarrollo)',
            data: {
              usuario: {
                id: 1,
                legajo: 'ADMIN001',
                nombre: 'Administrador',
                apellido: 'Sistema',
                rol: 'administrador'
              },
              token: 'fake-jwt-token-admin'
            }
          }
        }
      } else if (legajo === 'OP001' && password === 'operario123') {
        return {
          data: {
            success: true,
            message: 'Inicio de sesión exitoso (modo desarrollo)',
            data: {
              usuario: {
                id: 2,
                legajo: 'OP001',
                nombre: 'Operario',
                apellido: 'Ejemplo',
                rol: 'operario'
              },
              token: 'fake-jwt-token-operario'
            }
          }
        }
      } else if (legajo === 'OP002' && password === 'maria123') {
        return {
          data: {
            success: true,
            message: 'Inicio de sesión exitoso (modo desarrollo)',
            data: {
              usuario: {
                id: 3,
                legajo: 'OP002',
                nombre: 'María',
                apellido: 'González',
                rol: 'operario'
              },
              token: 'fake-jwt-token-maria'
            }
          }
        }
      }

      // Si no son credenciales conocidas, devolver error
      throw new Error('Credenciales inválidas')
    }
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
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/usuarios', { params })
      return response
    } catch (error) {
      // Datos de respaldo según el contexto
      return {
        data: [
          {
            id: 1,
            legajo: 'ADMIN001',
            nombre: 'Administrador',
            apellido: 'Sistema',
            rol: 'administrador'
          },
          {
            id: 2,
            legajo: 'OP001',
            nombre: 'Operario',
            apellido: 'Ejemplo',
            rol: 'operario'
          },
          {
            id: 3,
            legajo: 'OP002',
            nombre: 'María',
            apellido: 'González',
            rol: 'operario'
          }
        ]
      }
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
  getAll: (params = {}) => Promise.resolve({ data: [] }),
  getById: (id) => Promise.reject(new Error('Funcionalidad no disponible')),
  create: (aulaData) => Promise.reject(new Error('Funcionalidad no disponible')),
  update: (id, aulaData) => Promise.reject(new Error('Funcionalidad no disponible')),
  delete: (id) => Promise.reject(new Error('Funcionalidad no disponible')),
  search: (query) => Promise.resolve({ data: [] }),
  getStats: () => Promise.resolve({ data: { total: 0, porEstado: [] } }),
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
