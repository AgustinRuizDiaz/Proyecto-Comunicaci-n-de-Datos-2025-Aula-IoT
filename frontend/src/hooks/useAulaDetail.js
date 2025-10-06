import { useState, useEffect, useCallback } from 'react';
import { aulaService, historyService } from '../services/api';

const useAulaDetail = (aulaId) => {
  const [aula, setAula] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Cargar datos del aula
  const loadAulaData = useCallback(async () => {
    if (!aulaId) return;

    try {
      setLoading(true);
      setError(null);

      // Cargar datos del aula
      const aulaResponse = await aulaService.getById(aulaId);
      setAula(aulaResponse.data);

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

  // Apagar todas las luces
  const toggleAllLights = useCallback(async () => {
    if (!aulaId) return;

    try {
      const response = await aulaService.toggleLights(aulaId);
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
    historial,
    loading,
    error,
    saving,
    loadAulaData,
    loadHistorial,
    updateAulaConfig,
    toggleAllLights,
    checkConnectivity,
    formatTimeAgo,
    setError,
  };
};

export default useAulaDetail;
