/**
 * Script para probar el endpoint /esp32/data
 */

const axios = require('axios');

const API_URL = 'http://localhost:3003';

async function testESP32Data() {
  console.log('🧪 Iniciando prueba de endpoint /esp32/data\n');

  const payload = {
    ip: '192.168.1.103',
    sensores: [
      { pin: 4, estado: 1 },
      { pin: 20, estado: 1 },
      { pin: 2, estado: 1 },
      { pin: 3, estado: 1 }
    ]
  };

  try {
    console.log('📤 Enviando datos:');
    console.log(JSON.stringify(payload, null, 2));
    console.log('');

    const response = await axios.post(`${API_URL}/esp32/data`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'x-esp32-update': 'true'
      }
    });

    console.log('✅ Respuesta exitosa:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('');

    // Esperar 2 segundos y consultar el estado de los sensores
    console.log('⏳ Esperando 2 segundos...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('🔍 Consultando sensores del aula...');
    const sensoresResponse = await axios.get(`${API_URL}/sensores/aula/${response.data.aula.id}`);
    
    console.log('📊 Estado actual de sensores:');
    sensoresResponse.data.data.forEach(sensor => {
      console.log(`  - ${sensor.tipo} (Pin ${sensor.pin}): ${sensor.estado === 1 ? '✅ ON' : '⭕ OFF'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

// Ejecutar test
testESP32Data();
