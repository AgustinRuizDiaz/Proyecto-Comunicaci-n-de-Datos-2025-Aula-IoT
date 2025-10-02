import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const AulaModal = ({ aula, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    ip_esp32: '',
    timeout_inactividad: 30,
    apagado_automatico: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Inicializar formulario con datos del aula si existe
  useEffect(() => {
    if (aula) {
      setFormData({
        nombre: aula.nombre || '',
        ip_esp32: aula.ip_esp32 || '',
        timeout_inactividad: aula.timeout_inactividad || 30,
        apagado_automatico: aula.apagado_automatico !== false
      });
    }
  }, [aula]);

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (!formData.ip_esp32.trim()) {
      newErrors.ip_esp32 = 'La IP ESP32 es obligatoria';
    } else {
      // Validación básica de IP
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (!ipRegex.test(formData.ip_esp32)) {
        newErrors.ip_esp32 = 'Formato de IP inválido';
      }
    }

    if (formData.timeout_inactividad < 1) {
      newErrors.timeout_inactividad = 'El timeout debe ser al menos 1 minuto';
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
        general: err.message || 'Error guardando aula'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {aula ? 'Editar Aula' : 'Nueva Aula'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error general */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Aula *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.nombre ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ej: Aula 101"
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
            )}
          </div>

          {/* IP ESP32 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IP ESP32 *
            </label>
            <input
              type="text"
              value={formData.ip_esp32}
              onChange={(e) => handleChange('ip_esp32', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.ip_esp32 ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="192.168.1.100"
            />
            {errors.ip_esp32 && (
              <p className="mt-1 text-sm text-red-600">{errors.ip_esp32}</p>
            )}
          </div>

          {/* Timeout de inactividad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timeout de Inactividad (minutos)
            </label>
            <input
              type="number"
              min="1"
              max="1440"
              value={formData.timeout_inactividad}
              onChange={(e) => handleChange('timeout_inactividad', parseInt(e.target.value) || 30)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.timeout_inactividad ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.timeout_inactividad && (
              <p className="mt-1 text-sm text-red-600">{errors.timeout_inactividad}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Tiempo máximo sin señal antes de considerar el aula offline
            </p>
          </div>

          {/* Apagado automático */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.apagado_automatico}
                onChange={(e) => handleChange('apagado_automatico', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Apagado automático de luces
              </span>
            </label>
            <p className="mt-1 text-xs text-gray-500">
              Permite el control remoto de luces desde la interfaz
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              {loading ? 'Guardando...' : (aula ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AulaModal;
