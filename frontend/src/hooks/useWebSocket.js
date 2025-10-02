import { useState, useEffect, useCallback, useRef } from 'react';

const useWebSocket = (aulaId, enabled = true) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sensorUpdates, setSensorUpdates] = useState({});
  const [connectionError, setConnectionError] = useState(null);
  const [lastHeartbeat, setLastHeartbeat] = useState(null);
  const [offlineQueue, setOfflineQueue] = useState([]);

  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const heartbeatIntervalRef = useRef(null);

  // Función para conectar al WebSocket
  const connect = useCallback(() => {
    if (!enabled || !aulaId) return;

    try {
      // Crear conexión WebSocket nativa con Django Channels
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/aula/${aulaId}/`;

      const socketInstance = new WebSocket(wsUrl);

      socketInstance.onopen = () => {
        console.log('✅ WebSocket conectado para aula:', aulaId);
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;

        // Iniciar envío de heartbeat cada 30 segundos
        startHeartbeat(socketInstance);
      };

      socketInstance.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleMessage(data, socketInstance);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      socketInstance.onclose = (event) => {
        console.log('❌ WebSocket desconectado:', event.code, event.reason);
        setIsConnected(false);
        stopHeartbeat();

        // Solo intentar reconectar si fue desconexión inesperada
        if (event.code !== 1000) { // 1000 es cierre normal
          scheduleReconnect();
        }
      };

      socketInstance.onerror = (error) => {
        console.error('❌ Error de conexión WebSocket:', error);
        setConnectionError('Error de conexión WebSocket');
        setIsConnected(false);
        scheduleReconnect();
      };

      setSocket(socketInstance);

    } catch (error) {
      console.error('Error creando conexión WebSocket:', error);
      setConnectionError(error.message);
      scheduleReconnect();
    }
  }, [aulaId, enabled]);

  // Función para manejar mensajes recibidos
  const handleMessage = useCallback((data, socketInstance) => {
    switch (data.type) {
      case 'sensor_update':
        console.log('📡 Actualización de sensor recibida:', data);
        setSensorUpdates(prev => ({
          ...prev,
          [data.sensor_id]: {
            ...data,
            timestamp: new Date().toISOString(),
          },
        }));
        handleOptimisticUpdate(data);
        break;

      case 'aula_heartbeat':
        console.log('💓 Heartbeat del aula recibido:', data);
        setLastHeartbeat(new Date().toISOString());
        handleAulaStatusUpdate(data);
        break;

      case 'aula_status_change':
        console.log('🔄 Cambio de estado del aula:', data);
        handleAulaStatusUpdate(data);
        break;

      case 'luz_toggle':
        console.log('💡 Cambio de luces:', data);
        handleOptimisticUpdate(data);
        break;

      case 'connection_established':
        console.log('🔗 Conexión establecida:', data);
        setLastHeartbeat(new Date().toISOString());
        break;

      case 'heartbeat_response':
        setLastHeartbeat(new Date().toISOString());
        break;

      case 'command_executed':
        console.log('✅ Comando ejecutado:', data);
        break;

      case 'error':
        console.error('❌ Error del servidor:', data.message);
        break;

      default:
        console.log('📨 Mensaje recibido:', data);
    }
  }, [handleOptimisticUpdate, handleAulaStatusUpdate]);

  // Función para iniciar heartbeat
  const startHeartbeat = useCallback((socketInstance) => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (socketInstance && socketInstance.readyState === WebSocket.OPEN) {
        socketInstance.send(JSON.stringify({
          type: 'heartbeat',
          aula_id: aulaId,
          timestamp: new Date().toISOString()
        }));
      }
    }, 30000); // Cada 30 segundos
  }, [aulaId]);

  // Función para detener heartbeat
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // Función para reconectar con backoff exponencial
  const scheduleReconnect = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      setConnectionError('Máximo número de intentos de reconexión alcanzado');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
    reconnectAttempts.current++;

    console.log(`🔄 Intentando reconectar en ${delay}ms (intento ${reconnectAttempts.current})`);

    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  }, [connect]);

  // Función para desconectar
  const disconnect = useCallback(() => {
    if (socket) {
      socket.close(1000, 'Cliente desconectado'); // 1000 es cierre normal
      setSocket(null);
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    stopHeartbeat();

    setIsConnected(false);
    setSensorUpdates({});
    setConnectionError(null);
    setOfflineQueue([]);
    setLastHeartbeat(null);
    reconnectAttempts.current = 0;
  }, [socket, stopHeartbeat]);

  // Función para enviar comando
  const sendCommand = useCallback((sensorId, action, value = null) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const command = {
        type: 'sensor_command',
        sensor_id: sensorId,
        action,
        value,
        timestamp: new Date().toISOString(),
      };

      // Si está offline, agregar a cola
      if (socket.readyState !== WebSocket.OPEN) {
        setOfflineQueue(prev => [...prev, command]);
        return;
      }

      socket.send(JSON.stringify(command));
      console.log('📤 Comando enviado:', command);
    } else {
      console.warn('No se puede enviar comando: WebSocket no conectado');
      // Agregar a cola offline
      setOfflineQueue(prev => [...prev, {
        type: 'sensor_command',
        sensor_id: sensorId,
        action,
        value,
        timestamp: new Date().toISOString()
      }]);
    }
  }, [socket]);

  // Función para suscribirse a un aula específica
  const subscribeToAula = useCallback((targetAulaId) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'subscribe_aula',
        aula_id: targetAulaId,
        timestamp: new Date().toISOString()
      }));
    }
  }, [socket]);

  // Función para desuscribirse
  const unsubscribeFromAula = useCallback((targetAulaId) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'unsubscribe_aula',
        aula_id: targetAulaId,
        timestamp: new Date().toISOString()
      }));
    }
  }, [socket]);

  // Función para manejar actualizaciones optimistas del UI
  const handleOptimisticUpdate = useCallback((data) => {
    // Esta función puede ser extendida por componentes específicos
    // para manejar actualizaciones optimistas del estado local
  }, []);

  // Función para manejar cambios de estado del aula
  const handleAulaStatusUpdate = useCallback((data) => {
    // Esta función puede ser extendida para actualizar estados globales
    // como indicadores de conexión de aulas
  }, []);

  // Sincronizar cola offline cuando se reconecta
  const syncOfflineQueue = useCallback(() => {
    if (offlineQueue.length > 0 && socket && socket.readyState === WebSocket.OPEN) {
      console.log('🔄 Sincronizando cola offline:', offlineQueue.length, 'comandos');

      offlineQueue.forEach(command => {
        socket.send(JSON.stringify(command));
      });

      setOfflineQueue([]);
    }
  }, [offlineQueue, socket]);

  // Conectar cuando se monte el componente o cambie el aulaId
  useEffect(() => {
    if (enabled && aulaId) {
      connect();
    }

    // Cleanup al desmontar
    return () => {
      disconnect();
    };
  }, [aulaId, enabled, connect, disconnect]);

  // Sincronizar cuando se reconecta
  useEffect(() => {
    if (socket && socket.readyState === WebSocket.OPEN && offlineQueue.length > 0) {
      syncOfflineQueue();
    }
  }, [socket, offlineQueue, syncOfflineQueue]);

  // Limpiar actualizaciones antiguas cada 30 segundos
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = new Date().getTime();
      const thirtySecondsAgo = now - 30000;

      setSensorUpdates(prev => {
        const filtered = {};
        Object.keys(prev).forEach(sensorId => {
          const update = prev[sensorId];
          if (new Date(update.timestamp).getTime() > thirtySecondsAgo) {
            filtered[sensorId] = update;
          }
        });
        return filtered;
      });
    }, 30000);

    return () => clearInterval(cleanupInterval);
  }, []);

  return {
    socket,
    isConnected,
    sensorUpdates,
    connectionError,
    lastHeartbeat,
    offlineQueue,
    sendCommand,
    subscribeToAula,
    unsubscribeFromAula,
    // Nuevas funciones para manejo avanzado
    reconnect: connect,
    handleOptimisticUpdate,
    handleAulaStatusUpdate,
    syncOfflineQueue,
  };
};

export default useWebSocket;
