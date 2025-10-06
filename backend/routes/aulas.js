const express = require('express');
const router = express.Router();
const Aula = require('../models/Aula');

// GET /api/aulas - Obtener todas las aulas
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

// GET /api/aulas/stats - Obtener estadísticas
router.get('/stats', async (req, res) => {
  try {
    const stats = await Aula.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/aulas/search?q=query - Buscar aulas
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Debe proporcionar un término de búsqueda'
      });
    }

    const aulas = await Aula.search(q.trim());
    res.json({
      success: true,
      data: aulas,
      count: aulas.length,
      query: q.trim()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/aulas/:id - Obtener aula por ID
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

// POST /api/aulas - Crear nueva aula
router.post('/', async (req, res) => {
  try {
    const { nombre, ubicacion, capacidad, descripcion } = req.body;

    // Validaciones básicas
    if (!nombre || !ubicacion || !capacidad) {
      return res.status(400).json({
        success: false,
        error: 'Nombre, ubicación y capacidad son requeridos'
      });
    }

    if (capacidad <= 0) {
      return res.status(400).json({
        success: false,
        error: 'La capacidad debe ser mayor a 0'
      });
    }

    const aulaId = await Aula.create({
      nombre: nombre.trim(),
      ubicacion: ubicacion.trim(),
      capacidad: parseInt(capacidad),
      descripcion: descripcion ? descripcion.trim() : null
    });

    res.status(201).json({
      success: true,
      message: 'Aula creada exitosamente',
      data: { id: aulaId }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/aulas/:id - Actualizar aula
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, ubicacion, capacidad, descripcion, estado } = req.body;

    // Validaciones básicas
    if (!nombre || !ubicacion || !capacidad) {
      return res.status(400).json({
        success: false,
        error: 'Nombre, ubicación y capacidad son requeridos'
      });
    }

    if (capacidad <= 0) {
      return res.status(400).json({
        success: false,
        error: 'La capacidad debe ser mayor a 0'
      });
    }

    await Aula.update(id, {
      nombre: nombre.trim(),
      ubicacion: ubicacion.trim(),
      capacidad: parseInt(capacidad),
      descripcion: descripcion ? descripcion.trim() : null,
      estado: estado || 'activa'
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
    } else {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

// DELETE /api/aulas/:id - Eliminar aula
router.delete('/:id', async (req, res) => {
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

module.exports = router;
