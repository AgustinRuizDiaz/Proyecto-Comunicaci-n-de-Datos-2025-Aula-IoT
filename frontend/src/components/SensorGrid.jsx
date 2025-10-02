import React, { useState } from 'react';
import {
  LightBulbIcon,
  EyeIcon,
  WindowIcon,
  BoltIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';

import {
  LightBulbIcon as LightBulbIconSolid,
} from '@heroicons/react/24/solid';

const SensorGrid = ({ sensoresPorTipo, onSensorToggle, isAdmin }) => {
  const [expandedGroups, setExpandedGroups] = useState({
    luz: true,
    movimiento: true,
    ventana: true,
    rele: true,
  });

  const [loadingSensors, setLoadingSensors] = useState({});

  // Función para formatear estado del sensor
  const formatSensorState = (tipo, estado) => {
    switch (tipo) {
      case 'luz':
        return estado ? 'Encendida' : 'Apagada';
      case 'movimiento':
        return estado ? 'Movimiento detectado' : 'Sin movimiento';
      case 'ventana':
        return estado === 'abierta' || estado === true ? 'Abierta' : 'Cerrada';
      case 'rele':
        return estado ? 'Activado' : 'Desactivado';
      default:
        return estado ? 'Activo' : 'Inactivo';
    }
  };

  // Función para obtener color del estado
  const getStateColor = (tipo, estado) => {
    const isActive = tipo === 'luz' || tipo === 'rele'
      ? (estado === true || estado === 'true')
      : (estado === 'abierta' || estado === true);

    if (tipo === 'luz') {
      return isActive
        ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-300'
        : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border-gray-300';
    }

    if (tipo === 'movimiento') {
      return isActive
        ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-300'
        : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border-gray-300';
    }

    if (tipo === 'ventana') {
      return isActive
        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300'
        : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border-gray-300';
    }

    if (tipo === 'rele') {
      return isActive
        ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-300'
        : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border-gray-300';
    }

    return 'bg-gray-100 text-gray-600 border-gray-300';
  };

  // Función para obtener ícono del tipo de sensor
  const getSensorIcon = (tipo) => {
    switch (tipo) {
      case 'luz':
        return <LightBulbIcon className="h-5 w-5" />;
      case 'movimiento':
        return <EyeIcon className="h-5 w-5" />;
      case 'ventana':
        return <WindowIcon className="h-5 w-5" />;
      case 'rele':
        return <BoltIcon className="h-5 w-5" />;
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-400"></div>;
    }
  };

  // Función para toggle grupo expandido
  const toggleGroup = (tipo) => {
    setExpandedGroups(prev => ({
      ...prev,
      [tipo]: !prev[tipo],
    }));
  };

  // Función para manejar toggle de sensor
  const handleSensorToggle = async (sensor) => {
    if (!isAdmin || loadingSensors[sensor.id]) return;

    setLoadingSensors(prev => ({ ...prev, [sensor.id]: true }));

    try {
      await onSensorToggle(sensor.id, 'toggle');
    } catch (error) {
      console.error('Error toggling sensor:', error);
    } finally {
      setLoadingSensors(prev => ({ ...prev, [sensor.id]: false }));
    }
  };

  // Función para formatear tiempo relativo
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Nunca';

    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `${diffMins}m atrás`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h atrás`;
  };

  const grupos = [
    { tipo: 'luz', titulo: 'Luces', icono: '💡', color: 'yellow' },
    { tipo: 'movimiento', titulo: 'Sensores de Movimiento', icono: '🚶', color: 'blue' },
    { tipo: 'ventana', titulo: 'Ventanas', icono: '🪟', color: 'green' },
    { tipo: 'rele', titulo: 'Relés', icono: '📡', color: 'purple' },
  ];

  return (
    <div className="space-y-4">
      {grupos.map(({ tipo, titulo, icono, color }) => {
        const sensores = sensoresPorTipo[tipo] || [];
        if (sensores.length === 0) return null;

        const isExpanded = expandedGroups[tipo];

        return (
          <div key={tipo} className="bg-white rounded-xl shadow-sm border overflow-hidden">
            {/* Header del grupo */}
            <button
              onClick={() => toggleGroup(tipo)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{icono}</span>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">{titulo}</h3>
                  <p className="text-sm text-gray-600">
                    {sensores.length} dispositivo{sensores.length !== 1 ? 's' : ''}
                    {sensores.filter(s => {
                      const isActive = tipo === 'luz' || tipo === 'rele'
                        ? (s.estado_actual === true || s.estado_actual === 'true')
                        : (s.estado_actual === 'abierta' || s.estado_actual === true);
                      return isActive;
                    }).length > 0 && (
                      ` • ${sensores.filter(s => {
                        const isActive = tipo === 'luz' || tipo === 'rele'
                          ? (s.estado_actual === true || s.estado_actual === 'true')
                          : (s.estado_actual === 'abierta' || s.estado_actual === true);
                        return isActive;
                      }).length} activo${sensores.filter(s => {
                        const isActive = tipo === 'luz' || tipo === 'rele'
                          ? (s.estado_actual === true || s.estado_actual === 'true')
                          : (s.estado_actual === 'abierta' || s.estado_actual === true);
                        return isActive;
                      }).length !== 1 ? 's' : ''}`
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </button>

            {/* Contenido del grupo */}
            {isExpanded && (
              <div className="border-t">
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sensores.map((sensor) => {
                    const isActive = tipo === 'luz' || tipo === 'rele'
                      ? (sensor.estado_actual === true || sensor.estado_actual === 'true')
                      : (sensor.estado_actual === 'abierta' || sensor.estado_actual === true);

                    return (
                      <div
                        key={sensor.id}
                        className={`relative p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                          isActive ? 'ring-2 ring-opacity-50' : ''
                        } ${getStateColor(tipo, sensor.estado_actual)}`}
                      >
                        {/* Estado visual para luces */}
                        {tipo === 'luz' && (
                          <div className="absolute top-2 right-2">
                            <div className={`w-3 h-3 rounded-full ${
                              isActive ? 'bg-yellow-400 animate-pulse' : 'bg-gray-400'
                            }`}></div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              isActive ? 'bg-white bg-opacity-50' : 'bg-white bg-opacity-70'
                            }`}>
                              {getSensorIcon(tipo)}
                            </div>

                            <div>
                              <h4 className="font-medium text-sm">
                                {sensor.descripcion || `Sensor ${sensor.pin_esp32}`}
                              </h4>
                              <p className="text-xs opacity-75">
                                Pin {sensor.pin_esp32}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {formatSensorState(tipo, sensor.estado_actual)}
                            </div>
                            <div className="text-xs opacity-75">
                              {formatTimeAgo(sensor.ultima_actualizacion)}
                            </div>
                          </div>
                        </div>

                        {/* Control para luces y relés (solo admin) */}
                        {(tipo === 'luz' || tipo === 'rele') && isAdmin && (
                          <div className="mt-3 pt-3 border-t">
                            <button
                              onClick={() => handleSensorToggle(sensor)}
                              disabled={loadingSensors[sensor.id]}
                              className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isActive
                                  ? 'bg-red-100 hover:bg-red-200 text-red-700 border border-red-300'
                                  : 'bg-green-100 hover:bg-green-200 text-green-700 border border-green-300'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {loadingSensors[sensor.id] ? (
                                <div className="flex items-center justify-center gap-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                  <span>Cambiando...</span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-2">
                                  {tipo === 'luz' ? (
                                    isActive ? (
                                      <>
                                        <LightBulbIconSolid className="h-4 w-4" />
                                        <span>Apagar</span>
                                      </>
                                    ) : (
                                      <>
                                        <LightBulbIcon className="h-4 w-4" />
                                        <span>Encender</span>
                                      </>
                                    )
                                  ) : (
                                    isActive ? 'Desactivar' : 'Activar'
                                  )}
                                </div>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Mensaje cuando no hay sensores */}
      {Object.values(sensoresPorTipo).every(grupo => grupo.length === 0) && (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay sensores configurados</h3>
          <p className="text-gray-600">
            Esta aula no tiene sensores registrados en el sistema.
          </p>
        </div>
      )}
    </div>
  );
};

export default SensorGrid;
