const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'API del Sistema de Gestión de Usuarios',
    version: '1.0.0',
    status: 'activo'
  });
});

// Rutas de autenticación (acepta cualquier usuario)
app.post('/auth/login', (req, res) => {
  try {
    const { legajo, password } = req.body;

    // Crear respuesta basada en el usuario
    const usuario = {
      id: legajo === 'ADMIN001' ? 1 : (legajo === 'OP001' ? 2 : 3),
      legajo: legajo,
      nombre: legajo === 'ADMIN001' ? 'Administrador' : (legajo === 'OP001' ? 'Operario' : 'María'),
      apellido: 'Sistema',
      rol: legajo === 'ADMIN001' ? 'administrador' : 'operario'
    };

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        usuario: usuario,
        token: `fake-jwt-token-${legajo.toLowerCase()}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Ruta de usuarios
app.get('/usuarios', (req, res) => {
  // Datos de usuarios hardcodeados para desarrollo
  const usuarios = [
    {
      id: 1,
      legajo: 'ADMIN001',
      nombre: 'Administrador',
      apellido: 'Sistema',
      rol: 'administrador'
    },
    {
      id: 2,
      legajo: 'OP001',
      nombre: 'Operario',
      apellido: 'Ejemplo',
      rol: 'operario'
    },
    {
      id: 3,
      legajo: 'OP002',
      nombre: 'María',
      apellido: 'González',
      rol: 'operario'
    },
    {
      id: 4,
      legajo: 'OP003',
      nombre: 'Carlos',
      apellido: 'Rodríguez',
      rol: 'operario'
    },
    {
      id: 5,
      legajo: 'ADMIN002',
      nombre: 'Ana',
      apellido: 'Martínez',
      rol: 'administrador'
    }
  ];

  console.log('📊 Enviando usuarios:', usuarios.length);

  res.json({
    success: true,
    data: usuarios,
    results: usuarios,
    count: usuarios.length,
    total_pages: 1,
    current: 1
  });
});

// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `La ruta ${req.originalUrl} no existe`
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
