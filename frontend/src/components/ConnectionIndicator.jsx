import React from 'react';
import { WifiIcon, ExclamationTriangleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

const ConnectionIndicator = ({
  connectionError,
  lastHeartbeat,
  offlineQueue = [],
  className = ''
}) => {
  const { isOnline, connectionType, isSlowConnection } = useNetworkStatus();

  // Determinar el estado de conexión
  const getConnectionStatus = () => {
    if (connectionError) return 'error';
    if (!isOnline) return 'disconnected';
    if (offlineQueue.length > 0) return 'syncing';

    // Verificar si el último heartbeat fue hace más de 60 segundos
    if (lastHeartbeat) {
      const now = new Date();
      const lastHeartbeatTime = new Date(lastHeartbeat);
      const diffSeconds = (now - lastHeartbeatTime) / 1000;

      if (diffSeconds > 60) return 'stale';
    }

    // Verificar si la conexión es lenta
    if (isSlowConnection) return 'slow';

    return 'connected';
  };

  const status = getConnectionStatus();

  // Configuración visual según el estado
  const statusConfig = {
    connected: {
      icon: WifiIcon,
      color: 'text-green-500',
      bgColor: 'bg-green-50 border-green-200',
      text: 'Conectado',
      description: 'Comunicación en tiempo real activa'
    },
    slow: {
      icon: ClockIcon,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 border-yellow-200',
      text: 'Conexión lenta',
      description: `${connectionType || '2G'} - Funciones limitadas`
    },
    stale: {
      icon: ClockIcon,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 border-yellow-200',
      text: 'Conexión lenta',
      description: 'Último heartbeat recibido hace más de 60 segundos'
    },
    syncing: {
      icon: WifiIcon,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 border-blue-200',
      text: 'Sincronizando',
      description: `${offlineQueue.length} comandos pendientes`
    },
    disconnected: {
      icon: WifiIcon,
      color: 'text-gray-400',
      bgColor: 'bg-gray-50 border-gray-200',
      text: 'Desconectado',
      description: 'Sin conexión al servidor'
    },
    error: {
      icon: ExclamationTriangleIcon,
      color: 'text-red-500',
      bgColor: 'bg-red-50 border-red-200',
      text: 'Error de conexión',
      description: connectionError || 'Error desconocido'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${config.bgColor} ${className}`}>
      <div className={`w-2 h-2 rounded-full ${
        status === 'connected' ? 'bg-green-500 animate-pulse' :
        status === 'syncing' ? 'bg-blue-500 animate-pulse' :
        status === 'slow' ? 'bg-yellow-500 animate-pulse' :
        status === 'stale' ? 'bg-yellow-500' :
        status === 'disconnected' ? 'bg-gray-400' :
        'bg-red-500'
      }`} />

      <Icon className={`w-4 h-4 ${config.color}`} />

      <div className="flex flex-col">
        <span className={`text-sm font-medium ${config.color}`}>
          {config.text}
        </span>
        <span className="text-xs text-gray-600">
          {config.description}
        </span>
      </div>
    </div>
  );
};

export default ConnectionIndicator;
