const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Registrarse
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Crear nueva cuenta
          </p>
        </div>
        <form className="mt-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="label">
                Nombre
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                className="input"
                placeholder="Nombre"
              />
            </div>
            <div>
              <label htmlFor="last_name" className="label">
                Apellido
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                required
                className="input"
                placeholder="Apellido"
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="label">
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="input"
              placeholder="correo@universidad.edu"
            />
          </div>
          <div>
            <label htmlFor="password" className="label">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="input"
              placeholder="••••••••"
            />
          </div>
          <div>
            <button
              type="submit"
              className="btn-primary w-full"
            >
              Registrarse
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
