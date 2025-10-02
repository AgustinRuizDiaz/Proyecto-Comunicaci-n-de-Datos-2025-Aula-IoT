import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SocketProvider } from './contexts/SocketContext'
import { ToastProvider } from './components/Toast'
import Navbar from './components/Navbar'
import BottomNavigation from './components/BottomNavigation'
import Classrooms from './pages/Classrooms'
import Sensors from './pages/Sensors'
import History from './pages/History'
import Users from './pages/Users'
import Login from './pages/Login'
import Unauthorized from './pages/Unauthorized'
import ProtectedRoute, { AdminRoute, OperatorRoute, AuthenticatedRoute } from './components/ProtectedRoute'

// Component to handle conditional rendering of navbar and bottom nav
const AppContent = () => {
  const location = useLocation()

  // Hide navbar and bottom navigation on login and unauthorized pages
  const hideNavigation = location.pathname === '/login' || location.pathname === '/unauthorized'

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideNavigation && <Navbar />}
      <main className={`container mx-auto px-4 py-8 pb-20 md:pb-8 ${hideNavigation ? 'pt-0' : ''}`}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Main application routes - redirect root to classrooms */}
          <Route path="/" element={
            <AuthenticatedRoute>
              <Classrooms />
            </AuthenticatedRoute>
          } />

          {/* Role-based feature routes */}
          <Route path="/classrooms" element={
            <AuthenticatedRoute>
              <Classrooms />
            </AuthenticatedRoute>
          } />
          <Route path="/sensors" element={
            <AuthenticatedRoute>
              <Sensors />
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

          {/* Operator-only sensor management */}
          <Route path="/operator/sensors" element={
            <OperatorRoute>
              <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Mis Sensores</h1>
                <p className="text-gray-600">Aquí irá la gestión de sensores asignados (solo para operarios).</p>
              </div>
            </OperatorRoute>
          } />
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
