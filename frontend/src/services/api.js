import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const authService = {
  login: (credentials) => {
    console.log('🔐 Intentando login directo con:', credentials)
    return axios.post(`${API_BASE_URL}/test-endpoint/`, credentials)
  },
  logout: () => api.post('/test-endpoint/'),
  refreshToken: (refreshToken) => api.post('/test-endpoint/', { refresh: refreshToken }),
  getProfile: () => api.get('/test-endpoint/'),
}

export const aulaService = {
  getAll: (params = {}) => api.get('/classrooms/', { params }),
  getById: (id) => api.get(`/classrooms/${id}/`),
  create: (aulaData) => api.post('/classrooms/', aulaData),
  update: (id, aulaData) => api.put(`/classrooms/${id}/`, aulaData),
  delete: (id) => api.delete(`/classrooms/${id}/`),
  checkConnectivity: (id) => api.post(`/classrooms/${id}/verificar_conectividad/`),
  toggleLights: (id) => api.post(`/classrooms/${id}/toggle_lights/`),
  getStats: (id) => api.get(`/classrooms/${id}/estadisticas/`),
  getSummary: () => api.get('/classrooms/resumen_general/'),
}

// Mantener compatibilidad hacia atrás
export const classroomService = aulaService

export const sensorService = {
  getAll: () => api.get('/sensors/'),
  getById: (id) => api.get(`/sensors/${id}/`),
  create: (sensorData) => api.post('/sensors/', sensorData),
  update: (id, sensorData) => api.put(`/sensors/${id}/`, sensorData),
  delete: (id) => api.delete(`/sensors/${id}/`),
  getData: (id, params) => api.get(`/sensors/${id}/data/`, { params }),
}

export const userService = {
  getAll: (params = {}) => api.get('/users/', { params }),
  getById: (id) => api.get(`/users/${id}/`),
  create: (userData) => api.post('/users/', userData),
  update: (id, userData) => api.put(`/users/${id}/`, userData),
  delete: (id) => api.delete(`/users/${id}/`),
}

export const historyService = {
  getAll: (params) => api.get('/history/', { params }),
  getByClassroom: (classroomId, params) => api.get(`/history/classroom/${classroomId}/`, { params }),
  getBySensor: (sensorId, params) => api.get(`/history/sensor/${sensorId}/`, { params }),
  getEstadisticas: (params) => api.get('/history/estadisticas/', { params }),
  exportarCSV: (params) => api.get('/history/exportar_csv/', { params, responseType: 'blob' }),
}

export default api
