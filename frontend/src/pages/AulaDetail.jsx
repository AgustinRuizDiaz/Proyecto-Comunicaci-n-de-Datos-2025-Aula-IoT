import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { aulaService, sensorService } from '../services/api';

// Íconos SVG básicos como alternativa a Heroicons
const WifiIconSolid = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

const WifiOffIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
);

const LightBulbIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const AulaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [aula, setAula] = useState(null);
  const [sensores, setSensores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsData, setSettingsData] = useState({});

  useEffect(() => {
    loadAulaData();
  }, [id]);

  const loadAulaData = async () => {
    try {
      setLoading(true);
      const [aulaResponse, sensoresResponse] = await Promise.all([
        aulaService.getById(id),
        sensorService.getAll()
      ]);

      setAula(aulaResponse.data);
      // Filtrar sensores de esta aula
      const aulaSensores = sensoresResponse.data.filter(sensor => sensor.aula === parseInt(id));
      setSensores(aulaSensores);
    } catch (err) {
      setError('Error cargando datos del aula: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSensorToggle = async (sensorId, newState) => {
    try {
      setUpdating(true);
      await sensorService.update(sensorId, { estado_actual: newState });

      // Actualizar estado local optimísticamente
      setSensores(prev => prev.map(sensor =>
        sensor.id === sensorId
          ? { ...sensor, estado_actual: newState }
          : sensor
      ));
    } catch (err) {
      alert('Error actualizando sensor: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleAllLights = async () => {
    if (!window.confirm('¿Estás seguro de que quieres apagar todas las luces de esta aula?')) {
      return;
    }

    try {
      setUpdating(true);
      const response = await aulaService.toggleLights(id);

      // Recargar datos para reflejar cambios
      loadAulaData();
      alert(response.data.mensaje);
    } catch (err) {
      alert('Error controlando luces: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(false);
    }
  };

  const handleCheckConnectivity = async () => {
    try {
      const response = await aulaService.checkConnectivity(id);
      alert(response.data.mensaje);
      loadAulaData(); // Recargar para actualizar estado
    } catch (err) {
      alert('Error verificando conectividad: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSettingsSave = async () => {
    try {
      await aulaService.update(id, settingsData);
      setShowSettings(false);
      loadAulaData();
      alert('Configuración actualizada exitosamente');
    } catch (err) {
      alert('Error guardando configuración: ' + (err.response?.data?.message || err.message));
    }
  };

  const formatTime = (tiempo) => {
    if (!tiempo) return 'Nunca';

    const minutos = tiempo.minutos || 0;
    const segundos = tiempo.segundos || 0;

    if (minutos === 0) {
      return `${segundos}s`;
    }
    return `${minutos}m ${segundos}s`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-gradient-to-r from-green-400 to-green-600 text-white';
      case 'offline':
        return 'bg-gradient-to-r from-red-400 to-red-600 text-white';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
    }
  };

  const getSensorIcon = (tipo) => {
    switch (tipo) {
      case 'luz':
        return <LightBulbIcon className="h-6 w-6" />;
      case 'movimiento':
        return <div className="h-6 w-6 bg-blue-500 rounded-full animate-pulse"></div>;
      case 'ventana':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 8h6m-3-3v6" />
          </svg>
        );
      case 'rele':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      default:
        return <div className="h-6 w-6 bg-gray-400 rounded"></div>;
    }
  };

  const groupSensorsByType = (sensores) => {
    return sensores.reduce((groups, sensor) => {
      const tipo = sensor.tipo;
      if (!groups[tipo]) {
        groups[tipo] = [];
      }
      groups[tipo].push(sensor);
      return groups;
    }, {});
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
        <p className="text-red-700">{error}</p>
        <button
          onClick={() => navigate('/classrooms')}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
        >
          Volver a Aulas
        </button>
      </div>
    );
  }

  if (!aula) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Aula no encontrada</h3>
        <button
          onClick={() => navigate('/classrooms')}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          Volver a Aulas
        </button>
      </div>
    );
  }

  const sensorGroups = groupSensorsByType(sensores);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/classrooms')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{aula.nombre}</h1>
              <p className="text-gray-600">{aula.ip_esp32}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Estado de conexión */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${getStatusColor(aula.estado_conexion)}`}>
              {aula.estado_conexion === 'online' ? <WifiIconSolid /> : <WifiOffIcon />}
              <span className="font-medium capitalize">
                {aula.estado_conexion === 'online' ? 'En línea' :
                 aula.estado_conexion === 'offline' ? 'Fuera de línea' : 'Desconocido'}
              </span>
            </div>

            {/* Acciones */}
            <button
              onClick={handleCheckConnectivity}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Verificar Conexión
            </button>

            {user?.rol === 'Admin' && (
              <button
                onClick={() => setShowSettings(true)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <SettingsIcon />
                Configuración
              </button>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <ClockIcon />
            <span>Última señal: {formatTime(aula.tiempo_desde_ultima_senal)}</span>
          </div>
          <div className="text-gray-600">
            Timeout: {aula.timeout_inactividad} minutos
          </div>
          <div className="text-gray-600">
            Apagado automático: {aula.apagado_automatico ? 'Activado' : 'Desactivado'}
          </div>
        </div>
      </div>

      {/* Grid de sensores por tipo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Object.entries(sensorGroups).map(([tipo, sensoresTipo]) => (
          <div key={tipo} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                {getSensorIcon(tipo)}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 capitalize">
                {tipo === 'luz' ? 'Luces' :
                 tipo === 'movimiento' ? 'Sensores de Movimiento' :
                 tipo === 'ventana' ? 'Ventanas' :
                 tipo === 'rele' ? 'Relés' : tipo}
              </h3>
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                {sensoresTipo.length}
              </span>
            </div>

            <div className="space-y-3">
              {sensoresTipo.map((sensor) => (
                <div key={sensor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{sensor.descripcion}</p>
                    <p className="text-sm text-gray-600">Pin {sensor.pin_esp32}</p>
                  </div>

                  {tipo === 'luz' ? (
                    <button
                      onClick={() => handleSensorToggle(sensor.id, sensor.estado_actual === 'true' ? 'false' : 'true')}
                      disabled={updating}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        sensor.estado_actual === 'true'
                          ? 'bg-gradient-to-r from-green-400 to-green-600'
                          : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          sensor.estado_actual === 'true' ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  ) : tipo === 'movimiento' ? (
                    <div className={`px-3 py-1 rounded-full text-sm ${
                      sensor.estado_actual === 'true'
                        ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {sensor.estado_actual === 'true' ? 'Detectado' : 'Sin movimiento'}
                    </div>
                  ) : tipo === 'ventana' ? (
                    <div className={`px-3 py-1 rounded-full text-sm ${
                      sensor.estado_actual === 'true'
                        ? 'bg-gradient-to-r from-green-400 to-green-600 text-white'
                        : 'bg-red-200 text-red-600'
                    }`}>
                      {sensor.estado_actual === 'true' ? 'Abierta' : 'Cerrada'}
                    </div>
                  ) : tipo === 'rele' ? (
                    <button
                      onClick={() => handleSensorToggle(sensor.id, sensor.estado_actual === 'true' ? 'false' : 'true')}
                      disabled={updating}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        sensor.estado_actual === 'true'
                          ? 'bg-gradient-to-r from-purple-400 to-purple-600 text-white hover:from-purple-500 hover:to-purple-700'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {sensor.estado_actual === 'true' ? 'ON' : 'OFF'}
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleToggleAllLights}
            disabled={updating}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <LightBulbIcon />
            Apagar Todas las Luces
          </button>

          <button
            onClick={handleCheckConnectivity}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <WifiIconSolid />
            Verificar Conectividad
          </button>
        </div>
      </div>

      {/* Configuración (solo admin) */}
      {user?.rol === 'Admin' && showSettings && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración del Aula</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeout de Inactividad (minutos)
              </label>
              <input
                type="number"
                min="1"
                value={settingsData.timeout_inactividad || aula.timeout_inactividad}
                onChange={(e) => setSettingsData(prev => ({
                  ...prev,
                  timeout_inactividad: parseInt(e.target.value)
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settingsData.apagado_automatico !== false}
                  onChange={(e) => setSettingsData(prev => ({
                    ...prev,
                    apagado_automatico: e.target.checked
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Apagado automático habilitado</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSettingsSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Guardar Configuración
            </button>
            <button
              onClick={() => setShowSettings(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AulaDetail;
