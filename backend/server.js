const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas básicas
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido al API del Sistema de Gestión de Aulas IoT',
    version: '1.0.0',
    status: 'activo'
  });
});

// Rutas de la API
app.use('/api/aulas', require('./routes/aulas'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/usuarios', require('./middleware/auth').authenticateToken, require('./middleware/auth').requireAdmin, require('./routes/usuarios'));

// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `La ruta ${req.originalUrl} no existe`
  });
});

// Middleware de manejo de errores
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo salió mal'
  });
});

// Conectar a la base de datos e inicializar
async function startServer() {
  try {
    await db.connect();
    await db.initialize();
    console.log('✅ Base de datos lista');
  } catch (error) {
    console.error('❌ Error inicializando la base de datos:', error.message);
    process.exit(1);
  }
}

// Iniciar servidor
async function main() {
  await startServer();

  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📚 Documentación API: http://localhost:${PORT}`);
  });
}

// Manejar cierre graceful del servidor
process.on('SIGINT', async () => {
  console.log('\n🔄 Cerrando servidor...');
  await db.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Cerrando servidor...');
  await db.disconnect();
  process.exit(0);
});

main();
