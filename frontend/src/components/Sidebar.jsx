import { Link, useLocation } from 'react-router-dom'
import {
  FiHome,
  FiUsers,
  FiMapPin,
  FiActivity,
  FiBarChart3,
  FiSettings,
  FiX
} from 'react-icons/fi'

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()

  const menuItems = [
    {
      path: '/',
      name: 'Dashboard',
      icon: FiHome,
    },
    {
      path: '/classrooms',
      name: 'Aulas',
      icon: FiMapPin,
    },
    {
      path: '/sensors',
      name: 'Sensores',
      icon: FiActivity,
    },
    {
      path: '/history',
      name: 'Historial',
      icon: FiBarChart3,
    },
    {
      path: '/users',
      name: 'Usuarios',
      icon: FiUsers,
    },
    {
      path: '/settings',
      name: 'Configuración',
      icon: FiSettings,
    },
  ]

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <FiActivity className="text-white" size={20} />
              </div>
              <span className="text-lg font-semibold text-gray-900">
                IoT Manager
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200
                    ${active
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              © 2025 Gestor de Aulas IoT
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
