import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { aulaService } from '../services/api';
import AulaCard from '../components/AulaCard';
import AulaModal from '../components/AulaModal';

// Íconos SVG básicos como alternativa a Heroicons
const PlusIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const MagnifyingGlassIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const FunnelIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const Classrooms = () => {
  const { user } = useAuth();
  const [aulas, setAulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAula, setEditingAula] = useState(null);

  // Cargar aulas
  const loadAulas = async () => {
    try {
      setLoading(true);
      const params = {};

      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.estado = statusFilter;

      const response = await aulaService.getAll(params);
      setAulas(response.data.results || response.data);
    } catch (err) {
      setError('Error cargando aulas: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAulas();
  }, [searchTerm, statusFilter]);

  // Crear aula
  const handleCreateAula = () => {
    setEditingAula(null);
    setShowModal(true);
  };

  // Editar aula
  const handleEditAula = (aula) => {
    setEditingAula(aula);
    setShowModal(true);
  };

  // Guardar aula (crear o actualizar)
  const handleSaveAula = async (aulaData) => {
    try {
      if (editingAula) {
        await aulaService.update(editingAula.id, aulaData);
      } else {
        await aulaService.create(aulaData);
      }
      setShowModal(false);
      loadAulas();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Error guardando aula');
    }
  };

  // Eliminar aula
  const handleDeleteAula = async (aulaId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta aula?')) {
      return;
    }

    try {
      await aulaService.delete(aulaId);
      loadAulas();
    } catch (err) {
      setError('Error eliminando aula: ' + (err.response?.data?.message || err.message));
    }
  };

  // Verificar conectividad
  const handleCheckConnectivity = async (aulaId) => {
    try {
      const response = await aulaService.checkConnectivity(aulaId);
      alert(response.data.mensaje);
      loadAulas(); // Recargar para actualizar estado
    } catch (err) {
      alert('Error verificando conectividad: ' + (err.response?.data?.message || err.message));
    }
  };

  // Toggle luces
  const handleToggleLights = async (aulaId) => {
    try {
      const response = await aulaService.toggleLights(aulaId);
      alert(response.data.mensaje);
    } catch (err) {
      alert('Error controlando luces: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Aulas</h1>
          <p className="text-gray-600">Administra las aulas y sus dispositivos conectados</p>
        </div>
        {user?.rol === 'Admin' && (
          <button
            onClick={handleCreateAula}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <PlusIcon />
            <span className="hidden md:inline">Nueva Aula</span>
          </button>
        )}
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Buscador */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <MagnifyingGlassIcon />
              </div>
              <input
                type="text"
                placeholder="Buscar aulas por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filtro de estado */}
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="online">En línea</option>
              <option value="offline">Fuera de línea</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Lista/Grid de aulas */}
      {aulas.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h6m-6 4h6m-6 4h6" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay aulas registradas</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter
              ? 'No se encontraron aulas que coincidan con los filtros aplicados.'
              : 'Comienza creando tu primera aula para gestionar sus dispositivos.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {aulas.map((aula) => (
            <AulaCard
              key={aula.id}
              aula={aula}
              viewMode="list"
              onEdit={() => handleEditAula(aula)}
              onDelete={() => handleDeleteAula(aula.id)}
              onCheckConnectivity={() => handleCheckConnectivity(aula.id)}
              onToggleLights={() => handleToggleLights(aula.id)}
              isAdmin={user?.rol === 'Admin'}
            />
          ))}
        </div>
      )}

      {/* Modal para crear/editar aula */}
      {showModal && (
        <AulaModal
          aula={editingAula}
          onClose={() => setShowModal(false)}
          onSave={handleSaveAula}
        />
      )}
    </div>
  );
};

export default Classrooms;
