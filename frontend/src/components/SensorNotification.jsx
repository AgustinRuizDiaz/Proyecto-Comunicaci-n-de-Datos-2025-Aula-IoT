import React, { useState, useEffect } from 'react';
import { XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const SensorNotification = ({ sensorUpdate, onClose, autoClose = true, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(duration / 1000);

  useEffect(() => {
    if (!autoClose) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsVisible(false);
          onClose?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoClose, onClose]);

  if (!isVisible) return null;

  // Configuración según el tipo de actualización
  const getNotificationConfig = () => {
    const { action, sensor_id, estado_anterior, estado_nuevo, tipo } = sensorUpdate;

    if (action === 'update') {
      return {
        title: `Sensor ${tipo} actualizado`,
        message: `Estado cambiado de "${estado_anterior}" a "${estado_nuevo}"`,
        type: 'info',
        icon: InformationCircleIcon,
        color: 'blue'
      };
    }

    return {
      title: `Comando ejecutado`,
      message: `Sensor ${tipo} - Acción: ${action}`,
      type: 'success',
      icon: InformationCircleIcon,
      color: 'green'
    };
  };

  const config = getNotificationConfig();
  const Icon = config.icon;

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-500',
      text: 'text-blue-900',
      button: 'hover:bg-blue-100'
    },
    green: {
      bg: 'bg-green-50 border-green-200',
      icon: 'text-green-500',
      text: 'text-green-900',
      button: 'hover:bg-green-100'
    }
  };

  const colors = colorClasses[config.color];

  return (
    <div className={`max-w-sm w-full ${colors.bg} border rounded-lg shadow-lg p-4 mb-4`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={`w-5 h-5 ${colors.icon}`} />
        </div>

        <div className="ml-3 w-0 flex-1">
          <div className="flex items-center justify-between">
            <p className={`text-sm font-medium ${colors.text}`}>
              {config.title}
            </p>

            <div className="ml-4 flex-shrink-0 flex">
              {autoClose && (
                <div className="text-xs text-gray-500 mr-2">
                  {timeLeft}s
                </div>
              )}

              <button
                onClick={() => {
                  setIsVisible(false);
                  onClose?.();
                }}
                className={`inline-flex rounded-md p-1 ${colors.text} ${colors.button} transition-colors duration-200`}
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-1">
            <p className={`text-sm ${colors.text.replace('900', '700')}`}>
              {config.message}
            </p>
          </div>

          <div className="mt-2">
            <p className="text-xs text-gray-500">
              {new Date(sensorUpdate.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Barra de progreso para auto-close */}
      {autoClose && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className={`h-1 rounded-full transition-all duration-1000 ${
                config.color === 'blue' ? 'bg-blue-500' : 'bg-green-500'
              }`}
              style={{ width: `${(timeLeft / (duration / 1000)) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Componente contenedor para múltiples notificaciones
export const NotificationContainer = ({ notifications = [], onRemoveNotification }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification, index) => (
        <SensorNotification
          key={`${notification.sensor_id}-${notification.timestamp}-${index}`}
          sensorUpdate={notification}
          onClose={() => onRemoveNotification(index)}
        />
      ))}
    </div>
  );
};

export default SensorNotification;
