const express = require('express');
const router = express.Router();
const Aula = require('../models/Aula');
const Sensor = require('../models/Sensor');
const commandQueue = require('../commandQueue');

// POST /esp32/data - Recibir datos del ESP32 (sin autenticación)
router.post('/data', async (req, res) => {
  try {
    const { ip, sensores } = req.body;

    // Validar datos
    if (!ip || !sensores || !Array.isArray(sensores)) {
      console.log('❌ Datos inválidos recibidos:', req.body);
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos. Se requiere ip y array de sensores'
      });
    }

    console.log(`📡 Datos recibidos de ESP32 con IP: ${ip}`);
    console.log(`   Sensores recibidos:`, sensores);

    // Buscar el aula por IP
    console.log(`🔍 Buscando aula con IP: ${ip}`);
    const db = require('../database');
    const aula = await db.get('SELECT * FROM aulas WHERE ip = ?', [ip]);
    
    console.log('✅ Resultado búsqueda aula:', aula);

    if (!aula) {
      console.log(`❌ Aula NO encontrada con IP: ${ip}`);
      return res.status(404).json({
        success: false,
        error: `No se encontró aula con IP ${ip}`
      });
    }

    console.log(`✅ Aula encontrada: ${aula.nombre} (ID: ${aula.id})`);

    // Actualizar última señal (heartbeat)
    await Aula.updateUltimaSenal(aula.id);
    console.log(`  ✅ Heartbeat actualizado para aula ${aula.nombre} (ID: ${aula.id})`);

    // Actualizar estados de sensores
    console.log(`  📊 Procesando ${sensores.length} sensores...`);
    for (const sensorData of sensores) {
      const { pin, estado } = sensorData;
      
      // Buscar sensor por aula_id y pin
      const sensor = await db.get(
        'SELECT * FROM sensores WHERE id_aula = ? AND pin = ?',
        [aula.id, pin]
      );

      if (sensor) {
        console.log(`  🔍 Sensor encontrado: ${sensor.tipo} (ID: ${sensor.id}, Pin: ${pin})`);
        console.log(`     Estado anterior: ${sensor.estado} → Nuevo estado: ${estado}`);
        
        // Actualizar estado del sensor
        const sensorActualizado = await Sensor.updateEstado(sensor.id, estado);
        console.log(`  ✅ Sensor pin ${pin} actualizado exitosamente a estado ${estado}`);
        
        // Notificar a todos los clientes conectados vía WebSocket
        const io = req.app.get('socketio');
        if (io) {
          io.emit('sensorUpdate', {
            id: sensor.id,
            id_aula: aula.id,
            pin,
            estado,
            tipo: sensor.tipo
          });
          console.log(`  ⚡ Actualización enviada vía WebSocket a todos los clientes`);
        }
      } else {
        console.log(`  ⚠️ Sensor pin ${pin} NO encontrado en BD para aula ${aula.id}`);
      }
    }

    // Verificar si hay comandos pendientes para este ESP32
    const commands = commandQueue.getAndClearCommands(ip);
    
    if (commands.length > 0) {
      console.log(`  📤 Enviando ${commands.length} comando(s) pendiente(s) a ESP32 ${ip}:`, commands);
    }

    res.json({
      success: true,
      message: 'Datos recibidos correctamente',
      aula: {
        id: aula.id,
        nombre: aula.nombre
      },
      commands: commands // Enviar comandos pendientes al ESP32
    });

  } catch (error) {
    console.error('❌ ERROR CRÍTICO procesando datos ESP32:', error);
    console.error('   Stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /esp32/command - Encolar comando para ESP32 (usado internamente por el backend)
router.post('/command', async (req, res) => {
  try {
    const { ip, pin, action } = req.body;

    if (!ip || pin === undefined || !action) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere ip, pin y action'
      });
    }

    // Encolar comando usando el módulo compartido
    commandQueue.enqueueCommand(ip, pin, action);

    res.json({
      success: true,
      message: 'Comando encolado',
      command: { ip, pin, action }
    });

  } catch (error) {
    console.error('❌ Error encolando comando:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
