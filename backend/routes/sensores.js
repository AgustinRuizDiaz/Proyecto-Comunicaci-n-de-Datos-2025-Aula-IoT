const express = require('express');
const router = express.Router();
const Sensor = require('../models/Sensor');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// GET /sensores - Obtener todos los sensores
router.get('/', async (req, res) => {
  try {
    const sensores = await Sensor.findAll();
    
    res.json({
      success: true,
      data: sensores
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /sensores/aula/:id_aula - Obtener sensores de un aula específica
router.get('/aula/:id_aula', async (req, res) => {
  try {
    const { id_aula } = req.params;
    const sensores = await Sensor.findByAulaId(id_aula);
    
    res.json({
      success: true,
      data: sensores
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /sensores/:id - Obtener sensor por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sensor = await Sensor.findById(id);
    
    res.json({
      success: true,
      data: sensor
    });
  } catch (error) {
    if (error.message === 'Sensor no encontrado') {
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

// POST /sensores - Crear nuevo sensor (solo administradores)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { tipo, descripcion, pin, estado, id_aula } = req.body;

    // Validaciones básicas
    if (!tipo || pin === undefined || !id_aula) {
      return res.status(400).json({
        success: false,
        error: 'Tipo, pin e id_aula son requeridos'
      });
    }

    // Validar tipo
    const tiposValidos = ['Sensor de luz', 'Sensor de ventana', 'Sensor de movimiento'];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de sensor inválido. Debe ser: Sensor de luz, Sensor de ventana o Sensor de movimiento'
      });
    }

    // Validar pin
    const pinNum = parseInt(pin);
    if (isNaN(pinNum) || pinNum < 0 || pinNum > 100) {
      return res.status(400).json({
        success: false,
        error: 'El pin debe ser un número entre 0 y 100'
      });
    }

    // Estado por defecto es 0 (apagado/cerrado/no detectado)
    const estadoFinal = estado !== undefined ? estado : 0;

    const sensor = await Sensor.create({
      tipo,
      descripcion: descripcion || '',
      pin: pinNum,
      estado: estadoFinal,
      id_aula
    });

    res.status(201).json({
      success: true,
      data: sensor,
      message: 'Sensor creado exitosamente'
    });
  } catch (error) {
    if (error.message.includes('Ya existe un sensor')) {
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

// PUT /sensores/:id - Actualizar sensor (solo administradores)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, descripcion, pin, estado } = req.body;

    // Validar tipo si se proporciona
    if (tipo) {
      const tiposValidos = ['Sensor de luz', 'Sensor de ventana', 'Sensor de movimiento'];
      if (!tiposValidos.includes(tipo)) {
        return res.status(400).json({
          success: false,
          error: 'Tipo de sensor inválido'
        });
      }
    }

    // Validar pin si se proporciona
    if (pin !== undefined) {
      const pinNum = parseInt(pin);
      if (isNaN(pinNum) || pinNum < 0 || pinNum > 100) {
        return res.status(400).json({
          success: false,
          error: 'El pin debe ser un número entre 0 y 100'
        });
      }
    }

    const sensor = await Sensor.update(id, {
      tipo,
      descripcion,
      pin: pin !== undefined ? parseInt(pin) : undefined,
      estado
    });

    res.json({
      success: true,
      data: sensor,
      message: 'Sensor actualizado exitosamente'
    });
  } catch (error) {
    if (error.message === 'Sensor no encontrado') {
      res.status(404).json({
        success: false,
        error: error.message
      });
    } else if (error.message.includes('Ya existe un sensor')) {
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

// PATCH /sensores/:id/estado - Actualizar solo el estado (para ESP32 y operarios con luces)
router.patch('/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (estado === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Estado es requerido'
      });
    }

    const sensor = await Sensor.updateEstado(id, estado);

    res.json({
      success: true,
      data: sensor,
      message: 'Estado del sensor actualizado'
    });
  } catch (error) {
    if (error.message === 'Sensor no encontrado') {
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

// DELETE /sensores/:id - Eliminar sensor (solo administradores)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const sensor = await Sensor.delete(id);

    res.json({
      success: true,
      data: sensor,
      message: 'Sensor eliminado exitosamente'
    });
  } catch (error) {
    if (error.message === 'Sensor no encontrado') {
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
