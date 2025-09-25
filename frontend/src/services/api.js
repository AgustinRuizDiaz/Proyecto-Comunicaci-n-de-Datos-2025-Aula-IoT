import axios from 'axios'
import { toast } from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
    }

    const message = error.response?.data?.message || error.message || 'Ha ocurrido un error'
    toast.error(message)

    return Promise.reject(error)
  }
)

export default api

// Auth services
export const authService = {
  login: (credentials) => api.post('/users/login/', credentials),
  register: (userData) => api.post('/users/register/', userData),
  refreshToken: (refreshToken) => api.post('/users/refresh/', { refresh: refreshToken }),
  getProfile: () => api.get('/users/profile/'),
  updateProfile: (profileData) => api.patch('/users/profile/', profileData),
}

// Classroom services
export const classroomService = {
  getAll: (params) => api.get('/classrooms/', { params }),
  getById: (id) => api.get(`/classrooms/${id}/`),
  create: (classroomData) => api.post('/classrooms/', classroomData),
  update: (id, classroomData) => api.patch(`/classrooms/${id}/`, classroomData),
  delete: (id) => api.delete(`/classrooms/${id}/`),
  getSensors: (id) => api.get(`/classrooms/${id}/sensors/`),
  getStatus: (id) => api.get(`/classrooms/${id}/status/`),
}

// Sensor services
export const sensorService = {
  getAll: (params) => api.get('/sensors/', { params }),
  getById: (id) => api.get(`/sensors/${id}/`),
  create: (sensorData) => api.post('/sensors/', sensorData),
  update: (id, sensorData) => api.patch(`/sensors/${id}/`, sensorData),
  delete: (id) => api.delete(`/sensors/${id}/`),
  getData: (id, params) => api.get(`/sensors/${id}/data/`, { params }),
  getHistory: (id, params) => api.get(`/sensors/${id}/history/`, { params }),
  register: (sensorData) => api.post('/sensors/register/', sensorData),
}

// History services
export const historyService = {
  getAll: (params) => api.get('/history/', { params }),
  getById: (id) => api.get(`/history/${id}/`),
  getBySensor: (sensorId, params) => api.get(`/history/sensor/${sensorId}/`, { params }),
  getByClassroom: (classroomId, params) => api.get(`/history/classroom/${classroomId}/`, { params }),
  export: (params) => api.get('/history/export/', { params, responseType: 'blob' }),
}
