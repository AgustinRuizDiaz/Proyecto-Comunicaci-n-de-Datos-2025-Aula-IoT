import React, { useState, useEffect } from 'react';
import { ArrowPathIcon, ClockIcon } from '@heroicons/react/24/outline';

const ActivityLog = ({ historial, loading, onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Función para formatear el tipo de cambio
  const formatChangeType = (tipo) => {
    switch (tipo) {
      case 'manual':
        return { label: 'Manual', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'automatico':
        return { label: 'Automático', color: 'bg-green-100 text-green-800 border-green-200' };
      case 'sensor':
        return { label: 'Sensor', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      default:
        return { label: tipo, color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  // Función para formatear el cambio de estado
  const formatStateChange = (estadoAnterior, estadoNuevo) => {
    if (estadoAnterior === estadoNuevo) {
      return `${estadoNuevo}`;
    }

    const formatEstado = (estado) => {
      if (typeof estado === 'boolean') {
        return estado ? 'Activado' : 'Desactivado';
      }
      return estado;
    };

    return `${formatEstado(estadoAnterior)} → ${formatEstado(estadoNuevo)}`;
  };

  // Función para formatear tiempo relativo detallado
  const formatDetailedTime = (fecha, hora) => {
    if (!fecha || !hora) return 'Fecha desconocida';

    const dateTime = new Date(`${fecha}T${hora}`);
    const now = new Date();
    const diffMs = now - dateTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;

    // Para fechas más antiguas, mostrar fecha y hora
    return dateTime.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Función para obtener ícono según el tipo de sensor
  const getSensorIcon = (tipoSensor) => {
    switch (tipoSensor) {
      case 'luz':
        return '💡';
      case 'movimiento':
        return '🚶';
      case 'ventana':
        return '🪟';
      case 'rele':
        return '📡';
      default:
        return '📱';
    }
  };

  // Función para manejar refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh cada 30 segundos si no está cargando
  useEffect(() => {
    if (loading) return;

    const interval = setInterval(() => {
      if (onRefresh) {
        onRefresh();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loading, onRefresh]);

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <ClockIcon className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Actividad Reciente</h3>
        </div>

        {onRefresh && (
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Actualizar"
          >
            <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* Contenido */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Cargando actividad...</p>
          </div>
        ) : historial.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-2">
              <ClockIcon className="h-8 w-8 mx-auto" />
            </div>
            <p className="text-sm text-gray-600">No hay actividad reciente</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {historial.map((registro, index) => {
              const changeType = formatChangeType(registro.tipo_cambio);
              const timeFormatted = formatDetailedTime(registro.fecha, registro.hora);

              return (
                <div
                  key={registro.id || index}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Ícono del tipo de sensor */}
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">
                        {getSensorIcon(registro.sensor_tipo)}
                      </div>
                    </div>

                    {/* Contenido del registro */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 text-sm">
                            {registro.sensor_descripcion || `Sensor ${registro.sensor_pin}`}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${changeType.color}`}>
                            {changeType.label}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {timeFormatted}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">
                          {formatStateChange(registro.estado_anterior, registro.estado_nuevo)}
                        </span>
                      </div>

                      {/* Usuario que realizó el cambio (si aplica) */}
                      {registro.usuario && (
                        <div className="text-xs text-gray-500">
                          {registro.usuario_rol === 'Admin' ? '👑' : '👤'} {registro.usuario}
                        </div>
                      )}

                      {/* Información adicional para cambios automáticos */}
                      {registro.tipo_cambio === 'automatico' && registro.detalles && (
                        <div className="mt-1 p-2 bg-blue-50 rounded text-xs text-blue-700">
                          <span className="font-medium">Detalles:</span> {registro.detalles}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer con estadísticas */}
      {historial.length > 0 && (
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>
              Mostrando {historial.length} actividad{historial.length !== 1 ? 'es' : ''}
            </span>
            <span>
              Última actualización: {new Date().toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
