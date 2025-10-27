/**
 * Script de migración para agregar la tabla 'registros' a una base de datos existente
 * 
 * Uso:
 *   node scripts/migrateRegistros.js
 * 
 * Este script:
 * 1. Verifica si la tabla 'registros' ya existe
 * 2. Si no existe, la crea con la estructura correcta
 * 3. Mantiene todos los datos existentes en otras tablas
 */

const db = require('../database');

async function migrateRegistros() {
  try {
    console.log('🔧 Iniciando migración de tabla registros...\n');

    // Conectar a la base de datos
    await db.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Verificar si la tabla ya existe
    const tableExists = await db.get(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='registros'`
    );

    if (tableExists) {
      console.log('⚠️  La tabla "registros" ya existe en la base de datos');
      console.log('   No es necesario ejecutar la migración\n');
      
      // Mostrar información de la tabla
      const count = await db.get('SELECT COUNT(*) as total FROM registros');
      console.log(`   📊 Registros actuales: ${count.total}\n`);
      
      process.exit(0);
    }

    console.log('📝 La tabla "registros" no existe, procediendo a crearla...\n');

    // Crear tabla de registros
    await db.run(`
      CREATE TABLE registros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_sensor INTEGER NOT NULL,
        tipo_actuador TEXT NOT NULL CHECK (tipo_actuador IN ('usuario', 'inactividad', 'externo')),
        id_usuario INTEGER,
        fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
        estado INTEGER NOT NULL,
        FOREIGN KEY (id_sensor) REFERENCES sensores(id) ON DELETE CASCADE,
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE SET NULL
      )
    `);

    console.log('✅ Tabla "registros" creada exitosamente\n');

    // Verificar estructura de la tabla
    const tableInfo = await db.all('PRAGMA table_info(registros)');
    console.log('📋 Estructura de la tabla:');
    console.table(tableInfo.map(col => ({
      Campo: col.name,
      Tipo: col.type,
      'No Null': col.notnull ? 'Sí' : 'No',
      'Valor por defecto': col.dflt_value || 'NULL'
    })));

    console.log('\n✅ Migración completada exitosamente');
    console.log('\n📌 La tabla "registros" está lista para usar');
    console.log('   Los registros se crearán automáticamente cuando:');
    console.log('   - Un usuario cambie el estado de un sensor (tipo: "usuario")');
    console.log('   - La app apague luces por inactividad (tipo: "inactividad")');
    console.log('   - El ESP32 detecte cambios físicos (tipo: "externo")\n');

    await db.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error.message);
    console.error('   Detalles:', error);
    process.exit(1);
  }
}

// Ejecutar migración
migrateRegistros();
