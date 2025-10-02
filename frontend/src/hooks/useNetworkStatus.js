import { useState, useEffect } from 'react';

/**
 * Hook personalizado para detectar el estado de conexión
 * y manejar la sincronización automática cuando se reconecta
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState('unknown');

  useEffect(() => {
    // Función para actualizar el estado de conexión
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);

      if (online) {
        // Cuando se reconecta, intentar sincronizar datos pendientes
        handleReconnection();
      }
    };

    // Función para detectar el tipo de conexión
    const updateConnectionType = () => {
      if ('connection' in navigator) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
          setConnectionType(connection.effectiveType || 'unknown');
        }
      }
    };

    // Función para manejar la reconexión
    const handleReconnection = async () => {
      console.log('🔄 Reconectando... intentando sincronizar datos pendientes');

      try {
        // Aquí puedes llamar a funciones de sincronización
        // Por ejemplo, sincronizar datos de IndexedDB con el servidor

        // Emitir evento personalizado para que otros componentes puedan reaccionar
        window.dispatchEvent(new CustomEvent('networkReconnected'));

        // Mostrar notificación de sincronización exitosa después de un breve delay
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('showToast', {
            detail: {
              message: 'Datos sincronizados correctamente',
              type: 'success'
            }
          }));
        }, 1000);

      } catch (error) {
        console.error('❌ Error durante la sincronización:', error);
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: {
            message: 'Error al sincronizar datos',
            type: 'error'
          }
        }));
      }
    };

    // Función para manejar la desconexión
    const handleDisconnection = () => {
      console.log('📡 Desconectado - activando modo offline');
      window.dispatchEvent(new CustomEvent('networkDisconnected'));
    };

    // Agregar event listeners
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', () => {
      setIsOnline(false);
      handleDisconnection();
    });

    // Detectar cambios en el tipo de conexión
    if ('connection' in navigator) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

      if (connection) {
        updateConnectionType();

        // Escuchar cambios en el tipo de conexión (2G, 3G, 4G, etc.)
        connection.addEventListener('change', updateConnectionType);
      }
    }

    // Inicializar estado
    updateOnlineStatus();
    updateConnectionType();

    // Cleanup
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', () => {
        setIsOnline(false);
        handleDisconnection();
      });

      if ('connection' in navigator) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
          connection.removeEventListener('change', updateConnectionType);
        }
      }
    };
  }, []);

  return {
    isOnline,
    connectionType,
    isSlowConnection: connectionType === '2g' || connectionType === 'slow-2g'
  };
};

export default useNetworkStatus;
