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

    // Insertar aulas de ejemplo
    console.log('📝 Insertando aulas de ejemplo...');

    await db.run(`
      INSERT INTO aulas (nombre, ip, ultima_senal)
      VALUES (?, ?, ?)
    `, ['Aula 101', '192.168.1.101', new Date().toISOString()]);

    await db.run(`
      INSERT INTO aulas (nombre, ip, ultima_senal)
      VALUES (?, ?, ?)
    `, ['Laboratorio A', '192.168.1.102', null]);

    await db.run(`
      INSERT INTO aulas (nombre, ip)
      VALUES (?, ?)
    `, ['Aula 203', '192.168.1.103']);

    // Crear aula online (señal reciente)
    await db.run(`
      INSERT INTO aulas (nombre, ip, ultima_senal)
      VALUES (?, ?, ?)
    `, ['Aula 304', '192.168.1.104', new Date().toISOString()]);

    // Crear aula offline (sin señal)
    await db.run(`
      INSERT INTO aulas (nombre, ip)
      VALUES (?, ?)
    `, ['Laboratorio B', '192.168.1.105']);

    console.log('✅ Base de datos reiniciada correctamente');
    console.log('👥 Usuarios de ejemplo creados:');
    console.log('   - Administrador: ADMIN001 / admin123');
    console.log('   - Operario: OP001 / operario123');
    console.log('🏫 Aulas de ejemplo creadas:');
    console.log('   - Aula 101 (online)');
    console.log('   - Laboratorio A (offline)');
    console.log('   - Aula 203 (offline)');
    console.log('   - Aula 304 (online)');
    console.log('   - Laboratorio B (offline)');

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
