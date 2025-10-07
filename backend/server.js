const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

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
  res.json({
    success: true,
    data: [
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
      }
    ],
    count: 3
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
