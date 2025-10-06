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

  // Método para inicializar las tablas
  async initialize() {
    try {
      // Crear tabla de aulas
      await this.run(`
        CREATE TABLE IF NOT EXISTS aulas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL,
          ubicacion TEXT NOT NULL,
          capacidad INTEGER NOT NULL,
          descripcion TEXT,
          estado TEXT DEFAULT 'activa',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Crear tabla de dispositivos IoT
      await this.run(`
        CREATE TABLE IF NOT EXISTS dispositivos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          aula_id INTEGER NOT NULL,
          tipo TEXT NOT NULL,
          nombre TEXT NOT NULL,
          descripcion TEXT,
          estado TEXT DEFAULT 'activo',
          configuracion TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (aula_id) REFERENCES aulas (id) ON DELETE CASCADE
        )
      `);

      // Crear tabla de usuarios
      await this.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          legajo TEXT UNIQUE NOT NULL,
          nombre TEXT NOT NULL,
          apellido TEXT NOT NULL,
          email TEXT UNIQUE,
          password_hash TEXT NOT NULL,
          rol TEXT DEFAULT 'operario' CHECK (rol IN ('administrador', 'operario')),
          estado TEXT DEFAULT 'activo',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
