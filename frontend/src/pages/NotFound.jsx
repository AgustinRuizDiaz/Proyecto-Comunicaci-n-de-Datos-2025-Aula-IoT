import { Link } from 'react-router-dom'
import { FiHome } from 'react-icons/fi'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Página no encontrada
        </h2>
        <p className="text-gray-600 mb-8">
          La página que estás buscando no existe o ha sido movida.
        </p>
        <Link
          to="/"
          className="btn-primary inline-flex items-center"
        >
          <FiHome className="mr-2" size={16} />
          Volver al Inicio
        </Link>
      </div>
    </div>
  )
}

export default NotFound
