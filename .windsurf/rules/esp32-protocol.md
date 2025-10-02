---
trigger: always_on
---

```markdown
# Protocolo ESP32

## Comunicación ESP32 ↔ Server

### Heartbeat (cada 30 segundos)
```json
// ESP32 → Server
POST /api/esp32/heartbeat
{
  "ip": "192.168.1.100",
  "aula_id": 1,
  "timestamp": 1234567890,
  "sensores": [
    {"id": 1, "tipo": "luz", "estado": true, "pin": 23},
    {"id": 2, "tipo": "movimiento", "estado": false, "pin": 22},
    {"id": 3, "tipo": "ventana", "estado": "cerrada", "pin": 21}
  ]
}

// Server → ESP32 (response)
{
  "commands": [
    {"sensor_id": 1, "action": "toggle", "value": false}
  ],
  "config": {
    "heartbeat_interval": 30,
    "timeout_inactividad": 1800
  }
}
Actualización de Sensor
json// ESP32 → Server (cambio detectado)
POST /api/esp32/sensor-update
{
  "ip": "192.168.1.100",
  "sensor_id": 2,
  "nuevo_estado": true,
  "timestamp": 1234567890
}
Manejo de Reconexión
python# Lógica en ESP32 (pseudocódigo)
if (millis() - lastHeartbeat > HEARTBEAT_INTERVAL) {
    if (!sendHeartbeat()) {
        retryCount++;
        if (retryCount > MAX_RETRIES) {
            enterOfflineMode();
            queueActionsForLater();
        }
    }
}
Headers de Seguridad
X-ESP32-API-Key: {API_KEY}
X-Device-IP: {ESP32_IP}
Content-Type: application/json