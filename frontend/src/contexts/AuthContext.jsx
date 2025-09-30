import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Crear el contexto
const AuthContext = createContext();

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Función de logout (definida antes del useEffect para evitar problemas de hoisting)
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await axios.post('http://localhost:8000/api/users/logout/', {
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
      const response = await axios.post('http://localhost:8000/api/users/login/', {
        legajo,
        password
      });

      const { user, tokens } = response.data;

      // Guardar tokens y datos del usuario
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error durante el login'
      };
    }
  };

  // Configurar axios con interceptor para tokens
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        // No agregar token de autorización para endpoints de autenticación
        if (config.url && (config.url.includes('/login/') || config.url.includes('/token/refresh/'))) {
          return config;
        }

        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Configurar interceptor de respuesta para manejar errores de token
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expirado, intentar refresh
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              const response = await axios.post('http://localhost:8000/api/users/token/refresh/', {
                refresh: refreshToken
              });
              localStorage.setItem('access_token', response.data.access);
              // Reintentar la request original
              error.config.headers.Authorization = `Bearer ${response.data.access}`;
              return axios(error.config);
            } catch (refreshError) {
              // Refresh falló, hacer logout
              logout();
            }
          } else {
            // No hay refresh token, hacer logout
            logout();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

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

  // Auto-logout por inactividad (30 minutos)
  useEffect(() => {
    let timeoutId;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logout();
      }, 30 * 60 * 1000); // 30 minutos
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [isAuthenticated]);

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
