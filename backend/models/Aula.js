const db = require('../database');

class Aula {
  /**
   * Crear una nueva aula
   */
  static async create({ nombre, ip }) {
    try {
      // Verificar que el nombre no esté duplicado
      const existingNombre = await db.get(
        'SELECT id FROM aulas WHERE nombre = ?',
        [nombre]
      );

      if (existingNombre) {
        throw new Error('El nombre del aula ya está registrado');
      }

      // Verificar que la IP no esté duplicada
      const existingIp = await db.get(
        'SELECT id FROM aulas WHERE ip = ?',
        [ip]
      );

      if (existingIp) {
        throw new Error('La IP ya está registrada');
      }

      const result = await db.run(
        `INSERT INTO aulas (nombre, ip, ultima_senal) 
         VALUES (?, ?, NULL)`,
        [nombre, ip]
      );

      return result.lastID;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener todas las aulas
   */
  static async findAll() {
    try {
      const aulas = await db.all(
        `SELECT 
          id,
          nombre,
          ip,
          ultima_senal,
          created_at,
          updated_at
        FROM aulas
        ORDER BY nombre ASC`
      );

      // Agregar estado de conexión basado en ultima_senal
      return aulas.map(aula => ({
        ...aula,
        estado_conexion: this.getEstadoConexion(aula.ultima_senal)
      }));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar aula por ID
   */
  static async findById(id) {
    try {
      const aula = await db.get(
        `SELECT 
          id,
          nombre,
          ip,
          ultima_senal,
          created_at,
          updated_at
        FROM aulas 
        WHERE id = ?`,
        [id]
      );

      if (!aula) {
        throw new Error('Aula no encontrada');
      }

      return {
        ...aula,
        estado_conexion: this.getEstadoConexion(aula.ultima_senal)
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar aula
   */
  static async update(id, { nombre, ip }) {
    try {
      // Verificar que el aula existe
      await this.findById(id);

      // Verificar duplicados de nombre (excluyendo la misma aula)
      if (nombre) {
        const existingNombre = await db.get(
          'SELECT id FROM aulas WHERE nombre = ? AND id != ?',
          [nombre, id]
        );

        if (existingNombre) {
          throw new Error('El nombre del aula ya está registrado');
        }
      }

      // Verificar duplicados de IP (excluyendo la misma aula)
      if (ip) {
        const existingIp = await db.get(
          'SELECT id FROM aulas WHERE ip = ? AND id != ?',
          [ip, id]
        );

        if (existingIp) {
          throw new Error('La IP ya está registrada');
        }
      }

      await db.run(
        `UPDATE aulas 
         SET nombre = ?, 
             ip = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [nombre, ip, id]
      );

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar aula
   */
  static async delete(id) {
    try {
      // Verificar que el aula existe
      await this.findById(id);

      await db.run('DELETE FROM aulas WHERE id = ?', [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar última señal (llamado por ESP32)
   */
  static async updateUltimaSenal(id) {
    try {
      await db.run(
        `UPDATE aulas 
         SET ultima_senal = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [id]
      );
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Determinar estado de conexión basado en última señal
   * Online si la última señal fue hace menos de 2 minutos
   */
  static getEstadoConexion(ultimaSenal) {
    if (!ultimaSenal) {
      return 'offline';
    }

    const now = new Date();
    const lastSignal = new Date(ultimaSenal);
    const diffMinutes = (now - lastSignal) / 1000 / 60;

    return diffMinutes < 2 ? 'online' : 'offline';
  }
}

module.exports = Aula;
