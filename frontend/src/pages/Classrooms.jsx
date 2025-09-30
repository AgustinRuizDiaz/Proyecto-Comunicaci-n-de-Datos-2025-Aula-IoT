import { useState, useEffect } from 'react'
import { classroomService } from '../services/api'

const Classrooms = () => {
  const [classrooms, setClassrooms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadClassrooms()
  }, [])

  const loadClassrooms = async () => {
    try {
      const response = await classroomService.getAll()
      setClassrooms(response.data)
    } catch (error) {
      console.error('Error loading classrooms:', error)
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
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Aulas</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
          Nueva Aula
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classrooms.map((classroom) => (
          <div key={classroom.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{classroom.name}</h3>
              <span className={`px-2 py-1 rounded text-sm ${
                classroom.status === 'available' ? 'bg-green-100 text-green-800' :
                classroom.status === 'occupied' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {classroom.status === 'available' ? 'Disponible' :
                 classroom.status === 'occupied' ? 'Ocupada' : 'Mantenimiento'}
              </span>
            </div>
            
            <p className="text-gray-600 mb-2">Capacidad: {classroom.capacity} personas</p>
            <p className="text-gray-600 mb-4">Ubicación: {classroom.location}</p>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {classroom.sensors_count || 0} sensores
              </span>
              <div className="space-x-2">
                <button className="text-blue-600 hover:text-blue-800">Ver</button>
                <button className="text-gray-600 hover:text-gray-800">Editar</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {classrooms.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay aulas</h3>
          <p className="mt-1 text-sm text-gray-500">Comienza creando tu primera aula.</p>
        </div>
      )}
    </div>
  )
}

export default Classrooms
