import React, { useState, useCallback, useMemo } from 'react';
import { useDebounce } from '../utils/performance';
import useRealtimeNotifications from '../hooks/useRealtimeNotifications';

const SensorCard = ({ sensor, aulaId, onUpdate }) => {
  const [isToggling, setIsToggling] = useState(false);
  const [localState, setLocalState] = useState(sensor.estado_actual);

  const { sendCommand, isConnected } = useRealtimeNotifications(aulaId);

  // Debounce para evitar múltiples cambios rápidos
  const debouncedLocalState = useDebounce(localState, 100);

  // Actualizar estado local cuando cambie el estado del sensor
  React.useEffect(() => {
    setLocalState(sensor.estado_actual);
  }, [sensor.estado_actual]);

  // Manejar toggle de sensor con actualización optimista
  const handleToggle = useCallback(async () => {
    if (!isConnected) return;

    const newState = localState === 'true' ? 'false' : 'true';
    const action = 'toggle';

    // Actualización optimista inmediata
    setLocalState(newState);
    setIsToggling(true);

    try {
      await sendCommand(sensor.id, action);
      // El estado real se actualizará vía WebSocket
    } catch (error) {
      // Revertir en caso de error
      setLocalState(sensor.estado_actual);
      console.error('Error toggling sensor:', error);
    } finally {
      setIsToggling(false);
    }
  }, [sensor.id, sensor.estado_actual, localState, sendCommand, isConnected]);

  // Configuración visual según tipo de sensor
  const sensorConfig = useMemo(() => {
    const configs = {
      'luz': {
        icon: '💡',
        label: 'Luz',
        color: localState === 'true' ? 'bg-yellow-100 border-yellow-300' : 'bg-gray-100 border-gray-300',
        activeColor: 'text-yellow-600',
        inactiveColor: 'text-gray-500'
      },
      'movimiento': {
        icon: '👤',
        label: 'Movimiento',
        color: localState === 'true' ? 'bg-green-100 border-green-300' : 'bg-gray-100 border-gray-300',
        activeColor: 'text-green-600',
        inactiveColor: 'text-gray-500'
      },
      'ventana': {
        icon: '🪟',
        label: 'Ventana',
        color: localState === 'abierta' ? 'bg-blue-100 border-blue-300' : 'bg-gray-100 border-gray-300',
        activeColor: 'text-blue-600',
        inactiveColor: 'text-gray-500'
      },
      'rele': {
        icon: '🔌',
        label: 'Relé',
        color: localState === 'true' ? 'bg-purple-100 border-purple-300' : 'bg-gray-100 border-gray-300',
        activeColor: 'text-purple-600',
        inactiveColor: 'text-gray-500'
      }
    };
    return configs[sensor.tipo] || configs['luz'];
  }, [sensor.tipo, localState]);

  const isActive = localState === 'true' || localState === 'abierta';
  const displayState = isActive ? 'Activo' : 'Inactivo';

  return (
    <div className={`p-4 rounded-lg border-2 transition-all duration-200 ${sensorConfig.color} ${isToggling ? 'opacity-75' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{sensorConfig.icon}</span>
          <h3 className="font-semibold text-gray-900">{sensorConfig.label}</h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Indicador de estado */}
          <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />

          {/* Estado de conexión */}
          <div className={`text-xs px-2 py-1 rounded ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isConnected ? 'Online' : 'Offline'}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Estado:</span>
          <span className={`font-medium ${isActive ? sensorConfig.activeColor : sensorConfig.inactiveColor}`}>
            {displayState}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Pin ESP32:</span>
          <span className="font-mono text-sm bg-gray-50 px-2 py-1 rounded">
            {sensor.pin_esp32}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Última actualización:</span>
          <span className="text-xs text-gray-500">
            {new Date(sensor.ultima_actualizacion).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Botón de toggle */}
      <div className="mt-4">
        <button
          onClick={handleToggle}
          disabled={!isConnected || isToggling}
          className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            isActive
              ? 'bg-red-600 hover:bg-red-700 text-white disabled:bg-red-400'
              : 'bg-green-600 hover:bg-green-700 text-white disabled:bg-green-400'
          } disabled:cursor-not-allowed`}
        >
          {isToggling ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Procesando...
            </span>
          ) : (
            `${isActive ? 'Apagar' : 'Encender'} ${sensorConfig.label}`
          )}
        </button>
      </div>

      {/* Información adicional */}
      {sensor.descripcion && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">{sensor.descripcion}</p>
        </div>
      )}
    </div>
  );
};

export default SensorCard;
