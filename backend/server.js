const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3002;

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('✅ Nuevo cliente conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Cliente desconectado:', socket.id);
  });

  // Manejar eventos personalizados aquí si es necesario
  socket.on('user_action', (data) => {
    console.log('📡 Acción de usuario recibida:', data);
    // Puedes emitir eventos a otros clientes aquí si es necesario
  });
});

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'API del Sistema de Gestión de Usuarios',
    version: '1.0.0',
    status: 'activo',
    socketio: 'habilitado'
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

// Ruta de usuarios - GET
app.get('/usuarios', (req, res) => {
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

// Ruta para crear usuarios - POST
app.post('/usuarios', (req, res) => {
  try {
    const { legajo, nombre, apellido, password, rol } = req.body;

    // Validación básica
    if (!legajo || !nombre || !apellido || !rol) {
      return res.status(400).json({
        success: false,
        error: 'Campos requeridos faltantes',
        message: 'Legajo, nombre, apellido y rol son requeridos'
      });
    }

    // Crear nuevo usuario
    const newUser = {
      id: Date.now(), // ID único basado en timestamp
      legajo,
      nombre,
      apellido,
      rol: rol.toLowerCase()
    };

    console.log('✅ Usuario creado:', newUser);

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: newUser
    });
  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Ruta para actualizar usuarios - PUT
app.put('/usuarios/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { legajo, nombre, apellido, password, rol } = req.body;

    // Validación básica
    if (!nombre || !apellido || !rol) {
      return res.status(400).json({
        success: false,
        error: 'Campos requeridos faltantes',
        message: 'Nombre, apellido y rol son requeridos'
      });
    }

    // Crear usuario actualizado
    const updatedUser = {
      id: parseInt(id),
      legajo,
      nombre,
      apellido,
      rol: rol.toLowerCase()
    };

    console.log('✅ Usuario actualizado:', updatedUser);

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Ruta para eliminar usuarios - DELETE
app.delete('/usuarios/:id', (req, res) => {
  try {
    const { id } = req.params;

    const userIndex = usuarios.findIndex(user => user.id === parseInt(id));

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
        message: `El usuario con ID ${id} no existe`
      });
    }

    // En una aplicación real, aquí eliminarías de la base de datos
    // Por ahora, simulamos la eliminación
    console.log(`🗑️ Usuario ${id} eliminado exitosamente`);

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Manejo de errores 404 - debe estar al final
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `La ruta ${req.originalUrl} no existe`
  });
});

// Iniciar servidor con Socket.IO
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`🔌 Socket.IO habilitado en ws://localhost:${PORT}`);
});

module.exports = app;
