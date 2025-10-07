const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Aplicar middleware de autenticación y autorización a todas las rutas
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/usuarios - Obtener todos los usuarios (solo administradores)
router.get('/', async (req, res) => {
  try {
    const usuarios = await Usuario.findAll();
    res.json({
      success: true,
      data: usuarios,
      count: usuarios.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/usuarios/rol/:rol - Obtener usuarios por rol (solo administradores)
router.get('/rol/:rol', async (req, res) => {
  try {
    const { rol } = req.params;

    if (!['administrador', 'operario'].includes(rol)) {
      return res.status(400).json({
        success: false,
        error: 'Rol debe ser administrador u operario'
      });
    }

    const usuarios = await Usuario.findByRol(rol);
    res.json({
      success: true,
      data: usuarios,
      count: usuarios.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/usuarios/:id - Obtener usuario por ID (solo administradores)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findById(id);

    res.json({
      success: true,
      data: usuario
    });
  } catch (error) {
    if (error.message === 'Usuario no encontrado') {
      res.status(404).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

// POST /api/usuarios - Crear nuevo usuario (solo administradores)
router.post('/', async (req, res) => {
  try {
    const { legajo, nombre, apellido, password, rol } = req.body;

    // Validaciones básicas
    if (!legajo || !nombre || !apellido || !password) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos son requeridos: legajo, nombre, apellido, password'
      });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Validar rol
    if (rol && !['administrador', 'operario'].includes(rol)) {
      return res.status(400).json({
        success: false,
        error: 'Rol debe ser administrador u operario'
      });
    }

    const usuarioId = await Usuario.create({
      legajo: legajo.trim(),
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      password,
      rol: rol || 'operario'
    });

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: { id: usuarioId }
    });
  } catch (error) {
    if (error.message.includes('ya está registrado')) {
      res.status(409).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

// PUT /api/usuarios/:id - Actualizar usuario (solo administradores)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, rol } = req.body;

    // Validaciones básicas
    if (!nombre || !apellido) {
      return res.status(400).json({
        success: false,
        error: 'Nombre y apellido son requeridos'
      });
    }

    // Validar rol
    if (rol && !['administrador', 'operario'].includes(rol)) {
      return res.status(400).json({
        success: false,
        error: 'Rol debe ser administrador u operario'
      });
    }

    await Usuario.update(id, {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      rol: rol || 'operario'
    });

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente'
    });
  } catch (error) {
    if (error.message === 'Usuario no encontrado') {
      res.status(404).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

// DELETE /api/usuarios/:id - Eliminar usuario (solo administradores)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await Usuario.delete(id);

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    if (error.message === 'Usuario no encontrado') {
      res.status(404).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

module.exports = router;
