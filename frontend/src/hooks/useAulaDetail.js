import { useState, useEffect, useCallback } from 'react';
import { aulaService, sensorService, historyService } from '../services/api';

const useAulaDetail = (aulaId) => {
  const [aula, setAula] = useState(null);
  const [sensores, setSensores] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Cargar datos del aula con sensores
  const loadAulaData = useCallback(async () => {
    if (!aulaId) return;

    try {
      setLoading(true);
      setError(null);

      // Cargar datos del aula con información detallada
      const aulaResponse = await aulaService.getById(aulaId);
      setAula(aulaResponse.data);

      // Cargar sensores del aula
      if (aulaResponse.data.sensores && aulaResponse.data.sensores.length > 0) {
        // Si ya vienen sensores incluidos (optimización del backend)
        setSensores(aulaResponse.data.sensores);
      } else {
        // Cargar sensores por separado si no vienen incluidos
        const sensoresResponse = await sensorService.getAll();
        const sensoresFiltrados = sensoresResponse.data.results.filter(
          sensor => sensor.aula === parseInt(aulaId)
        );
        setSensores(sensoresFiltrados);
      }

    } catch (err) {
      setError('Error cargando datos del aula: ' + (err.response?.data?.message || err.message));
      console.error('Error loading aula data:', err);
    } finally {
      setLoading(false);
    }
  }, [aulaId]);

  // Cargar historial de cambios
  const loadHistorial = useCallback(async (params = {}) => {
    if (!aulaId) return;

    try {
      const response = await historyService.getByClassroom(aulaId, {
        limit: 50,
        ordering: '-fecha,-hora',
        ...params,
      });
      setHistorial(response.data.results || response.data);
    } catch (err) {
      console.error('Error loading historial:', err);
      // No establecer error aquí ya que el historial es secundario
    }
  }, [aulaId]);

  // Actualizar configuración del aula
  const updateAulaConfig = useCallback(async (configData) => {
    if (!aulaId) return;

    try {
      setSaving(true);
      const response = await aulaService.update(aulaId, configData);
      setAula(prev => ({ ...prev, ...response.data }));
      return { success: true };
    } catch (err) {
      setError('Error actualizando configuración: ' + (err.response?.data?.message || err.message));
      return {
        success: false,
        error: err.response?.data?.message || err.message
      };
    } finally {
      setSaving(false);
    }
  }, [aulaId]);

  // Controlar luces individuales
  const toggleSensor = useCallback(async (sensorId, action = 'toggle') => {
    if (!sensorId) return;

    try {
      const response = await sensorService.update(sensorId, {
        action,
        timestamp: new Date().toISOString(),
      });

      // Actualizar estado local del sensor
      setSensores(prev => prev.map(sensor =>
        sensor.id === sensorId
          ? { ...sensor, estado_actual: response.data.estado_actual }
          : sensor
      ));

      return { success: true };
    } catch (err) {
      setError('Error controlando sensor: ' + (err.response?.data?.message || err.message));
      return {
        success: false,
        error: err.response?.data?.message || err.message
      };
    }
  }, []);

  // Apagar todas las luces
  const toggleAllLights = useCallback(async () => {
    if (!aulaId) return;

    try {
      const response = await aulaService.toggleLights(aulaId);

      // Actualizar estado local de todas las luces
      setSensores(prev => prev.map(sensor =>
        sensor.tipo === 'luz'
          ? { ...sensor, estado_actual: false }
          : sensor
      ));

      return { success: true, message: response.data.mensaje };
    } catch (err) {
      setError('Error apagando luces: ' + (err.response?.data?.message || err.message));
      return {
        success: false,
        error: err.response?.data?.message || err.message
      };
    }
  }, [aulaId]);

  // Verificar conectividad
  const checkConnectivity = useCallback(async () => {
    if (!aulaId) return;

    try {
      const response = await aulaService.checkConnectivity(aulaId);
      // Recargar datos del aula para actualizar estado de conexión
      await loadAulaData();
      return { success: true, message: response.data.mensaje };
    } catch (err) {
      setError('Error verificando conectividad: ' + (err.response?.data?.message || err.message));
      return {
        success: false,
        error: err.response?.data?.message || err.message
      };
    }
  }, [aulaId, loadAulaData]);

  // Función para obtener estadísticas rápidas
  const getSensorStats = useCallback(() => {
    if (!sensores.length) return {};

    const luces = sensores.filter(s => s.tipo === 'luz');
    const movimiento = sensores.filter(s => s.tipo === 'movimiento');
    const ventanas = sensores.filter(s => s.tipo === 'ventana');
    const reles = sensores.filter(s => s.tipo === 'rele');

    return {
      luces: {
        total: luces.length,
        encendidas: luces.filter(l => l.estado_actual === true || l.estado_actual === 'true').length,
      },
      movimiento: {
        total: movimiento.length,
        activos: movimiento.filter(m => m.estado_actual === true || m.estado_actual === 'true').length,
      },
      ventanas: {
        total: ventanas.length,
        abiertas: ventanas.filter(v => v.estado_actual === 'abierta' || v.estado_actual === 'true').length,
      },
      reles: {
        total: reles.length,
        activos: reles.filter(r => r.estado_actual === true || r.estado_actual === 'true').length,
      },
    };
  }, [sensores]);

  // Función para agrupar sensores por tipo
  const getSensoresPorTipo = useCallback(() => {
    const grupos = {
      luz: sensores.filter(s => s.tipo === 'luz'),
      movimiento: sensores.filter(s => s.tipo === 'movimiento'),
      ventana: sensores.filter(s => s.tipo === 'ventana'),
      rele: sensores.filter(s => s.tipo === 'rele'),
    };
    return grupos;
  }, [sensores]);

  // Función para formatear tiempo relativo
  const formatTimeAgo = useCallback((timestamp) => {
    if (!timestamp) return 'Nunca';

    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return `Hace ${diffDays}d`;
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    if (aulaId) {
      loadAulaData();
      loadHistorial();
    }
  }, [aulaId, loadAulaData, loadHistorial]);

  // Recargar datos periódicamente (cada 30 segundos)
  useEffect(() => {
    if (!aulaId) return;

    const interval = setInterval(() => {
      loadAulaData();
    }, 30000);

    return () => clearInterval(interval);
  }, [aulaId, loadAulaData]);

  return {
    aula,
    sensores,
    historial,
    loading,
    error,
    saving,
    loadAulaData,
    loadHistorial,
    updateAulaConfig,
    toggleSensor,
    toggleAllLights,
    checkConnectivity,
    getSensorStats,
    getSensoresPorTipo,
    formatTimeAgo,
    setError,
  };
};

export default useAulaDetail;
