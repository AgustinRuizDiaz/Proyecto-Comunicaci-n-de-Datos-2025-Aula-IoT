const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.dbPath = path.join(__dirname, 'database.sqlite');
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Error al conectar con la base de datos:', err.message);
          reject(err);
        } else {
          console.log('✅ Conectado a la base de datos SQLite');
          resolve();
        }
      });
    });
  }

  disconnect() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Error al cerrar la base de datos:', err.message);
          } else {
            console.log('🔒 Conexión a la base de datos cerrada');
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          console.error('Error ejecutando query:', err.message);
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          console.error('Error ejecutando query:', err.message);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('Error ejecutando query:', err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Método para limpiar la base de datos y recrear todas las tablas
  async cleanAndRecreate() {
    try {
      // Eliminar tablas existentes si existen
      await this.run(`DROP TABLE IF EXISTS sensores`);
      await this.run(`DROP TABLE IF EXISTS dispositivos`);
      await this.run(`DROP TABLE IF EXISTS aulas`);
      await this.run(`DROP TABLE IF EXISTS usuarios`);

      // Recrear tabla de usuarios
      await this.run(`
        CREATE TABLE usuarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          legajo TEXT UNIQUE NOT NULL,
          nombre TEXT NOT NULL,
          apellido TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          rol TEXT DEFAULT 'operario' CHECK (rol IN ('administrador', 'operario')),
          estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Recrear tabla de aulas
      await this.run(`
        CREATE TABLE aulas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT UNIQUE NOT NULL,
          ip TEXT UNIQUE NOT NULL,
          ultima_senal DATETIME,
          luces_encendidas INTEGER DEFAULT 0,
          ventanas_abiertas INTEGER DEFAULT 0,
          personas_detectadas INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Crear tabla de sensores
      await this.run(`
        CREATE TABLE sensores (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          tipo TEXT NOT NULL CHECK (tipo IN ('Sensor de luz', 'Sensor de ventana', 'Sensor de movimiento')),
          descripcion TEXT,
          pin INTEGER NOT NULL CHECK (pin >= 0 AND pin <= 100),
          estado INTEGER NOT NULL DEFAULT 0,
          id_aula INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (id_aula) REFERENCES aulas(id) ON DELETE CASCADE
        )
      `);

      console.log('🧹 Base de datos limpiada y tablas recreadas correctamente');
    } catch (error) {
      console.error('❌ Error limpiando la base de datos:', error);
      throw error;
    }
  }

  // Método para inicializar las tablas
  async initialize() {
    try {
      // Crear tabla de usuarios
      await this.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          legajo TEXT UNIQUE NOT NULL,
          nombre TEXT NOT NULL,
          apellido TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          rol TEXT DEFAULT 'operario' CHECK (rol IN ('administrador', 'operario')),
          estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Crear tabla de aulas
      await this.run(`
        CREATE TABLE IF NOT EXISTS aulas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT UNIQUE NOT NULL,
          ip TEXT UNIQUE NOT NULL,
          ultima_senal DATETIME,
          luces_encendidas INTEGER DEFAULT 0,
          ventanas_abiertas INTEGER DEFAULT 0,
          personas_detectadas INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Crear tabla de sensores
      await this.run(`
        CREATE TABLE IF NOT EXISTS sensores (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          tipo TEXT NOT NULL CHECK (tipo IN ('Sensor de luz', 'Sensor de ventana', 'Sensor de movimiento')),
          descripcion TEXT,
          pin INTEGER NOT NULL CHECK (pin >= 0 AND pin <= 100),
          estado INTEGER NOT NULL DEFAULT 0,
          id_aula INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (id_aula) REFERENCES aulas(id) ON DELETE CASCADE
        )
      `);

      console.log('📊 Tablas de base de datos inicializadas correctamente');
    } catch (error) {
      console.error('❌ Error inicializando la base de datos:', error);
      throw error;
    }
  }
}

module.exports = new Database();
