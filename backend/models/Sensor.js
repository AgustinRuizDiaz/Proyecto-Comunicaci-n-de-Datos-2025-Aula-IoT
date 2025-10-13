const db = require('../database');

class Sensor {
  /**
   * Crear un nuevo sensor
   */
  static async create({ tipo, descripcion, pin, estado, id_aula }) {
    try {
      // Validar que no exista otro sensor con el mismo pin en la misma aula
      const existingSensor = await db.get(
        'SELECT * FROM sensores WHERE pin = ? AND id_aula = ?',
        [pin, id_aula]
      );

      if (existingSensor) {
        throw new Error(`Ya existe un sensor en el pin ${pin} para esta aula`);
      }

      const result = await db.run(
        `INSERT INTO sensores (tipo, descripcion, pin, estado, id_aula, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [tipo, descripcion, pin, estado, id_aula]
      );

      return await this.findById(result.lastID);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener sensor por ID
   */
  static async findById(id) {
    try {
      const sensor = await db.get('SELECT * FROM sensores WHERE id = ?', [id]);
      
      if (!sensor) {
        throw new Error('Sensor no encontrado');
      }

      return sensor;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener todos los sensores de un aula
   */
  static async findByAulaId(id_aula) {
    try {
      const sensores = await db.all(
        'SELECT * FROM sensores WHERE id_aula = ? ORDER BY tipo, pin',
        [id_aula]
      );

      return sensores;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener todos los sensores
   */
  static async findAll() {
    try {
      const sensores = await db.all('SELECT * FROM sensores ORDER BY id_aula, tipo, pin');
      return sensores;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar sensor
   */
  static async update(id, { tipo, descripcion, pin, estado }) {
    try {
      const sensor = await this.findById(id);

      // Si se cambió el pin, validar que no exista otro sensor con ese pin en la misma aula
      if (pin && pin !== sensor.pin) {
        const existingSensor = await db.get(
          'SELECT * FROM sensores WHERE pin = ? AND id_aula = ? AND id != ?',
          [pin, sensor.id_aula, id]
        );

        if (existingSensor) {
          throw new Error(`Ya existe un sensor en el pin ${pin} para esta aula`);
        }
      }

      const updates = [];
      const values = [];

      if (tipo !== undefined) {
        updates.push('tipo = ?');
        values.push(tipo);
      }
      if (descripcion !== undefined) {
        updates.push('descripcion = ?');
        values.push(descripcion);
      }
      if (pin !== undefined) {
        updates.push('pin = ?');
        values.push(pin);
      }
      if (estado !== undefined) {
        updates.push('estado = ?');
        values.push(estado);
      }

      if (updates.length === 0) {
        return sensor;
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      await db.run(
        `UPDATE sensores SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar solo el estado de un sensor (para ESP32)
   */
  static async updateEstado(id, estado) {
    try {
      await db.run(
        'UPDATE sensores SET estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [estado, id]
      );

      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar sensor
   */
  static async delete(id) {
    try {
      const sensor = await this.findById(id);
      
      await db.run('DELETE FROM sensores WHERE id = ?', [id]);
      
      return sensor;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar todos los sensores de un aula
   */
  static async deleteByAulaId(id_aula) {
    try {
      await db.run('DELETE FROM sensores WHERE id_aula = ?', [id_aula]);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Sensor;
