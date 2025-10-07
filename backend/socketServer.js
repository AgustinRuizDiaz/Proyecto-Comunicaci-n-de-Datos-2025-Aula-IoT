const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = createServer(app);

// Configurar CORS para Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Frontend URL
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware básico
app.use(cors({
  origin: "http://localhost:5173",
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

    // Aquí puedes procesar el comando y enviarlo al dispositivo correspondiente
    // Por ahora, solo emitimos una respuesta de confirmación

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

// Endpoint básico para verificar que el servidor está corriendo
app.get('/', (req, res) => {
  res.json({
    message: 'Servidor Socket.IO corriendo',
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Servidor Socket.IO corriendo en puerto ${PORT}`);
  console.log(`📡 WebSocket disponible en ws://localhost:${PORT}`);
});

module.exports = { app, server, io };
