import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RoleBasedAccess, { AdminOnly, OperatorOnly } from './RoleBasedAccess';

/**
 * Componente de navegación inferior para dispositivos móviles
 * Se muestra automáticamente en pantallas menores a 640px
 */
const BottomNavigation = () => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  // Detectar si estamos en móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsVisible(window.innerWidth < 640);
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
        id: 'dashboard',
        label: 'Inicio',
        path: user?.rol === 'Admin' ? '/admin/dashboard' : '/operator/dashboard',
        icon: '🏠',
        emoji: '🏠'
      },
      {
        id: 'classrooms',
        label: 'Aulas',
        path: '/classrooms',
        icon: '🏫',
        emoji: '🏫'
      },
      {
        id: 'sensors',
        label: 'Sensores',
        path: '/sensors',
        icon: '📡',
        emoji: '📡'
      },
      {
        id: 'history',
        label: 'Historial',
        path: '/history',
        icon: '📊',
        emoji: '📊'
      }
    ];

    // Agregar navegación específica para admin
    if (isAdmin) {
      baseItems.push({
        id: 'admin',
        label: 'Gestión',
        path: '/admin/users',
        icon: '👑',
        emoji: '👑'
      });
    } else {
      // Para operadores, agregar navegación específica
      baseItems.push({
        id: 'operator',
        label: 'Mis Sensores',
        path: '/operator/sensors',
        icon: '🔧',
        emoji: '🔧'
      });
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 md:hidden">
      <div className="flex items-center justify-around py-2 px-1">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`
                flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-h-[44px] min-w-[44px]
                ${isActive
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
                }
              `}
            >
              <span className="text-lg mb-1">{item.emoji}</span>
              <span className={`
                text-xs font-medium text-center leading-tight
                ${isActive ? 'text-white' : 'text-gray-500'}
              `}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Indicador de conexión */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className={`
          w-3 h-3 rounded-full border-2 border-white
          ${navigator.onLine ? 'bg-green-500' : 'bg-red-500'}
        `} />
      </div>
    </nav>
  );
};

export default BottomNavigation;
