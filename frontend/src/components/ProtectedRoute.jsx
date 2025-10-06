import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Componente para rutas protegidas por autenticación y roles
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componente hijo a renderizar si tiene permisos
 * @param {Array|string} props.allowedRoles - Roles permitidos para acceder a la ruta
 * @param {boolean} props.requireAll - Si true, usuario debe tener TODOS los roles
 * @param {string} props.redirectTo - Ruta a la que redirigir si no tiene permisos
 * @returns {React.ReactNode} Ruta protegida o redirección
 */
const ProtectedRoute = ({
  children,
  allowedRoles,
  requireAll = false,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login con la ruta actual
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Verificar permisos de roles
  const userRoles = [user.rol];
  const hasAccess = requireAll
    ? allowedRoles.every(role => userRoles.includes(role))
    : allowedRoles.some(role => userRoles.includes(role));

  // Si no tiene permisos para esta ruta, redirigir según el rol del usuario
  if (!hasAccess) {
    // Redirigir a rutas apropiadas según el rol
    if (user.rol === 'administrador') {
      return <Navigate to="/admin/users" replace />;
    } else if (user.rol === 'operario') {
      return <Navigate to="/classrooms" replace />;
    } else {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

/**
 * Ruta protegida solo para administradores
 */
export const AdminRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['administrador']}>
    {children}
  </ProtectedRoute>
);

/**
 * Ruta protegida solo para operarios
 */
export const OperatorRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['operario']}>
    {children}
  </ProtectedRoute>
);

/**
 * Ruta protegida para ambos roles (Admin y Operario)
 */
export const AuthenticatedRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['administrador', 'operario']}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;
