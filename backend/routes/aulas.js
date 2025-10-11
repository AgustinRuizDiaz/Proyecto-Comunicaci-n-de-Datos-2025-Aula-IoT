const express = require('express');
const router = express.Router();
const Aula = require('../models/Aula');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// GET /aulas - Obtener todas las aulas (todos los usuarios autenticados)
router.get('/', async (req, res) => {
  try {
    const aulas = await Aula.findAll();
    res.json({
      success: true,
      data: aulas,
      count: aulas.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /aulas/:id - Obtener aula por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const aula = await Aula.findById(id);

    res.json({
      success: true,
      data: aula
    });
  } catch (error) {
    if (error.message === 'Aula no encontrada') {
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

// POST /aulas - Crear nueva aula (solo administradores)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { nombre, ip } = req.body;

    // Validaciones básicas
    if (!nombre || !ip) {
      return res.status(400).json({
        success: false,
        error: 'Nombre e IP son requeridos'
      });
    }

    // Validar longitud de nombre
    if (nombre.length > 40) {
      return res.status(400).json({
        success: false,
        error: 'El nombre no puede tener más de 40 caracteres'
      });
    }

    // Validar formato de IP (IPv4)
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    if (!ipRegex.test(ip)) {
      return res.status(400).json({
        success: false,
        error: 'Formato de IP inválido. Debe ser IPv4 (ej: 192.168.1.100)'
      });
    }

    const aulaId = await Aula.create({
      nombre: nombre.trim(),
      ip: ip.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Aula creada exitosamente',
      data: { id: aulaId }
    });
  } catch (error) {
    if (error.message.includes('ya está registrad')) {
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

// PUT /aulas/:id - Actualizar aula (solo administradores)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, ip } = req.body;

    // Validaciones básicas
    if (!nombre || !ip) {
      return res.status(400).json({
        success: false,
        error: 'Nombre e IP son requeridos'
      });
    }

    // Validar longitud de nombre
    if (nombre.length > 40) {
      return res.status(400).json({
        success: false,
        error: 'El nombre no puede tener más de 40 caracteres'
      });
    }

    // Validar formato de IP
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    if (!ipRegex.test(ip)) {
      return res.status(400).json({
        success: false,
        error: 'Formato de IP inválido. Debe ser IPv4 (ej: 192.168.1.100)'
      });
    }

    await Aula.update(id, {
      nombre: nombre.trim(),
      ip: ip.trim()
    });

    res.json({
      success: true,
      message: 'Aula actualizada exitosamente'
    });
  } catch (error) {
    if (error.message === 'Aula no encontrada') {
      res.status(404).json({
        success: false,
        error: error.message
      });
    } else if (error.message.includes('ya está registrad')) {
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

// DELETE /aulas/:id - Eliminar aula (solo administradores)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await Aula.delete(id);

    res.json({
      success: true,
      message: 'Aula eliminada exitosamente'
    });
  } catch (error) {
    if (error.message === 'Aula no encontrada') {
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

// POST /aulas/:id/heartbeat - Actualizar última señal (para ESP32)
router.post('/:id/heartbeat', async (req, res) => {
  try {
    const { id } = req.params;
    
    await Aula.updateUltimaSenal(id);

    res.json({
      success: true,
      message: 'Señal registrada'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
