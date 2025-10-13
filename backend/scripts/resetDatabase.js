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

    // Insertar aulas de ejemplo (todas offline y con sensores apagados por defecto)
    console.log('📝 Insertando aulas de ejemplo...');

    await db.run(`
      INSERT INTO aulas (nombre, ip, ultima_senal, luces_encendidas, ventanas_abiertas, personas_detectadas)
      VALUES (?, ?, ?, ?, ?, ?)
    `, ['Aula 101', '192.168.1.101', null, 0, 0, 0]);

    await db.run(`
      INSERT INTO aulas (nombre, ip, ultima_senal, luces_encendidas, ventanas_abiertas, personas_detectadas)
      VALUES (?, ?, ?, ?, ?, ?)
    `, ['Laboratorio A', '192.168.1.102', null, 0, 0, 0]);

    await db.run(`
      INSERT INTO aulas (nombre, ip, ultima_senal, luces_encendidas, ventanas_abiertas, personas_detectadas)
      VALUES (?, ?, ?, ?, ?, ?)
    `, ['Aula 203', '192.168.1.103', null, 0, 0, 0]);

    await db.run(`
      INSERT INTO aulas (nombre, ip, ultima_senal, luces_encendidas, ventanas_abiertas, personas_detectadas)
      VALUES (?, ?, ?, ?, ?, ?)
    `, ['Aula 304', '192.168.1.104', null, 0, 0, 0]);

    await db.run(`
      INSERT INTO aulas (nombre, ip, ultima_senal, luces_encendidas, ventanas_abiertas, personas_detectadas)
      VALUES (?, ?, ?, ?, ?, ?)
    `, ['Laboratorio B', '192.168.1.105', null, 0, 0, 0]);

    console.log('✅ Base de datos reiniciada correctamente');
    console.log('👥 Usuarios de ejemplo creados:');
    console.log('   - Administrador: ADMIN001 / admin123');
    console.log('   - Operario: OP001 / operario123');
    console.log('🏫 Aulas de ejemplo creadas (todas offline y apagadas):');
    console.log('   - Aula 101');
    console.log('   - Laboratorio A');
    console.log('   - Aula 203');
    console.log('   - Aula 304');
    console.log('   - Laboratorio B');

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
