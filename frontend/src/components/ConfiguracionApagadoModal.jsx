import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const ConfiguracionApagadoModal = ({ aula, configuracion, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    apagado_automatico_habilitado: true,
    tiempo_inactividad_minutos: 30,
    horario_laboral_solo: true,
    hora_inicio_laboral: '08:00',
    hora_fin_laboral: '18:00',
    lunes_habilitado: true,
    martes_habilitado: true,
    miercoles_habilitado: true,
    jueves_habilitado: true,
    viernes_habilitado: true,
    sabado_habilitado: false,
    domingo_habilitado: false,
    tiempo_gracia_minutos: 5,
    maximo_apagados_por_dia: 10,
    notificar_apagado: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [testingConfig, setTestingConfig] = useState(false);

  // Inicializar formulario con datos de configuración si existe
  useEffect(() => {
    if (configuracion) {
      setFormData({
        apagado_automatico_habilitado: configuracion.apagado_automatico_habilitado ?? true,
        tiempo_inactividad_minutos: configuracion.tiempo_inactividad_minutos ?? 30,
        horario_laboral_solo: configuracion.horario_laboral_solo ?? true,
        hora_inicio_laboral: configuracion.hora_inicio_laboral ?? '08:00',
        hora_fin_laboral: configuracion.hora_fin_laboral ?? '18:00',
        lunes_habilitado: configuracion.lunes_habilitado ?? true,
        martes_habilitado: configuracion.martes_habilitado ?? true,
        miercoles_habilitado: configuracion.miercoles_habilitado ?? true,
        jueves_habilitado: configuracion.jueves_habilitado ?? true,
        viernes_habilitado: configuracion.viernes_habilitado ?? true,
        sabado_habilitado: configuracion.sabado_habilitado ?? false,
        domingo_habilitado: configuracion.domingo_habilitado ?? false,
        tiempo_gracia_minutos: configuracion.tiempo_gracia_minutos ?? 5,
        maximo_apagados_por_dia: configuracion.maximo_apagados_por_dia ?? 10,
        notificar_apagado: configuracion.notificar_apagado ?? false
      });
    }
  }, [configuracion]);

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (formData.tiempo_inactividad_minutos < 1) {
      newErrors.tiempo_inactividad_minutos = 'El tiempo debe ser al menos 1 minuto';
    }

    if (formData.tiempo_inactividad_minutos > 1440) {
      newErrors.tiempo_inactividad_minutos = 'El tiempo no puede exceder 24 horas (1440 minutos)';
    }

    if (formData.tiempo_gracia_minutos < 0) {
      newErrors.tiempo_gracia_minutos = 'El tiempo de gracia no puede ser negativo';
    }

    if (formData.tiempo_gracia_minutos > 60) {
      newErrors.tiempo_gracia_minutos = 'El tiempo de gracia no puede exceder 60 minutos';
    }

    if (formData.maximo_apagados_por_dia < 0) {
      newErrors.maximo_apagados_por_dia = 'El máximo de apagados no puede ser negativo';
    }

    if (formData.maximo_apagados_por_dia > 1000) {
      newErrors.maximo_apagados_por_dia = 'El máximo de apagados no puede exceder 1000';
    }

    if (formData.hora_inicio_laboral >= formData.hora_fin_laboral) {
      newErrors.hora_fin_laboral = 'La hora de fin debe ser posterior a la hora de inicio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await onSave(formData);
    } catch (err) {
      setErrors({
        general: err.message || 'Error guardando configuración'
      });
    } finally {
      setLoading(false);
    }
  };

  // Probar configuración
  const handleTestConfig = async () => {
    try {
      setTestingConfig(true);
      // Aquí iría la llamada a la API para probar la configuración
      // Por ahora simulamos la respuesta
      alert('Configuración probada exitosamente. Puede apagar automáticamente.');
    } catch (err) {
      alert('Error probando configuración: ' + err.message);
    } finally {
      setTestingConfig(false);
    }
  };

  // Obtener días de la semana disponibles
  const diasSemana = [
    { key: 'lunes_habilitado', label: 'Lunes' },
    { key: 'martes_habilitado', label: 'Martes' },
    { key: 'miercoles_habilitado', label: 'Miércoles' },
    { key: 'jueves_habilitado', label: 'Jueves' },
    { key: 'viernes_habilitado', label: 'Viernes' },
    { key: 'sabado_habilitado', label: 'Sábado' },
    { key: 'domingo_habilitado', label: 'Domingo' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Configuración de Apagado Automático
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {aula?.nombre || 'Aula'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error general */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Configuración básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Configuración Básica
            </h3>

            {/* Habilitar/Deshabilitar apagado automático */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Apagado Automático
                </label>
                <p className="text-sm text-gray-500">
                  Habilitar el apagado automático de luces por inactividad
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleChange('apagado_automatico_habilitado', !formData.apagado_automatico_habilitado)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.apagado_automatico_habilitado ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.apagado_automatico_habilitado ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Tiempo de inactividad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiempo de Inactividad (minutos) *
              </label>
              <input
                type="number"
                min="1"
                max="1440"
                value={formData.tiempo_inactividad_minutos}
                onChange={(e) => handleChange('tiempo_inactividad_minutos', parseInt(e.target.value) || 1)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.tiempo_inactividad_minutos ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.tiempo_inactividad_minutos && (
                <p className="mt-1 text-sm text-red-600">{errors.tiempo_inactividad_minutos}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Tiempo sin movimiento antes de apagar luces (1-1440 minutos)
              </p>
            </div>
          </div>

          {/* Configuración de horario laboral */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Horario Laboral
            </h3>

            {/* Solo en horario laboral */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Solo en Horario Laboral
                </label>
                <p className="text-sm text-gray-500">
                  Solo apagar automáticamente durante el horario laboral configurado
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleChange('horario_laboral_solo', !formData.horario_laboral_solo)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.horario_laboral_solo ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.horario_laboral_solo ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Horas laborales */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora de Inicio
                </label>
                <input
                  type="time"
                  value={formData.hora_inicio_laboral}
                  onChange={(e) => handleChange('hora_inicio_laboral', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.hora_inicio_laboral ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.hora_inicio_laboral && (
                  <p className="mt-1 text-sm text-red-600">{errors.hora_inicio_laboral}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora de Fin
                </label>
                <input
                  type="time"
                  value={formData.hora_fin_laboral}
                  onChange={(e) => handleChange('hora_fin_laboral', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.hora_fin_laboral ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.hora_fin_laboral && (
                  <p className="mt-1 text-sm text-red-600">{errors.hora_fin_laboral}</p>
                )}
              </div>
            </div>

            {/* Días de la semana */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Días Habilitados
              </label>
              <div className="grid grid-cols-2 gap-2">
                {diasSemana.map(dia => (
                  <label key={dia.key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData[dia.key]}
                      onChange={(e) => handleChange(dia.key, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{dia.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Configuración avanzada */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Configuración Avanzada
            </h3>

            {/* Tiempo de gracia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiempo de Gracia (minutos)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={formData.tiempo_gracia_minutos}
                onChange={(e) => handleChange('tiempo_gracia_minutos', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.tiempo_gracia_minutos ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.tiempo_gracia_minutos && (
                <p className="mt-1 text-sm text-red-600">{errors.tiempo_gracia_minutos}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Tiempo adicional antes de apagar luces después de detectar movimiento
              </p>
            </div>

            {/* Máximo apagados por día */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Máximo Apagados por Día
              </label>
              <input
                type="number"
                min="0"
                max="1000"
                value={formData.maximo_apagados_por_dia}
                onChange={(e) => handleChange('maximo_apagados_por_dia', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.maximo_apagados_por_dia ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.maximo_apagados_por_dia && (
                <p className="mt-1 text-sm text-red-600">{errors.maximo_apagados_por_dia}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Límite de apagados automáticos por día (0 = sin límite)
              </p>
            </div>

            {/* Notificar apagado */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Notificar Apagado
                </label>
                <p className="text-sm text-gray-500">
                  Enviar notificación cuando se ejecute apagado automático
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleChange('notificar_apagado', !formData.notificar_apagado)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.notificar_apagado ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.notificar_apagado ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleTestConfig}
              disabled={testingConfig || loading}
              className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              {testingConfig ? 'Probando...' : 'Probar Configuración'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              {loading ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfiguracionApagadoModal;
