import { useAuth } from '../hooks/useAuth'

const Dashboard = () => {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido, {user?.first_name}!
        </h1>
        <p className="text-gray-600">
          Dashboard del Sistema de Gestión de Aulas IoT
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Cards de estadísticas */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900">Aulas Totales</h3>
          <p className="text-3xl font-bold text-primary-600">12</p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900">Sensores Activos</h3>
          <p className="text-3xl font-bold text-green-600">48</p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900">Alertas</h3>
          <p className="text-3xl font-bold text-red-600">3</p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900">Uptime</h3>
          <p className="text-3xl font-bold text-blue-600">99.9%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Estado de Aulas
          </h3>
          <p className="text-gray-600">
            Información sobre el estado actual de las aulas...
          </p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Actividad Reciente
          </h3>
          <p className="text-gray-600">
            Eventos recientes del sistema...
          </p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
