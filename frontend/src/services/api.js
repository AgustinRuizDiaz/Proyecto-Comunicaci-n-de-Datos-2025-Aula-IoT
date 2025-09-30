import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Note: Axios interceptors are handled in AuthContext.jsx
// to avoid conflicts and ensure proper token management

export const authService = {
  login: (credentials) => api.post('/users/login/', credentials),
  logout: () => api.post('/users/logout/'),
  refreshToken: (refreshToken) => api.post('/users/token/refresh/', { refresh: refreshToken }),
  getProfile: () => api.get('/users/profile/'),
}

export const classroomService = {
  getAll: () => api.get('/classrooms/'),
  getById: (id) => api.get(`/classrooms/${id}/`),
  create: (classroomData) => api.post('/classrooms/', classroomData),
  update: (id, classroomData) => api.put(`/classrooms/${id}/`, classroomData),
  delete: (id) => api.delete(`/classrooms/${id}/`),
  getSensors: (id) => api.get(`/classrooms/${id}/sensors/`),
}

export const sensorService = {
  getAll: () => api.get('/sensors/'),
  getById: (id) => api.get(`/sensors/${id}/`),
  create: (sensorData) => api.post('/sensors/', sensorData),
  update: (id, sensorData) => api.put(`/sensors/${id}/`, sensorData),
  delete: (id) => api.delete(`/sensors/${id}/`),
  getData: (id, params) => api.get(`/sensors/${id}/data/`, { params }),
}

export const userService = {
  getAll: () => api.get('/users/'),
  getById: (id) => api.get(`/users/${id}/`),
  create: (userData) => api.post('/users/', userData),
  update: (id, userData) => api.put(`/users/${id}/`, userData),
  delete: (id) => api.delete(`/users/${id}/`),
}

export const historyService = {
  getAll: (params) => api.get('/history/', { params }),
  getByClassroom: (classroomId, params) => api.get(`/history/classroom/${classroomId}/`, { params }),
  getBySensor: (sensorId, params) => api.get(`/history/sensor/${sensorId}/`, { params }),
}

export default api
