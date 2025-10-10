const db = require('../database');
const bcrypt = require('bcryptjs');

async function resetDatabase() {
  try {
    console.log('🔧 Reiniciando base de datos...');

    // Conectar a la base de datos
    await db.connect();

    // Limpiar y recrear tablas
    await db.cleanAndRecreate();

    // Insertar datos de ejemplo
    console.log('📝 Insertando usuarios de ejemplo...');

    // Crear usuario administrador
    const saltRounds = 10;
    const adminPassword = await bcrypt.hash('admin123', saltRounds);

    await db.run(`
      INSERT INTO usuarios (legajo, nombre, apellido, password_hash, rol)
      VALUES (?, ?, ?, ?, ?)
    `, ['ADMIN001', 'Administrador', 'Sistema', adminPassword, 'administrador']);

    // Crear usuario operario
    const operarioPassword = await bcrypt.hash('operario123', saltRounds);

    await db.run(`
      INSERT INTO usuarios (legajo, nombre, apellido, password_hash, rol)
      VALUES (?, ?, ?, ?, ?)
    `, ['OP001', 'Operario', 'Ejemplo', operarioPassword, 'operario']);

    console.log('✅ Base de datos reiniciada correctamente');
    console.log('👥 Usuarios de ejemplo creados:');
    console.log('   - Administrador: ADMIN001 / admin123');
    console.log('   - Operario: OP001 / operario123');

  } catch (error) {
    console.error('❌ Error reiniciando la base de datos:', error.message);
    process.exit(1);
  } finally {
    // Cerrar conexión
    await db.disconnect();
    process.exit(0);
  }
}

// Ejecutar reset
resetDatabase();
