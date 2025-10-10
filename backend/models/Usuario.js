const db = require('../database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class Usuario {
  // Crear un nuevo usuario
  static async create({ legajo, nombre, apellido, password, rol = 'operario' }) {
    try {
      // Verificar si el legajo ya existe
      const existingLegajo = await db.get(
        'SELECT id FROM usuarios WHERE legajo = ?',
        [legajo]
      );

      if (existingLegajo) {
        throw new Error('El legajo ya está registrado');
      }

      // Hash de contraseña
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      const result = await db.run(
        `INSERT INTO usuarios (legajo, nombre, apellido, password_hash, rol)
         VALUES (?, ?, ?, ?, ?)`,
        [legajo, nombre, apellido, password_hash, rol]
      );

      return result.lastID;
    } catch (error) {
      throw new Error('Error creando usuario: ' + error.message);
    }
  }

  // Obtener usuario por legajo
  static async findByLegajo(legajo) {
    try {
      const usuario = await db.get(
        `SELECT id, legajo, nombre, apellido, rol, estado
         FROM usuarios WHERE legajo = ?`,
        [legajo]
      );

      return usuario;
    } catch (error) {
      throw new Error('Error buscando usuario: ' + error.message);
    }
  }

  // Verificar contraseña
  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw new Error('Error verificando contraseña');
    }
  }

  // Generar token JWT
  static generateToken(usuario) {
    try {
      const payload = {
        id: usuario.id,
        legajo: usuario.legajo,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol
      };

      return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      });
    } catch (error) {
      throw new Error('Error generando token');
    }
  }

  // Verificar token JWT
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }

  // Autenticar usuario (inicio de sesión)
  static async authenticate(legajo, password) {
    try {
      // Buscar usuario por legajo
      const usuario = await db.get(
        `SELECT * FROM usuarios WHERE legajo = ?`,
        [legajo]
      );

      if (!usuario) {
        throw new Error('Credenciales inválidas');
      }

      // Verificar contraseña
      const isValidPassword = await this.verifyPassword(password, usuario.password_hash);

      if (!isValidPassword) {
        throw new Error('Credenciales inválidas');
      }

      // Generar token
      const token = this.generateToken(usuario);

      // Retornar datos del usuario sin contraseña
      const { password_hash, ...usuarioSinPassword } = usuario;

      return {
        usuario: usuarioSinPassword,
        token
      };
    } catch (error) {
      throw new Error('Error de autenticación: ' + error.message);
    }
  }

  // Obtener todos los usuarios (sin contraseña)
  static async findAll() {
    try {
      const usuarios = await db.all(
        `SELECT id, legajo, nombre, apellido, rol, estado
         FROM usuarios WHERE estado = 'activo' ORDER BY apellido, nombre`
      );
      return usuarios;
    } catch (error) {
      throw new Error('Error obteniendo usuarios: ' + error.message);
    }
  }

  // Obtener usuario por ID (sin contraseña)
  static async findById(id) {
    try {
      const usuario = await db.get(
        `SELECT id, legajo, nombre, apellido, rol, estado
         FROM usuarios WHERE id = ?`,
        [id]
      );

      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      return usuario;
    } catch (error) {
      throw new Error('Error buscando usuario: ' + error.message);
    }
  }

  // Actualizar usuario
  static async update(id, { nombre, apellido, rol }) {
    try {
      const result = await db.run(
        `UPDATE usuarios
         SET nombre = ?, apellido = ?, rol = ?
         WHERE id = ?`,
        [nombre, apellido, rol, id]
      );

      if (result.changes === 0) {
        throw new Error('Usuario no encontrado');
      }

      return true;
    } catch (error) {
      throw new Error('Error actualizando usuario: ' + error.message);
    }
  }

  // Cambiar contraseña
  static async changePassword(id, newPassword) {
    try {
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(newPassword, saltRounds);

      const result = await db.run(
        `UPDATE usuarios
         SET password_hash = ?
         WHERE id = ?`,
        [password_hash, id]
      );

      if (result.changes === 0) {
        throw new Error('Usuario no encontrado');
      }

      return true;
    } catch (error) {
      throw new Error('Error cambiando contraseña: ' + error.message);
    }
  }

  // Eliminar usuario
  static async delete(id) {
    try {
      const result = await db.run(
        `DELETE FROM usuarios WHERE id = ?`,
        [id]
      );

      if (result.changes === 0) {
        throw new Error('Usuario no encontrado');
      }

      return true;
    } catch (error) {
      throw new Error('Error eliminando usuario: ' + error.message);
    }
  }

  // Buscar usuarios por rol
  static async findByRol(rol) {
    try {
      const usuarios = await db.all(
        `SELECT id, legajo, nombre, apellido, rol, estado
         FROM usuarios WHERE rol = ? AND estado = 'activo' ORDER BY apellido, nombre`,
        [rol]
      );

      return usuarios;
    } catch (error) {
      throw new Error('Error obteniendo usuarios por rol: ' + error.message);
    }
  }
}

module.exports = Usuario;
