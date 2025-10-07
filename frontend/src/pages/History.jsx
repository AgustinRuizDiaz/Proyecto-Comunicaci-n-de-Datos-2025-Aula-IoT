import { useState, useEffect, useCallback } from 'react'
import { historyService, aulaService, userService } from '../services/api'
import { useRelativeTime } from '../hooks/useRelativeTime'

const History = () => {
  // Estados principales
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingExport, setLoadingExport] = useState(false)

  // Estados para filtros
  const [aulas, setAulas] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [estadisticas, setEstadisticas] = useState(null)
  const [filtrosActivos, setFiltrosActivos] = useState([])
  const [showFilters, setShowFilters] = useState(false)

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Filtros
  const [filters, setFilters] = useState({
    fecha_desde: '',
    fecha_hasta: '',
    aula: '',
    usuario: '',
    tipo_cambio: '',
    fuente: '',
    sensor_tipo: '',
    estado_nuevo: '',
    valor_min: '',
    valor_max: '',
    search: ''
  })

  const { formatRelativeTime } = useRelativeTime()

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData()
    loadHistory()
  }, [])

  // Recargar cuando cambien filtros o página
  useEffect(() => {
    if (currentPage > 1) {
      loadHistory()
    }
  }, [currentPage])

  const loadInitialData = async () => {
    try {
      const [aulasResponse, usuariosResponse] = await Promise.all([
        aulaService.getAll(),
        userService.getAll()
      ])
      setAulas(aulasResponse.data.results || aulasResponse.data)
      setUsuarios(usuariosResponse.data.results || usuariosResponse.data)
    } catch (error) {
      console.error('Error loading initial data:', error)
    }
  }

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true)

      // Construir parámetros para la API
      const params = {
        page: currentPage,
        ...filters,
        // Limpiar parámetros vacíos
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      }

      const response = await historyService.getAll(params)

      if (response.data.results) {
        // Respuesta paginada
        setHistory(response.data.results)
        setTotalPages(Math.ceil(response.data.count / (response.data.page_size || 50)))
        setTotalCount(response.data.count)
      } else {
        // Respuesta simple (sin paginación)
        setHistory(response.data)
        setTotalPages(1)
        setTotalCount(response.data.length)
      }

      // Cargar estadísticas con los mismos filtros
      loadEstadisticas()
    } catch (error) {
      console.error('Error loading history:', error)
      setHistory([])
    } finally {
      setLoading(false)
    }
  }, [currentPage, filters])

  const loadEstadisticas = async () => {
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      )

      const response = await historyService.getEstadisticas(params)
      setEstadisticas(response.data)
    } catch (error) {
      console.error('Error loading estadisticas:', error)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
    setCurrentPage(1) // Resetear página al cambiar filtros
  }

  const applyFilters = () => {
    setCurrentPage(1)
    loadHistory()
    updateActiveFilters()
  }

  const clearFilters = () => {
    setFilters({
      fecha_desde: '',
      fecha_hasta: '',
      aula: '',
      usuario: '',
      tipo_cambio: '',
      fuente: '',
      sensor_tipo: '',
      estado_nuevo: '',
      valor_min: '',
      valor_max: '',
      search: ''
    })
    setFiltrosActivos([])
    setCurrentPage(1)
    loadHistory()
  }

  const updateActiveFilters = () => {
    const activos = []
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '') {
        let label = ''
        switch (key) {
          case 'fecha_desde':
            label = `Desde: ${value}`
            break
          case 'fecha_hasta':
            label = `Hasta: ${value}`
            break
          case 'aula':
            const aula = aulas.find(a => a.id.toString() === value)
            label = `Aula: ${aula?.nombre || value}`
            break
          case 'usuario':
            const usuario = usuarios.find(u => u.id.toString() === value)
            label = `Usuario: ${usuario?.legajo || value}`
            break
          case 'tipo_cambio':
            label = `Tipo: ${value}`
            break
          case 'fuente':
            label = `Fuente: ${value}`
            break
          case 'sensor_tipo':
            label = `Sensor: ${value}`
            break
          case 'estado_nuevo':
            label = `Estado: ${value}`
            break
          case 'valor_min':
            label = `Valor ≥ ${value}`
            break
          case 'valor_max':
            label = `Valor ≤ ${value}`
            break
          case 'search':
            label = `Búsqueda: ${value}`
            break
          default:
            label = `${key}: ${value}`
        }
        activos.push({ key, label, value })
      }
    })
    setFiltrosActivos(activos)
  }

  const removeFilter = (filterKey) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: ''
    }))
    setCurrentPage(1)
    setTimeout(() => {
      loadHistory()
      updateActiveFilters()
    }, 100)
  }

  const exportToCSV = async () => {
    try {
      setLoadingExport(true)

      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      )

      const response = await historyService.exportarCSV(params)

      // Crear blob y descargar
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `historial_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Error exporting CSV:', error)
      alert('Error al exportar el archivo CSV')
    } finally {
      setLoadingExport(false)
    }
  }

  const getTipoIcon = (tipo) => {
    const icons = {
      'estado': '🔄',
      'lectura': '📊',
      'accion': '⚡',
      'alarma': '🚨'
    }
    return icons[tipo] || '📋'
  }

  const getFuenteColor = (fuente) => {
    const colors = {
      'sensor': 'bg-blue-100 text-blue-800',
      'manual': 'bg-green-100 text-green-800',
      'automatico': 'bg-purple-100 text-purple-800'
    }
    return colors[fuente] || 'bg-gray-100 text-gray-800'
  }

  if (loading && currentPage === 1) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Historial de Registros</h1>
          <p className="text-gray-600 mt-1">
            {totalCount} registros encontrados
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>
          <button
            onClick={exportToCSV}
            disabled={loadingExport || history.length === 0}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingExport ? 'Exportando...' : 'Exportar CSV'}
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-blue-600">{estadisticas.total_registros}</div>
            <div className="text-gray-600">Total Registros</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-green-600">
              {estadisticas.registros_por_tipo?.[0]?.count || 0}
            </div>
            <div className="text-gray-600">Tipo Más Frecuente</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-purple-600">
              {estadisticas.registros_por_aula?.length || 0}
            </div>
            <div className="text-gray-600">Aulas Activas</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-orange-600">
              {estadisticas.registros_por_fuente?.[0]?.count || 0}
            </div>
            <div className="text-gray-600">Fuente Principal</div>
          </div>
        </div>
      )}

      {/* Filtros activos */}
      {filtrosActivos.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-gray-700">Filtros activos:</span>
            {filtrosActivos.map(filter => (
              <span
                key={filter.key}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {filter.label}
                <button
                  onClick={() => removeFilter(filter.key)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Limpiar todos
            </button>
          </div>
        </div>
      )}

      {/* Panel de filtros */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros Avanzados</h2>
          <form onSubmit={(e) => { e.preventDefault(); applyFilters(); }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Fechas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha desde</label>
                <input
                  type="date"
                  name="fecha_desde"
                  value={filters.fecha_desde}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha hasta</label>
                <input
                  type="date"
                  name="fecha_hasta"
                  value={filters.fecha_hasta}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Aula */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aula</label>
                <select
                  name="aula"
                  value={filters.aula}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas las aulas</option>
                  {aulas.map(aula => (
                    <option key={aula.id} value={aula.id}>{aula.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Usuario */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                <select
                  name="usuario"
                  value={filters.usuario}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los usuarios</option>
                  {usuarios.map(usuario => (
                    <option key={usuario.id} value={usuario.id}>{usuario.legajo}</option>
                  ))}
                </select>
              </div>

              {/* Tipo de cambio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de cambio</label>
                <select
                  name="tipo_cambio"
                  value={filters.tipo_cambio}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los tipos</option>
                  <option value="estado">Estado</option>
                  <option value="lectura">Lectura</option>
                  <option value="accion">Acción</option>
                  <option value="alarma">Alarma</option>
                </select>
              </div>

              {/* Fuente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fuente</label>
                <select
                  name="fuente"
                  value={filters.fuente}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas las fuentes</option>
                  <option value="sensor">Sensor</option>
                  <option value="manual">Manual</option>
                  <option value="automatico">Automático</option>
                </select>
              </div>

              {/* Tipo de sensor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de sensor</label>
                <input
                  type="text"
                  name="sensor_tipo"
                  value={filters.sensor_tipo}
                  onChange={handleFilterChange}
                  placeholder="Ej: luz, movimiento..."
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Estado nuevo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <input
                  type="text"
                  name="estado_nuevo"
                  value={filters.estado_nuevo}
                  onChange={handleFilterChange}
                  placeholder="Buscar estado..."
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Rango de valores */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor mínimo</label>
                <input
                  type="number"
                  step="0.01"
                  name="valor_min"
                  value={filters.valor_min}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor máximo</label>
                <input
                  type="number"
                  step="0.01"
                  name="valor_max"
                  value={filters.valor_max}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Limpiar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Aplicar Filtros
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de registros */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {history.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay registros</h3>
            <p className="mt-1 text-sm text-gray-500">Ajusta los filtros para ver los datos históricos.</p>
          </div>
        ) : (
          <>
            {/* Tabla para desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha/Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aula
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sensor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado Anterior
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado Nuevo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fuente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {history.map((record, index) => (
                    <tr key={record.id || index} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-medium">
                          {new Date(`${record.fecha}T${record.hora}`).toLocaleDateString('es-ES')}
                        </div>
                        <div className="text-gray-500">
                          {formatRelativeTime(`${record.fecha}T${record.hora}`)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.aula_nombre || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.sensor_tipo || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                          {record.estado_anterior || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          {record.estado_nuevo || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center">
                          <span className="mr-1">{getTipoIcon(record.tipo_cambio)}</span>
                          {record.tipo_cambio || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getFuenteColor(record.fuente)}`}>
                          {record.fuente || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.usuario_legajo || 'Sistema'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.valor_numerico ? `${record.valor_numerico} ${record.unidad || ''}` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vista móvil - Timeline */}
            <div className="md:hidden space-y-4 p-4">
              {history.map((record, index) => (
                <div key={record.id || index} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getTipoIcon(record.tipo_cambio)}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getFuenteColor(record.fuente)}`}>
                        {record.fuente}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(`${record.fecha}T${record.hora}`).toLocaleDateString('es-ES')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatRelativeTime(`${record.fecha}T${record.hora}`)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Aula:</span>
                      <span className="text-sm font-medium">{record.aula_nombre}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Sensor:</span>
                      <span className="text-sm font-medium">{record.sensor_tipo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tipo:</span>
                      <span className="text-sm font-medium">{record.tipo_cambio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Usuario:</span>
                      <span className="text-sm font-medium">{record.usuario_legajo || 'Sistema'}</span>
                    </div>
                    {(record.estado_anterior || record.estado_nuevo) && (
                      <div className="mt-2 space-y-1">
                        {record.estado_anterior && (
                          <div className="flex justify-between text-xs">
                            <span className="text-red-600">Anterior:</span>
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                              {record.estado_anterior}
                            </span>
                          </div>
                        )}
                        {record.estado_nuevo && (
                          <div className="flex justify-between text-xs">
                            <span className="text-green-600">Nuevo:</span>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                              {record.estado_nuevo}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    {record.valor_numerico && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Valor:</span>
                        <span className="font-medium">
                          {record.valor_numerico} {record.unidad || ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Anterior
          </button>

          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 border rounded ${
                    pageNum === currentPage
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}

export default History
