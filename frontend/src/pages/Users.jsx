import React, { useState, useEffect, useMemo } from 'react';
import { userService } from '../services/api';
import RoleBasedAccess, { AdminOnly } from '../components/RoleBasedAccess';
import { useAuth } from '../contexts/AuthContext';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    rol: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    legajo: '',
    nombre: '',
    apellido: '',
    password: '',
    confirmPassword: '',
    rol: 'Operario'
  });
  const [formErrors, setFormErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Get auth context for debugging
  const { user, isAuthenticated, isAdmin } = useAuth();

  // Load users with filters and pagination
  const loadUsers = async (page = 1, search = searchTerm, filterParams = filters) => {
    try {
      setLoading(true);

      const params = {
        page,
        search,
        ...filterParams
      };

      const response = await userService.getAll(params);
      setUsers(response.data.results || response.data);
      setPagination({
        count: response.data.count || response.data.length,
        next: response.data.next,
        previous: response.data.previous,
        current: page,
        total_pages: Math.ceil((response.data.count || response.data.length) / 10)
      });
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== undefined) {
        loadUsers(1, searchTerm, filters);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filters]);

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.legajo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.legajo.trim()) {
      errors.legajo = 'El legajo es requerido';
    } else if (!/^[a-zA-Z0-9]{3,20}$/.test(formData.legajo)) {
      errors.legajo = 'El legajo debe tener entre 3 y 20 caracteres alfanuméricos';
    }

    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido';
    }

    if (!formData.lastname.trim()) {
      errors.lastname = 'El apellido es requerido';
    }

    if (!editingUser) { // Only for new users
      if (!formData.password) {
        errors.password = 'La contraseña es requerida';
      } else if (formData.password.length < 8) {
        errors.password = 'La contraseña debe tener al menos 8 caracteres';
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = 'La confirmación de contraseña es requerida';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden';
      }
    } else { // For editing users
      if (formData.password && formData.password.length < 8) {
        errors.password = 'La contraseña debe tener al menos 8 caracteres';
      }
      if (formData.password && formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    if (!formData.rol) {
      errors.rol = 'El rol es requerido';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const submitData = { ...formData };

      if (editingUser) {
        await userService.update(editingUser.id, submitData);
      } else {
        await userService.create(submitData);
      }

      setShowCreateModal(false);
      setEditingUser(null);
      resetForm();
      loadUsers(currentPage);

    } catch (error) {
      console.error('Error saving user:', error);
      if (error.response?.data) {
        setFormErrors(error.response.data);
      }
    }
  };

  // Handle edit user
  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      legajo: user.legajo,
      nombre: user.nombre || '',
      apellido: user.apellido || '',
      password: '',
      confirmPassword: '',
      rol: user.rol
    });
    setFormErrors({});
    setShowCreateModal(true);
  };

  // Handle delete user
  const handleDelete = async (userId) => {
    try {
      await userService.delete(userId);
      setDeleteConfirm(null);
      loadUsers(currentPage);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error eliminando usuario: ' + (error.response?.data?.detail || 'Error desconocido'));
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      legajo: '',
      nombre: '',
      apellido: '',
      password: '',
      confirmPassword: '',
      rol: 'Operario'
    });
    setFormErrors({});
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    loadUsers(newPage, searchTerm, filters);
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    loadUsers(1, searchTerm, newFilters);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-gray-600 mt-1">Administra usuarios del sistema</p>
          </div>
          <AdminOnly>
            <button
              onClick={() => {
                setEditingUser(null);
                resetForm();
                setShowCreateModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="hidden md:inline">Nuevo Usuario</span>
            </button>
          </AdminOnly>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar por Legajo
              </label>
              <input
                type="text"
                placeholder="Escribe para buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
              <select
                value={filters.rol}
                onChange={(e) => handleFilterChange('rol', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los roles</option>
                <option value="Admin">Administrador</option>
                <option value="Operario">Operario</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table/Card Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.legajo.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.nombre} {user.apellido}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.legajo}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.rol === 'Admin'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.rol === 'Admin' ? '👑 Admin' : '👤 Operario'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-gray-700">
                          {user.legajo.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{user.nombre} {user.apellido}</h3>
                        <p className="text-xs text-gray-500">
                          {user.legajo}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.rol === 'Admin'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.rol === 'Admin' ? '👑 Admin' : '👤 Operario'}
                      </span>
                    </div>
                  </div>
                  <AdminOnly>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(user)}
                        className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  </AdminOnly>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="mt-6 flex justify-center">
                <div className="flex space-x-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.previous}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>

                  {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 border rounded-md text-sm font-medium ${
                        page === currentPage
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.next}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredUsers.length === 0 && !loading && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron usuarios</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || Object.values(filters).some(v => v)
                    ? 'Ajusta los filtros o términos de búsqueda.'
                    : 'Crea el primer usuario para comenzar.'}
                </p>
              </div>
            )}
          </>
        )}

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-2 mx-auto p-3 border w-11/12 max-w-sm shadow-lg rounded-md bg-white sm:top-20 sm:p-5 sm:w-96 sm:max-w-md">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Legajo *
                    </label>
                    <input
                      type="text"
                      name="legajo"
                      value={formData.legajo}
                      onChange={handleInputChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.legajo ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ej: admin123"
                      disabled={editingUser} // Can't change legajo when editing
                    />
                    {formErrors.legajo && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.legajo}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.nombre ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nombre del usuario"
                    />
                    {formErrors.nombre && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.nombre}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleInputChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.apellido ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Apellido del usuario"
                    />
                    {formErrors.apellido && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.apellido}</p>
                    )}
                  </div>

                  {!editingUser && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contraseña *
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors.password ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Mínimo 8 caracteres"
                        />
                        {formErrors.password && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirmar Contraseña *
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                        )}
                      </div>
                    </>
                  )}

                  {editingUser && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nueva Contraseña (opcional)
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors.password ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Dejar vacío para mantener actual"
                        />
                        {formErrors.password && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirmar Nueva Contraseña
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                        )}
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rol *
                    </label>
                    <select
                      name="rol"
                      value={formData.rol}
                      onChange={handleInputChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.rol ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="Operario">Operario</option>
                      <option value="Admin">Administrador</option>
                    </select>
                    {formErrors.rol && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.rol}</p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setEditingUser(null);
                        resetForm();
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                      {editingUser ? 'Actualizar' : 'Crear'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mt-4">Eliminar Usuario</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    ¿Estás seguro de que quieres eliminar al usuario <strong>{deleteConfirm.legajo}</strong>?
                    Esta acción no se puede deshacer.
                  </p>
                </div>
                <div className="flex justify-center space-x-3 mt-4">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm.id)}
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
    </div>
  );
};

export default Users;
