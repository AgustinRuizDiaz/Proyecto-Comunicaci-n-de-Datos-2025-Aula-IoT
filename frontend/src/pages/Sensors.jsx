import { useState, useEffect } from 'react'
import { sensorService } from '../services/api'

const Sensors = () => {
  const [sensors, setSensors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSensors()
  }, [])

  const loadSensors = async () => {
    try {
      const response = await sensorService.getAll()
      setSensors(response.data)
    } catch (error) {
      console.error('Error loading sensors:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Sensores IoT</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
          Nuevo Sensor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sensors.map((sensor) => (
          <div key={sensor.id} className="sensor-card">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{sensor.name}</h3>
              <div className="flex items-center space-x-2">
                <span className={`status-indicator ${sensor.status === 'active' ? 'status-online' : 'status-offline'}`}></span>
                <span className="text-sm text-gray-500 capitalize">{sensor.status}</span>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Tipo:</span> {sensor.sensor_type}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Aula:</span> {sensor.classroom_name || 'Sin asignar'}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Última lectura:</span> {sensor.last_reading ? new Date(sensor.last_reading).toLocaleString() : 'N/A'}
              </p>
            </div>
            
            <div className="flex justify-between items-center">
              <button className="text-blue-600 hover:text-blue-800 text-sm">Ver datos</button>
              <button className="text-gray-600 hover:text-gray-800 text-sm">Configurar</button>
            </div>
          </div>
        ))}
      </div>

      {sensors.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay sensores</h3>
          <p className="mt-1 text-sm text-gray-500">Comienza configurando tus primeros sensores IoT.</p>
        </div>
      )}
    </div>
  )
}

export default Sensors
