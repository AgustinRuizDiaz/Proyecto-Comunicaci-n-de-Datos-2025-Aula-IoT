import React from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Higher Order Component para renderizado condicional basado en roles
 *
 * @param {React.Component} WrappedComponent - Componente a envolver
 * @param {Array|string} allowedRoles - Roles permitidos para ver el componente
 * @param {boolean} requireAll - Si true, usuario debe tener TODOS los roles. Si false, cualquiera basta.
 * @returns {React.Component} Componente envuelto con lógica de permisos
 */
const withRoleAccess = (WrappedComponent, allowedRoles, requireAll = false) => {
  return function WithRoleAccessComponent(props) {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
      return null; // No renderizar nada si no está autenticado
    }

    const userRoles = [user.rol]; // Usuario tiene un solo rol
    const hasAccess = requireAll
      ? allowedRoles.every(role => userRoles.includes(role))
      : allowedRoles.some(role => userRoles.includes(role));

    if (!hasAccess) {
      return null; // No renderizar si no tiene permisos
    }

    return <WrappedComponent {...props} />;
  };
};

/**
 * Hook personalizado para verificar permisos de roles
 *
 * @param {Array|string} allowedRoles - Roles permitidos
 * @param {boolean} requireAll - Si true, usuario debe tener TODOS los roles
 * @returns {boolean} true si tiene permisos, false si no
 */
export const useRoleAccess = (allowedRoles, requireAll = false) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return false;
  }

  const userRoles = [user.rol];
  return requireAll
    ? allowedRoles.every(role => userRoles.includes(role))
    : allowedRoles.some(role => userRoles.includes(role));
};

export default withRoleAccess;
