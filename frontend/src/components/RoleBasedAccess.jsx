import React from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Componente para mostrar/ocultar elementos basado en roles
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

  const userRoles = [user.rol];
  const hasAccess = requireAll
    ? allowedRoles.every(role => userRoles.includes(role))
    : allowedRoles.some(role => userRoles.includes(role));

  return hasAccess ? children : fallback;
};

/**
 * Componente específico para mostrar contenido solo a administradores
 */
export const AdminOnly = ({ children, fallback = null }) => (
  <RoleBasedAccess allowedRoles={['administrador']} fallback={fallback}>
    {children}
  </RoleBasedAccess>
);

/**
 * Componente específico para mostrar contenido solo a operarios
 */
export const OperatorOnly = ({ children, fallback = null }) => (
  <RoleBasedAccess allowedRoles={['operario']} fallback={fallback}>
    {children}
  </RoleBasedAccess>
);

/**
 * Componente para mostrar contenido a ambos roles
 */
export const AdminOrOperator = ({ children, fallback = null }) => (
  <RoleBasedAccess allowedRoles={['administrador', 'operario']} fallback={fallback}>
    {children}
  </RoleBasedAccess>
);

export default RoleBasedAccess;
