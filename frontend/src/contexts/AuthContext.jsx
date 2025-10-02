import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Función de logout
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await axios.post('http://127.0.0.1:64354/api/users/logout/', {
          refresh_token: refreshToken
        });
      }
    } catch (error) {
      console.error('Error durante logout:', error);
    } finally {
      // Limpiar datos locales
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');

      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Función de login
  const login = async (legajo, password) => {
    try {
      console.log('🔐 Iniciando login directo en AuthContext con:', { legajo });
      const response = await axios.post('http://localhost:8000/test-endpoint/', {
        legajo,
        password
      });
      console.log('✅ Login directo response recibido:', response.data);

      const { user, tokens } = response.data;

      // Guardar tokens y datos del usuario
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);
      setIsAuthenticated(true);

      console.log('✅ Usuario autenticado exitosamente:', user.legajo);
      return { success: true };
    } catch (error) {
      console.error('❌ Error durante login directo:', error);
      console.error('❌ Error response:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error || 'Error durante el login'
      };
    }
  };

  // Verificar autenticación al cargar
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }

    setLoading(false);
  }, []);

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    loading,
    isAdmin: user?.rol === 'Admin',
    isOperator: user?.rol === 'Operario'
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
