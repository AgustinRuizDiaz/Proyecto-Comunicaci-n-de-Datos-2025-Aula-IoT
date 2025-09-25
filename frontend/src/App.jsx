import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'

// Components
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import Classrooms from './pages/Classrooms'
import ClassroomDetail from './pages/ClassroomDetail'
import Sensors from './pages/Sensors'
import SensorDetail from './pages/SensorDetail'
import History from './pages/History'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

// Hooks
import { useAuth } from './hooks/useAuth'

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="App">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="classrooms" element={<Classrooms />} />
          <Route path="classrooms/:id" element={<ClassroomDetail />} />
          <Route path="sensors" element={<Sensors />} />
          <Route path="sensors/:id" element={<SensorDetail />} />
          <Route path="history" element={<History />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
