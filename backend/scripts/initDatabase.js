const db = require('../database');
const bcrypt = require('bcryptjs');

async function initializeDatabase() {
  try {
    console.log('🔧 Inicializando base de datos...');

    // Conectar a la base de datos
    await db.connect();

    // Inicializar tablas
    await db.initialize();

    // Insertar datos de ejemplo si es necesario
    await insertSampleData();

    console.log('✅ Base de datos inicializada correctamente');
  } catch (error) {
    console.error('❌ Error inicializando la base de datos:', error.message);
    process.exit(1);
  } finally {
    // Cerrar conexión
    await db.disconnect();
    process.exit(0);
  }
}

async function insertSampleData() {
  try {
    // Verificar si ya existen usuarios
    const existingUsers = await db.get('SELECT COUNT(*) as count FROM usuarios');

    if (existingUsers.count > 0) {
      console.log('📋 Ya existen usuarios en la base de datos, omitiendo datos de ejemplo');
      return;
    }

    console.log('📝 Insertando datos de ejemplo...');

    // Crear usuario administrador por defecto
    const saltRounds = 10;
    const adminPassword = await bcrypt.hash('admin123', saltRounds);

    await db.run(`
      INSERT INTO usuarios (legajo, nombre, apellido, password_hash, rol)
      VALUES (?, ?, ?, ?, ?)
    `, ['ADMIN001', 'Administrador', 'Sistema', adminPassword, 'administrador']);

    // Crear usuario operario por defecto
    const operarioPassword = await bcrypt.hash('operario123', saltRounds);

    await db.run(`
      INSERT INTO usuarios (legajo, nombre, apellido, password_hash, rol)
      VALUES (?, ?, ?, ?, ?)
    `, ['OP001', 'Operario', 'Ejemplo', operarioPassword, 'operario']);

    console.log('👥 Usuarios de ejemplo creados:');
    console.log('   - Administrador: ADMIN001 / admin123');
    console.log('   - Operario: OP001 / operario123');

  } catch (error) {
    console.error('❌ Error insertando datos de ejemplo:', error.message);
    throw error;
  }
}

// Ejecutar inicialización si se ejecuta directamente
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;
