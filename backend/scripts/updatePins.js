const db = require('../database');

async function updatePins() {
  try {
    console.log('🔧 Actualizando pines en la base de datos...');

    // Conectar a la base de datos
    await db.connect();

    // Actualizar pin 25 a 33 (LDR 2)
    const result = await db.run(`
      UPDATE sensores 
      SET pin = 33 
      WHERE pin = 25 AND tipo = 'Sensor de luz'
    `);

    console.log(`✅ Actualizado ${result.changes} sensor(es) de pin 25 a pin 33`);

    // Mostrar todos los sensores para verificar
    const sensores = await db.all('SELECT * FROM sensores ORDER BY id_aula, pin');
    
    console.log('\n📊 Sensores actuales en la base de datos:');
    console.log('═══════════════════════════════════════════════════════');
    
    for (const sensor of sensores) {
      console.log(`ID: ${sensor.id} | Aula: ${sensor.id_aula} | Pin: ${sensor.pin} | Tipo: ${sensor.tipo} | Estado: ${sensor.estado}`);
    }
    
    console.log('═══════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Error actualizando pines:', error.message);
    process.exit(1);
  } finally {
    // Cerrar conexión
    await db.disconnect();
    process.exit(0);
  }
}

// Ejecutar migración
updatePins();
