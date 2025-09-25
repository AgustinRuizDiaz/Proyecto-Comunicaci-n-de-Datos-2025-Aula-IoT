const Classrooms = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Aulas</h1>
        <button className="btn-primary">Nueva Aula</button>
      </div>
      <div className="card">
        <p className="text-gray-600">Lista de aulas disponibles...</p>
      </div>
    </div>
  )
}

export default Classrooms
