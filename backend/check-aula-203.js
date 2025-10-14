// Script para verificar configuración del Aula 203
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Verificando Aula 203 en la base de datos...\n');

// Verificar aula
db.get('SELECT * FROM aulas WHERE ip = ?', ['192.168.1.103'], (err, aula) => {
  if (err) {
    console.error('❌ Error al buscar aula:', err);
    process.exit(1);
  }

  if (!aula) {
    console.error('❌ NO se encontró aula con IP 192.168.1.103');
    console.log('\n💡 Para crear el aula, ejecuta:');
    console.log('   UPDATE aulas SET ip = "192.168.1.103" WHERE id = 3;');
    process.exit(1);
  }

  console.log('✅ Aula encontrada:');
  console.log(`   ID: ${aula.id}`);
  console.log(`   Nombre: ${aula.nombre}`);
  console.log(`   IP: ${aula.ip}`);
  console.log(`   Última señal: ${aula.ultima_senal || 'Nunca'}`);

  // Verificar sensores
  console.log('\n🔍 Verificando sensores del aula...\n');
  db.all('SELECT * FROM sensores WHERE id_aula = ?', [aula.id], (err, sensores) => {
    if (err) {
      console.error('❌ Error al buscar sensores:', err);
      process.exit(1);
    }

    if (sensores.length === 0) {
      console.error('❌ NO hay sensores configurados para esta aula');
      process.exit(1);
    }

    console.log(`✅ ${sensores.length} sensores encontrados:\n`);
    sensores.forEach(s => {
      console.log(`   [${s.tipo}]`);
      console.log(`      ID: ${s.id}`);
      console.log(`      Pin: ${s.pin}`);
      console.log(`      Estado: ${s.estado}`);
      console.log('');
    });

    // Verificar que existan los pines esperados
    const pinesEsperados = [4, 20, 2, 3];
    const pinesEnBD = sensores.map(s => s.pin);
    const pinesFaltantes = pinesEsperados.filter(p => !pinesEnBD.includes(p));

    if (pinesFaltantes.length > 0) {
      console.warn(`⚠️ ADVERTENCIA: Faltan sensores con los siguientes pines:`);
      pinesFaltantes.forEach(pin => console.warn(`   - Pin ${pin}`));
      console.log('\n💡 El simulador envía datos de los pines: 4, 20, 2, 3');
    } else {
      console.log('✅ Todos los pines esperados están configurados');
    }

    console.log('\n✅ Configuración verificada correctamente');
    db.close();
    process.exit(0);
  });
});
