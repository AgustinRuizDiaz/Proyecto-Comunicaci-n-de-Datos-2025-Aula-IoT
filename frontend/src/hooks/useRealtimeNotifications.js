import { useState, useCallback, useEffect } from 'react';
import useWebSocket from './useWebSocket';

const useRealtimeNotifications = (aulaId) => {
  const [notifications, setNotifications] = useState([]);
  const [aulaStatuses, setAulaStatuses] = useState({});

  const {
    isConnected,
    sensorUpdates,
    connectionError,
    lastHeartbeat,
    offlineQueue,
    sendCommand,
    handleOptimisticUpdate,
    handleAulaStatusUpdate
  } = useWebSocket(aulaId);

  // Manejar actualizaciones optimistas
  const handleOptimisticUpdateEnhanced = useCallback((data) => {
    // Agregar notificación inmediata para feedback visual
    const notification = {
      id: `update-${data.sensor_id}-${Date.now()}`,
      sensor_id: data.sensor_id,
      action: data.action,
      estado_anterior: data.estado_anterior,
      estado_nuevo: data.estado_nuevo,
      tipo: data.tipo || 'desconocido',
      timestamp: data.timestamp || new Date().toISOString(),
      source: 'optimistic'
    };

    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Máximo 10 notificaciones

    // Llamar al manejador personalizado si existe
    handleOptimisticUpdate(data);
  }, [handleOptimisticUpdate]);

  // Manejar cambios de estado del aula
  const handleAulaStatusUpdateEnhanced = useCallback((data) => {
    setAulaStatuses(prev => ({
      ...prev,
      [data.aula_id]: {
        estado: data.estado,
        lastHeartbeat: data.timestamp,
        ip_esp32: data.ip_esp32
      }
    }));

    // Si hay un cambio de estado significativo, mostrar notificación
    if (data.estado_anterior && data.estado_anterior !== data.estado_nuevo) {
      const notification = {
        id: `aula-${data.aula_id}-${Date.now()}`,
        aula_id: data.aula_id,
        tipo: 'aula_status',
        estado_anterior: data.estado_anterior,
        estado_nuevo: data.estado_nuevo,
        timestamp: data.timestamp,
        source: 'system'
      };

      setNotifications(prev => [notification, ...prev.slice(0, 9)]);
    }

    handleAulaStatusUpdate(data);
  }, [handleAulaStatusUpdate]);

  // Función para enviar comandos con actualización optimista
  const sendCommandWithOptimisticUpdate = useCallback(async (sensorId, action, value = null) => {
    // Crear actualización optimista inmediata
    const sensorInfo = await getSensorInfo(sensorId);
    if (sensorInfo) {
      const optimisticData = {
        sensor_id: sensorId,
        action,
        estado_anterior: sensorInfo.estado_actual,
        estado_nuevo: calculateNewState(sensorInfo.estado_actual, action, value),
        tipo: sensorInfo.tipo,
        timestamp: new Date().toISOString()
      };

      handleOptimisticUpdateEnhanced(optimisticData);
    }

    // Enviar comando real
    sendCommand(sensorId, action, value);
  }, [sendCommand, handleOptimisticUpdateEnhanced]);

  // Remover notificación
  const removeNotification = useCallback((index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Limpiar notificaciones automáticamente después de 10 segundos
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setNotifications(prev =>
        prev.filter(notification => {
          const notificationTime = new Date(notification.timestamp).getTime();
          return (now - notificationTime) < 10000; // 10 segundos
        })
      );
    }, 5000);

    return () => clearInterval(cleanup);
  }, []);

  return {
    // Estados
    isConnected,
    connectionError,
    lastHeartbeat,
    offlineQueue,
    notifications,
    aulaStatuses,

    // Acciones
    sendCommand: sendCommandWithOptimisticUpdate,
    removeNotification,

    // Funciones internas para componentes específicos
    handleOptimisticUpdate: handleOptimisticUpdateEnhanced,
    handleAulaStatusUpdate: handleAulaStatusUpdateEnhanced,

    // Estadísticas
    notificationCount: notifications.length,
    pendingCommandsCount: offlineQueue.length,
  };
};

// Función auxiliar para obtener información del sensor (debería venir de API)
const getSensorInfo = async (sensorId) => {
  // Esta función debería hacer una llamada a la API para obtener info del sensor
  // Por ahora, retornamos datos mock
  return {
    id: sensorId,
    tipo: 'luz',
    estado_actual: 'false'
  };
};

// Función auxiliar para calcular nuevo estado
const calculateNewState = (currentState, action, value) => {
  if (action === 'toggle') {
    return currentState === 'true' ? 'false' : 'true';
  }
  if (action === 'set') {
    return value ? 'true' : 'false';
  }
  return value || currentState;
};

export default useRealtimeNotifications;
