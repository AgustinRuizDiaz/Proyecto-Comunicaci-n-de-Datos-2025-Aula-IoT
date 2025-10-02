import React from 'react';
import ConnectionIndicator from '../components/ConnectionIndicator';
import { NotificationContainer } from '../components/SensorNotification';
import useRealtimeNotifications from '../hooks/useRealtimeNotifications';

const RealtimeStatusBar = ({ aulaId, className = '' }) => {
  const {
    isConnected,
    connectionError,
    lastHeartbeat,
    offlineQueue,
    notifications,
    removeNotification,
    notificationCount,
    pendingCommandsCount
  } = useRealtimeNotifications(aulaId);

  return (
    <>
      {/* Barra de estado fija */}
      <div className={`fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 ${className}`}>
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ConnectionIndicator
              isConnected={isConnected}
              connectionError={connectionError}
              lastHeartbeat={lastHeartbeat}
              offlineQueue={offlineQueue}
            />

            {pendingCommandsCount > 0 && (
              <div className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {pendingCommandsCount} comandos pendientes
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {notificationCount > 0 && (
              <div className="text-sm text-gray-600">
                {notificationCount} notificaciones
              </div>
            )}

            {lastHeartbeat && (
              <div className="text-xs text-gray-500">
                Último: {new Date(lastHeartbeat).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenedor de notificaciones */}
      <NotificationContainer
        notifications={notifications}
        onRemoveNotification={removeNotification}
      />

      {/* Espaciador para evitar que el contenido quede debajo de la barra fija */}
      <div className="h-16" />
    </>
  );
};

export default RealtimeStatusBar;
