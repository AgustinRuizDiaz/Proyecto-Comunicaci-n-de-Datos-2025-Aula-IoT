const { Server } = require("socket.io");

const io = new Server(3001, {
  cors: {
    origin: "*", // permite conexiones desde cualquier origen
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  // Ejemplo: escuchar mensajes del cliente
  socket.on("mensaje", (data) => {
    console.log("Mensaje recibido:", data);
    socket.emit("respuesta", "Mensaje recibido correctamente");
  });
});

console.log("🚀 Servidor socket.io escuchando en puerto 3001");

// Mantener el servidor corriendo
process.stdin.resume();
