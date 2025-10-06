import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RoleBasedAccess, { AdminOnly, OperatorOnly } from './RoleBasedAccess';

/**
 * Componente de navegación inferior para dispositivos móviles
 * Se muestra automáticamente en pantallas menores a 768px
 * Diseño simplificado: aulas, historial y menú hamburguesa desplegable
 * El menú incluye opciones de usuarios (admin) y cerrar sesión
 */
const BottomNavigation = () => {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Detectar si estamos en móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsVisible(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Si no es móvil o el usuario no está autenticado, no mostrar
  if (!isVisible || !user) {
    return null;
  }

  // Configuración de navegación según el rol del usuario
  const getNavigationItems = () => {
    const baseItems = [
      {
        id: 'classrooms',
        label: 'Aulas',
        path: '/classrooms',
        icon: 'home',
        emoji: '🏫'
      },
      {
        id: 'history',
        label: 'Historial',
        path: '/history',
        icon: 'history',
        emoji: '📊'
      },
      {
        id: 'menu',
        label: 'Menú',
        path: '#',
        icon: 'menu',
        emoji: '☰',
        isMenu: true
      }
    ];

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-blue-600 border-t border-blue-700 shadow-lg z-50 md:hidden">
        <div className="flex items-center justify-around py-2 px-1">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;

            // Si es el botón de menú, renderizar como botón que abre el menú desplegable
            if (item.isMenu) {
              return (
                <button
                  key={item.id}
                  onClick={toggleMenu}
                  className={`
                    flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-h-[44px] min-w-[44px]
                    ${isActive
                      ? 'bg-blue-700 text-white shadow-md'
                      : 'text-white hover:bg-blue-700 active:bg-blue-800'
                    }
                  `}
                >
                  <span className="text-lg mb-1">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                    </svg>
                  </span>
                  <span className="text-xs font-medium text-center leading-tight text-blue-100">
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`
                  flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-h-[44px] min-w-[44px]
                  ${isActive
                    ? 'bg-blue-700 text-white shadow-md'
                    : 'text-white hover:bg-blue-700 active:bg-blue-800'
                  }
                `}
              >
                <span className="text-lg mb-1">
                  {item.id === 'classrooms' && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.84L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                    </svg>
                  )}
                  {item.id === 'history' && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                    </svg>
                  )}
                </span>
                <span className={`
                  text-xs font-medium text-center leading-tight
                  ${isActive ? 'text-white' : 'text-blue-100'}
                `}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Menú desplegable */}
      {isMenuOpen && (
        <>
          {/* Overlay para cerrar el menú al hacer clic fuera */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeMenu}
          />

          {/* Menú desplegable desde abajo */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-[60] md:hidden">
            <div className="py-4 px-2">
              {/* Opción de usuarios (solo para admins) */}
              {isAdmin && (
                <Link
                  to="/admin/users"
                  className="flex items-center px-6 py-4 text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={closeMenu}
                >
                  <svg className="w-5 h-5 mr-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                  </svg>
                  Gestión de Usuarios
                </Link>
              )}

              {/* Separador */}
              <div className="border-t border-gray-200 my-2"></div>

              {/* Opción de cerrar sesión */}
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-6 py-4 text-red-600 hover:bg-red-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
                </svg>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default BottomNavigation;
