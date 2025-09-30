import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SocketProvider } from './contexts/SocketContext'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import OperatorDashboard from './pages/OperatorDashboard'
import Classrooms from './pages/Classrooms'
import Sensors from './pages/Sensors'
import History from './pages/History'
import Login from './pages/Login'
import Register from './pages/Register'
import Unauthorized from './pages/Unauthorized'
import ProtectedRoute, { AdminRoute, OperatorRoute, AuthenticatedRoute } from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Role-based dashboard routes */}
                <Route path="/" element={
                  <AuthenticatedRoute>
                    <Dashboard />
                  </AuthenticatedRoute>
                } />
                <Route path="/dashboard" element={
                  <AuthenticatedRoute>
                    <Dashboard />
                  </AuthenticatedRoute>
                } />
                <Route path="/admin/dashboard" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                <Route path="/operator/dashboard" element={
                  <OperatorRoute>
                    <OperatorDashboard />
                  </OperatorRoute>
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
                    <div className="p-8">
                      <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestión de Usuarios</h1>
                      <p className="text-gray-600">Aquí irá la gestión completa de usuarios (solo para administradores).</p>
                    </div>
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
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App
