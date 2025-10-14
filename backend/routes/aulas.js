const express = require('express');
const router = express.Router();
const Aula = require('../models/Aula');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// ========== RUTAS PÚBLICAS (sin autenticación) para ESP32 ==========
// POST /aulas/:id/heartbeat - Actualizar última señal (para dispositivos ESP32)
router.post('/:id/heartbeat', async (req, res) => {
  try {
    const { id } = req.params;
    
    await Aula.updateUltimaSenal(id);

    res.json({
      success: true,
      message: 'Señal registrada',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========== RUTAS PROTEGIDAS (requieren autenticación) ==========
// Aplicar middleware de autenticación a todas las rutas siguientes
router.use(authenticateToken);

// GET /aulas - Obtener todas las aulas (todos los usuarios autenticados)
router.get('/', async (req, res) => {
  try {
    const aulas = await Aula.findAll();
    const Sensor = require('../models/Sensor');
    const db = require('../database');
    
    // Para cada aula, calcular el estado agregado de sensores
    const aulasConSensores = await Promise.all(aulas.map(async (aula) => {
      // Obtener todos los sensores del aula
      const sensores = await Sensor.findByAulaId(aula.id);
      
      // Verificar si el aula está offline
      let isOffline = false;
      if (aula.ultima_senal) {
        const now = new Date();
        const signalDate = new Date(aula.ultima_senal);
        const diffMinutes = (now - signalDate) / 60000;
        isOffline = diffMinutes >= 2;
      } else {
        isOffline = true; // Nunca ha enviado señal
      }
      
      // Si está offline, todos los sensores en 0
      const sensoresFinales = isOffline 
        ? sensores.map(s => ({ ...s, estado: 0 }))
        : sensores;
      
      // Calcular estados agregados
      const lucesEncendidas = sensoresFinales.some(s => 
        s.tipo === 'Sensor de luz' && s.estado === 1
      );
      
      const ventanasAbiertas = sensoresFinales.some(s => 
        s.tipo === 'Sensor de ventana' && s.estado === 1
      );
      
      const personasDetectadas = sensoresFinales.some(s => 
        s.tipo === 'Sensor de movimiento' && s.estado === 1
      );
      
      return {
        ...aula,
        luces_encendidas: lucesEncendidas ? 1 : 0,
        ventanas_abiertas: ventanasAbiertas ? 1 : 0,
        personas_detectadas: personasDetectadas ? 1 : 0,
        isOffline
      };
    }));
    
    res.json({
      success: true,
      data: aulasConSensores,
      count: aulasConSensores.length
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

// PUT /aulas/:id/sensores - Actualizar estados de sensores (temporal para simulación)
router.put('/:id/sensores', async (req, res) => {
  try {
    const { id } = req.params;
    const { luces_encendidas, ventanas_abiertas, personas_detectadas } = req.body;

    await Aula.updateEstadosSensores(id, {
      luces_encendidas,
      ventanas_abiertas,
      personas_detectadas
    });

    res.json({
      success: true,
      message: 'Estados de sensores actualizados'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
