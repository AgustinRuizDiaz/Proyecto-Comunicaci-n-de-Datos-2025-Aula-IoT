const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = createServer(app);
const PORT = 3001;

// Configurar CORS para Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5176",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middlewares básicos
app.use(cors({
  origin: "http://localhost:5176",
  credentials: true
}));
app.use(express.json());

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔗 Usuario conectado:', socket.id);

  // Unirse a una sala específica de aula
  socket.on('join_aula', (data) => {
    const { aulaId } = data;
    socket.join(`aula_${aulaId}`);
    console.log(`📍 Usuario ${socket.id} se unió a aula ${aulaId}`);

    // Enviar confirmación al cliente
    socket.emit('joined_aula', { aulaId, message: 'Conectado al aula' });
  });

  // Salir de una sala específica de aula
  socket.on('leave_aula', (data) => {
    const { aulaId } = data;
    socket.leave(`aula_${aulaId}`);
    console.log(`📍 Usuario ${socket.id} salió de aula ${aulaId}`);
  });

  // Manejar comandos de sensores
  socket.on('sensor_command', (data) => {
    console.log('📡 Comando recibido:', data);

    // Emitir el comando a todos los clientes conectados a esa aula específica
    io.to(`aula_${data.aula_id}`).emit('sensor_command', data);

    // Responder confirmación al emisor
    socket.emit('command_executed', {
      command_id: data.sensor_id,
      status: 'executed',
      timestamp: new Date().toISOString()
    });
  });

  // Manejar heartbeat del cliente
  socket.on('heartbeat', (data) => {
    socket.emit('heartbeat_response', {
      timestamp: new Date().toISOString(),
      server_time: Date.now()
    });
  });

  // Desconexión
  socket.on('disconnect', (reason) => {
    console.log('🔌 Usuario desconectado:', socket.id, 'Razón:', reason);
  });
});

// Rutas básicas
app.get('/', (req, res) => {
  res.json({
    message: 'Servidor Express + Socket.IO corriendo',
    version: '1.0.0',
    status: 'activo',
    websocket: 'enabled',
    socketio: true
  });
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📡 WebSocket disponible en ws://localhost:${PORT}`);
  console.log(`📚 API HTTP: http://localhost:${PORT}`);
});

module.exports = { app, server, io };
