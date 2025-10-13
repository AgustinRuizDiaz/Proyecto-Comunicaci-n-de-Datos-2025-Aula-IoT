import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { aulaService, sensorService } from '../services/api';

export default function AulaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [aula, setAula] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', ip: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Estados para sensores
  const [sensores, setSensores] = useState([]);
  const [loadingSensores, setLoadingSensores] = useState(false);
  const [showSensorForm, setShowSensorForm] = useState(false);
  const [editingSensor, setEditingSensor] = useState(null);
  const [sensorFormData, setSensorFormData] = useState({
    tipo: 'Sensor de luz',
    descripcion: '',
    pin: '',
    estado: 0
  });
  const [deletingSensor, setDeletingSensor] = useState(null);
  const [savingSensor, setSavingSensor] = useState(false);

  useEffect(() => {
    loadAulaData();
  }, [id]);

  const loadAulaData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await aulaService.getById(id);
      
      console.log('Response from API:', response); // Debug
      
      // El backend devuelve { data: { success: true, data: aula } }
      const aulaData = response.data?.data || response.data || response;
      
      console.log('Aula data:', aulaData); // Debug
      
      setAula(aulaData);
      setFormData({ 
        nombre: aulaData.nombre || '', 
        ip: aulaData.ip || '' 
      });
    } catch (err) {
      console.error('Error cargando aula:', err);
      setError('No se pudo cargar la información del aula');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await aulaService.update(id, formData);
      await loadAulaData();
      setIsEditing(false);
    } catch (err) {
      console.error('Error guardando cambios:', err);
      const errorMessage = err.response?.data?.error || 'Error al guardar los cambios';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await aulaService.delete(id);
      navigate('/classrooms');
    } catch (err) {
      console.error('Error eliminando aula:', err);
      alert('Error al eliminar el aula');
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };

  const formatLastSignal = (lastSignal) => {
    if (!lastSignal) return 'Nunca';
    
    const now = new Date();
    const signalDate = new Date(lastSignal);
    const diffMs = now - signalDate;
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 1) return 'Hace menos de un minuto';
    if (diffMinutes < 60) return `Hace ${diffMinutes} minuto${diffMinutes !== 1 ? 's' : ''}`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
  };

  const isOnline = (lastSignal) => {
    if (!lastSignal) return false;
    const now = new Date();
    const signalDate = new Date(lastSignal);
    const diffMinutes = (now - signalDate) / 60000;
    return diffMinutes < 2;
  };

  // Funciones para sensores
  const loadSensores = async () => {
    try {
      setLoadingSensores(true);
      const response = await sensorService.getByAulaId(id);
      const sensoresData = response.data?.data || response.data || [];
      setSensores(sensoresData);
    } catch (err) {
      console.error('Error cargando sensores:', err);
    } finally {
      setLoadingSensores(false);
    }
  };

  useEffect(() => {
    if (id && aula) {
      loadSensores();
    }
  }, [id, aula]);

  const handleSensorInputChange = (e) => {
    const { name, value } = e.target;
    setSensorFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSensor = () => {
    setSensorFormData({
      tipo: 'Sensor de luz',
      descripcion: '',
      pin: '',
      estado: 0
    });
    setEditingSensor(null);
    setShowSensorForm(true);
  };

  const handleEditSensor = (sensor) => {
    setSensorFormData({
      tipo: sensor.tipo,
      descripcion: sensor.descripcion || '',
      pin: sensor.pin.toString(),
      estado: sensor.estado
    });
    setEditingSensor(sensor);
    setShowSensorForm(true);
  };

  const handleCancelSensorForm = () => {
    setShowSensorForm(false);
    setEditingSensor(null);
    setSensorFormData({
      tipo: 'Sensor de luz',
      descripcion: '',
      pin: '',
      estado: 0
    });
  };

  const handleSaveSensor = async () => {
    try {
      setSavingSensor(true);
      
      // Validar pin
      const pinNum = parseInt(sensorFormData.pin);
      if (isNaN(pinNum) || pinNum < 0 || pinNum > 100) {
        alert('El pin debe ser un número entre 0 y 100');
        return;
      }

      const sensorData = {
        tipo: sensorFormData.tipo,
        descripcion: sensorFormData.descripcion.trim(),
        pin: pinNum,
        estado: sensorFormData.estado,
        id_aula: parseInt(id)
      };

      if (editingSensor) {
        await sensorService.update(editingSensor.id, sensorData);
      } else {
        await sensorService.create(sensorData);
      }

      await loadSensores();
      handleCancelSensorForm();
    } catch (err) {
      console.error('Error guardando sensor:', err);
      const errorMessage = err.response?.data?.error || 'Error al guardar el sensor';
      alert(errorMessage);
    } finally {
      setSavingSensor(false);
    }
  };

  const handleDeleteSensor = async () => {
    if (!deletingSensor) return;
    
    try {
      await sensorService.delete(deletingSensor.id);
      await loadSensores();
      setDeletingSensor(null);
    } catch (err) {
      console.error('Error eliminando sensor:', err);
      alert('Error al eliminar el sensor');
    }
  };

  const handleToggleSensorEstado = async (sensorId, estadoActual) => {
    try {
      const nuevoEstado = estadoActual === 1 ? 0 : 1;
      await sensorService.updateEstado(sensorId, nuevoEstado);
      await loadSensores();
    } catch (err) {
      console.error('Error cambiando estado del sensor:', err);
      alert('Error al cambiar el estado del sensor');
    }
  };

  const getSensorIcon = (tipo, estado) => {
    if (tipo === 'Sensor de luz') {
      return (
        <svg className={`h-6 w-6 ${estado === 1 ? 'text-green-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    } else if (tipo === 'Sensor de ventana') {
      return (
        <svg className={`h-6 w-6 ${estado === 1 ? 'text-green-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
          <line x1="12" y1="3" x2="12" y2="21" strokeWidth={2} />
          <line x1="3" y1="12" x2="21" y2="12" strokeWidth={2} />
        </svg>
      );
    } else {
      return (
        <svg className={`h-6 w-6 ${estado === 1 ? 'text-green-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    }
  };

  const getSensorEstadoTexto = (tipo, estado) => {
    if (tipo === 'Sensor de luz') {
      return estado === 1 ? 'Encendido' : 'Apagado';
    } else if (tipo === 'Sensor de ventana') {
      return estado === 1 ? 'Abierto' : 'Cerrado';
    } else {
      return estado === 1 ? 'Detectado' : 'No detectado';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del aula...</p>
        </div>
      </div>
    );
  }

  if (error || !aula) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Aula no encontrada'}</p>
          <button
            onClick={() => navigate('/classrooms')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Volver a Aulas
          </button>
        </div>
      </div>
    );
  }

  const online = isOnline(aula.ultima_senal);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Detalle del Aula</h1>
          <button
            onClick={loadAulaData}
            disabled={loading}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Recargar"
          >
            <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Información General</h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="text-gray-700 font-medium w-32">Estado:</span>
              <div className="flex items-center">
                <span className={`inline-block w-3 h-3 rounded-full mr-2 ${online ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className={online ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                  {online ? 'En línea' : 'Fuera de línea'}
                </span>
              </div>
            </div>

            <div className="flex items-center">
              <span className="text-gray-700 font-medium w-32">Nombre:</span>
              {isEditing && isAdmin ? (
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre || ''}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <span className="text-gray-900">{aula?.nombre || 'N/A'}</span>
              )}
            </div>

            <div className="flex items-center">
              <span className="text-gray-700 font-medium w-32">Dirección IP:</span>
              {isEditing && isAdmin ? (
                <input
                  type="text"
                  name="ip"
                  value={formData.ip || ''}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <span className="text-gray-900">{aula?.ip || 'N/A'}</span>
              )}
            </div>

            <div className="flex items-center">
              <span className="text-gray-700 font-medium w-32">Última señal:</span>
              <span className="text-gray-600">{formatLastSignal(aula.ultima_senal)}</span>
            </div>
          </div>

          {isAdmin && (
            <div className="mt-6 flex justify-center space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Editar
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({ nombre: aula?.nombre || '', ip: aula?.ip || '' });
                    }}
                    disabled={saving}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Sección de Sensores */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Sensores</h2>
            {isAdmin && (
              <button
                onClick={handleAddSensor}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Agregar Sensor</span>
              </button>
            )}
          </div>

          {/* Lista de sensores */}
          {loadingSensores ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Cargando sensores...</p>
            </div>
          ) : sensores.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="h-12 w-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p>No hay sensores registrados</p>
              {isAdmin && <p className="text-sm mt-1">Haz clic en "Agregar Sensor" para crear uno</p>}
            </div>
          ) : (
            <ul className="space-y-2">
              {sensores.map((sensor) => (
                <li
                  key={sensor.id}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {/* Layout responsive */}
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    {/* Icono y datos del sensor */}
                    <div className="flex items-center space-x-3 flex-1">
                      {getSensorIcon(sensor.tipo, sensor.estado)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{sensor.tipo}</span>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">Pin {sensor.pin}</span>
                        </div>
                        {sensor.descripcion && (
                          <p className="text-sm text-gray-600">{sensor.descripcion}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Botones de acción - Desktop: inline con info, Mobile: abajo */}
                    <div className="flex flex-col md:flex-row gap-2 md:items-center">
                      {/* Botón de control para sensores de luz */}
                      {sensor.tipo === 'Sensor de luz' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSensorEstado(sensor.id, sensor.estado);
                          }}
                          className={`p-2 rounded-lg border transition-colors ${
                            sensor.estado === 1
                              ? 'text-green-600 bg-green-50 hover:text-green-900 hover:bg-green-100 border-green-200'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-gray-300'
                          }`}
                          title={sensor.estado === 1 ? 'Apagar' : 'Encender'}
                        >
                          <svg className="h-5 w-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 2v6m-5.3-.8a8 8 0 1010.6 0" />
                          </svg>
                        </button>
                      )}

                      {/* Botones de editar/eliminar (solo admin) */}
                      {isAdmin && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditSensor(sensor)}
                            className="flex-1 md:flex-none text-indigo-600 hover:text-indigo-900 p-2 rounded-lg hover:bg-indigo-50 border border-indigo-200 transition-colors"
                            title="Editar"
                          >
                            <svg className="h-5 w-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeletingSensor(sensor)}
                            className="flex-1 md:flex-none text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 border border-red-200 transition-colors"
                            title="Eliminar"
                          >
                            <svg className="h-5 w-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {isAdmin && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Eliminar Aula
            </button>
          </div>
        )}
      </div>

      {/* Modal de Confirmación de Eliminación de Aula */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Eliminar Aula</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  ¿Estás seguro de que quieres eliminar el aula <strong>{aula.nombre}</strong>?
                  Esta acción no se puede deshacer y se eliminarán todos los sensores asociados.
                </p>
              </div>
              <div className="flex justify-center space-x-3 mt-4">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  disabled={deleting}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Crear/Editar Sensor */}
      {showSensorForm && isAdmin && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-2 mx-auto p-3 border w-11/12 max-w-sm shadow-lg rounded-md bg-white sm:top-20 sm:p-5 sm:w-96 sm:max-w-md">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingSensor ? 'Editar Sensor' : 'Crear Nuevo Sensor'}
              </h3>

              <form onSubmit={(e) => { e.preventDefault(); handleSaveSensor(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo *
                  </label>
                  <select
                    name="tipo"
                    value={sensorFormData.tipo}
                    onChange={handleSensorInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Sensor de luz">Sensor de luz</option>
                    <option value="Sensor de ventana">Sensor de ventana</option>
                    <option value="Sensor de movimiento">Sensor de movimiento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pin (0-100) *
                  </label>
                  <input
                    type="number"
                    name="pin"
                    value={sensorFormData.pin}
                    onChange={handleSensorInputChange}
                    min="0"
                    max="100"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <input
                    type="text"
                    name="descripcion"
                    value={sensorFormData.descripcion}
                    onChange={handleSensorInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descripción del sensor (opcional)"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancelSensorForm}
                    disabled={savingSensor}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingSensor}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {savingSensor ? 'Guardando...' : (editingSensor ? 'Actualizar' : 'Crear')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación de Sensor */}
      {deletingSensor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Eliminar Sensor</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  ¿Estás seguro de que quieres eliminar el sensor <strong>{deletingSensor.tipo}</strong> (Pin {deletingSensor.pin})?
                  Esta acción no se puede deshacer.
                </p>
              </div>
              <div className="flex justify-center space-x-3 mt-4">
                <button
                  onClick={() => setDeletingSensor(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteSensor}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
