const express = require('express');
const router = express.Router();
const Aula = require('../models/Aula');
const Sensor = require('../models/Sensor');
const Registro = require('../models/Registro');
const commandQueue = require('../commandQueue');
const recentChanges = require('../recentChanges');

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
        
        // Verificar si el estado realmente cambió
        const estadoCambio = sensor.estado !== estado;
        
        // Actualizar estado del sensor
        const sensorActualizado = await Sensor.updateEstado(sensor.id, estado);
        console.log(`  ✅ Sensor pin ${pin} actualizado exitosamente a estado ${estado}`);
        
        // Verificar si debemos ignorar este update (fue iniciado por un usuario hace poco)
        const debeIgnorar = recentChanges.shouldIgnoreESP32Update(sensor.id, estado);
        
        // Verificar si es un duplicado externo (mismo sensor, mismo estado en los últimos 3 segundos)
        const esDuplicadoExterno = recentChanges.isExternalDuplicate(sensor.id, estado);
        
        // Crear registro solo si:
        // 1. El estado cambió
        // 2. NO es confirmación de cambio de usuario
        // 3. NO es un duplicado externo
        if (estadoCambio && !debeIgnorar && !esDuplicadoExterno) {
          try {
            await Registro.create({
              id_sensor: sensor.id,
              tipo_actuador: 'externo',
              id_usuario: null,
              estado: estado
            });
            console.log(`  📝 Registro creado: Cambio externo en sensor ${sensor.id} (pin ${pin}) a estado ${estado}`);
            
            // Registrar este cambio externo para evitar duplicados futuros
            recentChanges.recordExternalChange(sensor.id, estado);
          } catch (error) {
            console.error('  ⚠️ Error creando registro:', error.message);
            // No fallar la actualización del sensor por error en registro
          }
        } else if (estadoCambio && debeIgnorar) {
          console.log(`  ℹ️ Cambio detectado pero es confirmación de cambio de usuario, no se crea registro duplicado`);
        } else if (estadoCambio && esDuplicadoExterno) {
          console.log(`  ℹ️ Cambio detectado pero es duplicado externo reciente, no se crea registro`);
        } else {
          console.log(`  ℹ️ Estado sin cambios, no se crea registro`);
        }
        
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
