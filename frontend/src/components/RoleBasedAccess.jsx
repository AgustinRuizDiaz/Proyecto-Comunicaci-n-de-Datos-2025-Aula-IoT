import React from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Componente para mostrar/ocultar elementos basado en roles
 *
 * @param {Object} props
 * @param {Array|string} props.allowedRoles - Roles permitidos para ver el contenido
 * @param {boolean} props.requireAll - Si true, usuario debe tener TODOS los roles. Si false, cualquiera basta.
 * @param {React.ReactNode} props.children - Contenido a mostrar si tiene permisos
 * @param {React.ReactNode} props.fallback - Contenido alternativo si no tiene permisos
 * @returns {React.ReactNode} Contenido basado en permisos
 */
const RoleBasedAccess = ({
  allowedRoles,
  requireAll = false,
  children,
  fallback = null
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return fallback;
  }

  const userRoles = [user.rol]; // Usuario tiene un solo rol
  const hasAccess = requireAll
    ? allowedRoles.every(role => userRoles.includes(role))
    : allowedRoles.some(role => userRoles.includes(role));

  return hasAccess ? children : fallback;
};

/**
 * Componente específico para mostrar contenido solo a administradores
 */
export const AdminOnly = ({ children, fallback = null }) => (
  <RoleBasedAccess allowedRoles={['Admin']} fallback={fallback}>
    {children}
  </RoleBasedAccess>
);

/**
 * Componente específico para mostrar contenido solo a operarios
 */
export const OperatorOnly = ({ children, fallback = null }) => (
  <RoleBasedAccess allowedRoles={['Operario']} fallback={fallback}>
    {children}
  </RoleBasedAccess>
);

/**
 * Componente para mostrar contenido a ambos roles (Admin y Operario)
 */
export const AdminOrOperator = ({ children, fallback = null }) => (
  <RoleBasedAccess allowedRoles={['Admin', 'Operario']} fallback={fallback}>
    {children}
  </RoleBasedAccess>
);

export default RoleBasedAccess;
