import { useState, useEffect } from 'react'

const ConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('checking')
  const [error, setError] = useState(null)

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('🔍 Probando conexión directa...')
        const response = await fetch('http://127.0.0.1:8000/api/status/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          console.log('✅ Conexión exitosa:', data)
          setConnectionStatus('connected')
          setError(null)
        } else {
          console.log('❌ Error de respuesta:', response.status)
          setConnectionStatus('error')
          setError(`Error ${response.status}: ${response.statusText}`)
        }
      } catch (err) {
        console.log('❌ Error de conexión:', err)
        setConnectionStatus('error')
        setError(err.message)
      }
    }

    testConnection()
  }, [])

  if (connectionStatus === 'checking') {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
        <p>Verificando conexión...</p>
      </div>
    )
  }

  if (connectionStatus === 'error') {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <p><strong>Error de conexión:</strong> {error}</p>
        <p className="mt-2">El servidor podría no estar funcionando correctamente.</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
      <p><strong>✅ Conexión exitosa</strong></p>
      <p>El servidor está respondiendo correctamente.</p>
    </div>
  )
}

export default ConnectionTest
