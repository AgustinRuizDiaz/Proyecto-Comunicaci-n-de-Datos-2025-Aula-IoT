import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { SocketProvider } from './contexts/SocketContext'
import { ToastProvider } from './components/Toast'
import Navbar from './components/Navbar'
import BottomNavigation from './components/BottomNavigation'
import Classrooms from './pages/Classrooms'
import History from './pages/History'
import Users from './pages/Users'
import Login from './pages/Login'
import Unauthorized from './pages/Unauthorized'
import ProtectedRoute, { AdminRoute, OperatorRoute, AuthenticatedRoute } from './components/ProtectedRoute'

// Component to handle conditional rendering of navbar and bottom nav
const AppContent = () => {
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(false)
  const { isAuthenticated, loading } = useAuth()

  // Hide navbar and bottom navigation on login and unauthorized pages
  const hideNavigation = location.pathname === '/login' || location.pathname === '/unauthorized'

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Check initially
    checkMobile()

    // Add resize listener
    window.addEventListener('resize', checkMobile)

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Show loading spinner while auth context is loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideNavigation && !isMobile && <Navbar />}
      <main className={`container mx-auto px-4 py-8 pb-20 md:pb-8 ${hideNavigation ? 'pt-0' : ''}`}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Root route - redirect based on authentication status */}
          <Route path="/" element={
            isAuthenticated ? <Navigate to="/classrooms" replace /> : <Navigate to="/login" replace />
          } />

          {/* Main application routes */}
          <Route path="/classrooms" element={
            <AuthenticatedRoute>
              <Classrooms />
            </AuthenticatedRoute>
          } />
          <Route path="/history" element={
            <AuthenticatedRoute>
              <History />
            </AuthenticatedRoute>
          } />

          {/* Admin-only management routes */}
          <Route path="/admin/users" element={
            <AdminRoute>
              <Users />
            </AdminRoute>
          } />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
      {!hideNavigation && <BottomNavigation />}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <ToastProvider>
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <AppContent />
          </Router>
        </ToastProvider>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App
