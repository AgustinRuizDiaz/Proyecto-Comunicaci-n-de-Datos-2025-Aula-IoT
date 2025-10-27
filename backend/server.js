const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Importar y conectar base de datos
const db = require('./database');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3003;

// Inicializar base de datos antes de iniciar el servidor
async function initializeServer() {
  try {
    console.log('🔧 Inicializando servidor...');

    // Conectar a la base de datos
    await db.connect();
    console.log('✅ Base de datos conectada');

    // Inicializar tablas si no existen
    await db.initialize();
    console.log('✅ Tablas inicializadas');

    // Configurar middlewares y rutas después de la inicialización
    app.use(cors());
    app.use(express.json());

    // Hacer Socket.IO accesible en todas las rutas
    app.set('socketio', io);

    // Importar rutas modulares
    const usuarioRoutes = require('./routes/usuarios');
    const authRoutes = require('./routes/auth');
    const aulaRoutes = require('./routes/aulas');
    const sensorRoutes = require('./routes/sensores');
    const esp32Routes = require('./routes/esp32');
    const registroRoutes = require('./routes/registros');

    // Usar rutas modulares
    app.use('/usuarios', usuarioRoutes);
    app.use('/auth', authRoutes);
    app.use('/aulas', aulaRoutes);
    app.use('/sensores', sensorRoutes);
    app.use('/esp32', esp32Routes); // Rutas para ESP32 (sin autenticación)
    app.use('/api/registros', registroRoutes); // Rutas para registros (con autenticación)

    // Socket.IO connection handling
    io.on('connection', (socket) => {
      console.log('✅ Nuevo cliente conectado:', socket.id);

      // Manejar identificación de ESP32
      socket.on('esp32:identify', (data) => {
        const { ip } = data;
        console.log(`🔌 ESP32 identificado: ${ip} (socket: ${socket.id})`);
        
        // Unirse a una sala específica para este ESP32
        socket.join(`esp32:${ip}`);
        console.log(`  ✅ ESP32 ${ip} unido a sala: esp32:${ip}`);
        
        // Confirmar identificación
        socket.emit('esp32:identified', { ip, socketId: socket.id });
      });

      socket.on('disconnect', () => {
        console.log('❌ Cliente desconectado:', socket.id);
      });

      socket.on('user_action', (data) => {
        console.log('📡 Acción de usuario recibida:', data);
      });
    });

    // Ruta raíz
    app.get('/', (req, res) => {
      res.json({
        message: 'API del Sistema de Gestión de Usuarios',
        version: '1.0.0',
        status: 'activo',
        socketio: 'habilitado',
        database: 'conectada'
      });
    });

    // Middleware de manejo de errores 404 - debe estar al final
    app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Ruta no encontrada',
        message: `La ruta ${req.originalUrl} no existe`,
        disponibles: {
          usuarios: 'GET, POST, PUT, DELETE /usuarios',
          auth: 'POST /auth/login, POST /auth/register',
          aulas: 'GET, POST, PUT, DELETE /aulas'
        }
      });
    });

    // Iniciar servidor con Socket.IO en todas las interfaces de red
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`🌐 Accesible desde la red en http://192.168.0.11:${PORT}`);
      console.log(`🔌 Socket.IO habilitado en ws://localhost:${PORT}`);
      console.log(`📋 Rutas disponibles:`);
      console.log(`   GET, POST, PUT, DELETE /usuarios`);
      console.log(`   POST /auth/login`);
      console.log(`   POST /auth/register`);
      console.log(`   GET, POST, PUT, DELETE /aulas`);
    });

  } catch (error) {
    console.error('❌ Error inicializando servidor:', error.message);
    process.exit(1);
  }
}

// Inicializar servidor
initializeServer();

module.exports = app;
