const db = require('../database');

class Aula {
  // Crear una nueva aula
  static async create({ nombre, ubicacion, capacidad, descripcion }) {
    try {
      const result = await db.run(
        `INSERT INTO aulas (nombre, ubicacion, capacidad, descripcion)
         VALUES (?, ?, ?, ?)`,
        [nombre, ubicacion, capacidad, descripcion]
      );

      return result.lastID;
    } catch (error) {
      throw new Error('Error creando aula: ' + error.message);
    }
  }

  // Obtener todas las aulas
  static async findAll() {
    try {
      const aulas = await db.all(
        `SELECT * FROM aulas ORDER BY nombre`
      );
      return aulas;
    } catch (error) {
      throw new Error('Error obteniendo aulas: ' + error.message);
    }
  }

  // Obtener aula por ID
  static async findById(id) {
    try {
      const aula = await db.get(
        `SELECT * FROM aulas WHERE id = ?`,
        [id]
      );

      if (!aula) {
        throw new Error('Aula no encontrada');
      }

      return aula;
    } catch (error) {
      throw new Error('Error buscando aula: ' + error.message);
    }
  }

  // Actualizar aula
  static async update(id, { nombre, ubicacion, capacidad, descripcion, estado }) {
    try {
      const result = await db.run(
        `UPDATE aulas
         SET nombre = ?, ubicacion = ?, capacidad = ?, descripcion = ?, estado = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [nombre, ubicacion, capacidad, descripcion, estado, id]
      );

      if (result.changes === 0) {
        throw new Error('Aula no encontrada');
      }

      return true;
    } catch (error) {
      throw new Error('Error actualizando aula: ' + error.message);
    }
  }

  // Eliminar aula
  static async delete(id) {
    try {
      const result = await db.run(
        `DELETE FROM aulas WHERE id = ?`,
        [id]
      );

      if (result.changes === 0) {
        throw new Error('Aula no encontrada');
      }

      return true;
    } catch (error) {
      throw new Error('Error eliminando aula: ' + error.message);
    }
  }

  // Buscar aulas por nombre o ubicación
  static async search(query) {
    try {
      const aulas = await db.all(
        `SELECT * FROM aulas
         WHERE nombre LIKE ? OR ubicacion LIKE ? OR descripcion LIKE ?
         ORDER BY nombre`,
        [`%${query}%`, `%${query}%`, `%${query}%`]
      );

      return aulas;
    } catch (error) {
      throw new Error('Error buscando aulas: ' + error.message);
    }
  }

  // Obtener aulas por estado
  static async findByEstado(estado) {
    try {
      const aulas = await db.all(
        `SELECT * FROM aulas WHERE estado = ? ORDER BY nombre`,
        [estado]
      );

      return aulas;
    } catch (error) {
      throw new Error('Error obteniendo aulas por estado: ' + error.message);
    }
  }

  // Obtener estadísticas básicas
  static async getStats() {
    try {
      const totalAulas = await db.get(
        `SELECT COUNT(*) as total FROM aulas`
      );

      const aulasPorEstado = await db.all(
        `SELECT estado, COUNT(*) as cantidad FROM aulas GROUP BY estado`
      );

      return {
        total: totalAulas.total,
        porEstado: aulasPorEstado
      };
    } catch (error) {
      throw new Error('Error obteniendo estadísticas: ' + error.message);
    }
  }
}

module.exports = Aula;
