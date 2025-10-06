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
    // Verificar si ya existen aulas
    const existingAulas = await db.get('SELECT COUNT(*) as count FROM aulas');

    if (existingAulas.count > 0) {
      console.log('📋 Ya existen aulas en la base de datos, omitiendo datos de ejemplo');
      return;
    }

    console.log('📝 Insertando datos de ejemplo...');

    // Insertar aulas de ejemplo
    const aulasEjemplo = [
      {
        nombre: 'Aula 101',
        ubicacion: 'Edificio A - Piso 1',
        capacidad: 30,
      },
      {
        nombre: 'Laboratorio IoT',
        ubicacion: 'Edificio B - Piso 2',
        capacidad: 25,
        descripcion: 'Laboratorio especializado en dispositivos IoT y sensores'
      },
      {
        nombre: 'Sala de Conferencias',
        ubicacion: 'Edificio Principal - Piso 3',
        capacidad: 50,
        descripcion: 'Sala para conferencias y presentaciones con equipo audiovisual completo'
      }
    ];

    for (const aula of aulasEjemplo) {
      await db.run(
        'INSERT INTO aulas (nombre, ubicacion, capacidad, descripcion) VALUES (?, ?, ?, ?)',
        [aula.nombre, aula.ubicacion, aula.capacidad, aula.descripcion]
      );
    }

    // Insertar usuarios de ejemplo
    const usuariosEjemplo = [
      {
        legajo: 'ADM001',
        nombre: 'Administrador',
        apellido: 'Sistema',
        email: 'admin@universidad.edu.ar',
        password: 'admin123',
        rol: 'administrador'
      },
      {
        legajo: 'OP001',
        nombre: 'Operario',
        apellido: 'Ejemplo',
        email: 'operario@universidad.edu.ar',
        password: 'operario123',
        rol: 'operario'
      },
      {
        legajo: 'OP002',
        nombre: 'María',
        apellido: 'González',
        email: 'maria.gonzalez@universidad.edu.ar',
        password: 'maria123',
        rol: 'operario'
      }
    ];

    for (const usuario of usuariosEjemplo) {
      await db.run(
        'INSERT OR IGNORE INTO usuarios (legajo, nombre, apellido, email, password_hash, rol, estado) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [usuario.legajo, usuario.nombre, usuario.apellido, usuario.email, await bcrypt.hash(usuario.password, 10), usuario.rol, 'activo']
      );
    }

    console.log('✅ Datos de ejemplo insertados correctamente');
  } catch (error) {
    console.error('❌ Error insertando datos de ejemplo:', error.message);
  }
}

// Ejecutar inicialización si el archivo es ejecutado directamente
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };
