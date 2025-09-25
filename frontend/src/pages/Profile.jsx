import { useAuth } from '../hooks/useAuth'

const Profile = () => {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Perfil de Usuario</h1>
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Información Personal
        </h3>
        <div className="space-y-4">
          <div>
            <label className="label">Nombre</label>
            <p className="text-gray-900">{user?.first_name} {user?.last_name}</p>
          </div>
          <div>
            <label className="label">Correo Electrónico</label>
            <p className="text-gray-900">{user?.email}</p>
          </div>
          <div>
            <label className="label">Rol</label>
            <p className="text-gray-900 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
