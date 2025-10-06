import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  // Función de logout
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error durante logout:', error);
    } finally {
      // Limpiar datos locales (solo en navegador)
      if (typeof window !== 'undefined' && localStorage) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }

      setUser(null);
      setIsAuthenticated(false);
      setConnectionError(null);
    }
  };

  // Función de login
  const login = async (legajo, password) => {
    try {
      console.log('🔐 Iniciando login con:', { legajo });
      const response = await authService.login({
        legajo,
        password
      });

      console.log('✅ Login response recibido:', response.data);

      const { usuario: userData, token } = response.data.data;

      // Guardar token y datos del usuario (solo en navegador)
      if (typeof window !== 'undefined' && localStorage) {
        localStorage.setItem('access_token', token);
        localStorage.setItem('user', JSON.stringify(userData));
      }

      setUser(userData);
      setIsAuthenticated(true);
      setConnectionError(null);

      console.log('✅ Usuario autenticado exitosamente:', userData.legajo);
      return { success: true };
    } catch (error) {
      console.error('❌ Error durante login:', error);
      console.error('❌ Error completo:', {
        message: error.message,
        code: error.code,
        response: error.response,
        responseData: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });

      // Verificar si es un error de conexión
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error') || !error.response) {
        setConnectionError('No se pudo establecer conexión con el servidor. Algunas funciones pueden no estar disponibles hasta que se restablezca la conexión.');
      }

      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Error durante el login'
      };
    }
  };

  // Verificar autenticación al cargar
  useEffect(() => {
    // Solo ejecutar en el navegador
    if (typeof window !== 'undefined' && localStorage) {
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing user data:', error);
          // Limpiar datos corruptos
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
        }
      }
    }

    setLoading(false);
  }, []);

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    loading,
    connectionError,
    isAdmin: user?.rol === 'administrador',
    isOperator: user?.rol === 'operario'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
