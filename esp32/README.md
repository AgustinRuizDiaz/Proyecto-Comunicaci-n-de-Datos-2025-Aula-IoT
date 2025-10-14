# 🔧 Simulador ESP32 - Aula IoT

Este simulador permite probar la funcionalidad de una placa ESP32 conectada al sistema de gestión de aulas sin necesidad de hardware físico.

## 📋 Características

- ✅ **Identificación automática por IP**
  - El simulador se identifica con una IP fija (ej: `192.168.1.103`)
  - El servidor busca automáticamente el aula correspondiente a esa IP
  - Simula el comportamiento real de un ESP32 en la red

- ✅ **Simulación de sensores IoT**
  - Sensor de luz (control on/off)
  - Sensor de ventana (abierta/cerrada)
  - Sensor de movimiento (detectado/no detectado)

- ✅ **Comunicación unidireccional proactiva**
  - El ESP32 **envía** cambios de sensores al servidor
  - El servidor actualiza la base de datos
  - La aplicación web detecta los cambios automáticamente
  - Sistema de heartbeat automático cada 30 segundos

- ✅ **Interfaz visual intuitiva**
  - Estado de conexión en tiempo real
  - Información del aula identificada (nombre, IP, ID)
  - Registro de actividad con timestamps
  - Controles táctiles para cada sensor

## 🚀 Cómo usar

### 1. **Configurar la IP del dispositivo**
Antes de usar el simulador, edita la línea 218 en `simulador.html`:
```javascript
const DEVICE_IP = '192.168.1.103'; // Cambiar a la IP del aula que quieres simular
```

**IPs disponibles por defecto:**
- `192.168.1.101` - Aula 101
- `192.168.1.102` - Laboratorio A  
- `192.168.1.103` - Aula 203
- `192.168.1.104` - Aula 304
- `192.168.1.105` - Laboratorio B

### 2. **Preparación**
Asegúrate de que el backend esté corriendo:
```bash
cd backend
node server.js
```

### 3. **Abrir el simulador**
- Abre el archivo `simulador.html` en tu navegador web
- Recomendado: Chrome, Firefox o Edge
- Verás la IP configurada al cargar la página

### 4. **Conectar al servidor**
1. Haz clic en el botón **"Conectar al Servidor"**
2. El simulador busca automáticamente el aula con la IP configurada
3. Si encuentra el aula, carga todos sus sensores
4. El estado cambia a "Conectado" (verde)

### 5. **Simular cambios en sensores**
- **💡 Sensor de Luz**: Usa el toggle para encender/apagar
- **🪟 Sensor de Ventana**: Simula abrir/cerrar ventanas
- **👤 Sensor de Movimiento**: Simula detección de personas

Cada cambio:
1. Se actualiza visualmente en el simulador
2. Se **envía inmediatamente** al servidor (PATCH request)
3. Se actualiza en la base de datos
4. La aplicación web lo detecta automáticamente

### 6. **Heartbeat automático**
- El simulador envía un "pulso" cada 30 segundos automáticamente
- Esto mantiene el aula como "online" en el sistema
- Puedes enviar un heartbeat manual con el botón correspondiente

## 🎯 Flujo de trabajo (Arquitectura Real ESP32)

### Escenario 1: ESP32 detecta cambio físico en sensor
```
1. Sensor físico cambia de estado (ej: se enciende luz)
2. ESP32 detecta cambio en GPIO
3. ESP32 → Servidor: PATCH /sensores/:id/estado { estado: 1 }
4. Servidor actualiza base de datos
5. Aplicación web consulta servidor y ve el cambio
```

### Escenario 2: Usuario controla desde la app web
```
NOTA: En este modelo, el ESP32 NO recibe comandos directos.
El flujo correcto sería:

1. Usuario en app: Click en botón de luz
2. App → Servidor: PATCH /sensores/:id/estado { estado: 1 }
3. Servidor actualiza BD
4. ESP32 debe consultar periódicamente el servidor (polling)
   O usar WebSockets para recibir notificaciones push
```

## 🔍 Registro de actividad

El panel de logs muestra:
- ✅ **Verde**: Operaciones exitosas (conexión, envío de datos)
- ⚠️ **Naranja**: Advertencias importantes
- ❌ **Rojo**: Errores de conexión o API
- ℹ️ **Gris**: Información general del sistema

Ejemplos de logs:
- `🔧 Dispositivo ESP32 iniciado con IP: 192.168.1.103`
- `✅ Identificado como: Aula 203`
- `📡 Cargados 3 sensores`
- `📤 Enviado: Sensor ID 5 → Estado 1`
- `💓 Heartbeat enviado`

## 🛠️ Configuración avanzada

### Cambiar el servidor API
Edita la línea 217 en `simulador.html`:
```javascript
const API_BASE_URL = 'http://localhost:3003'; // Cambiar URL si es necesario
```

### Cambiar la IP del dispositivo simulado
Edita la línea 218 en `simulador.html`:
```javascript
const DEVICE_IP = '192.168.1.105'; // IP del aula a simular
```

### Ajustar frecuencia de heartbeat
Cambiar intervalo de heartbeat (línea ~359):
```javascript
heartbeatInterval = setInterval(sendHeartbeat, 30000); // Milisegundos
```

### Simular múltiples ESP32
Para simular varias placas simultáneamente:
1. Copia `simulador.html` con diferentes nombres
2. Edita la `DEVICE_IP` en cada uno
3. Abre cada archivo en una pestaña diferente del navegador

Ejemplo:
- `simulador-aula101.html` → IP: `192.168.1.101`
- `simulador-aula203.html` → IP: `192.168.1.103`
- `simulador-lab-a.html` → IP: `192.168.1.102`

## 📱 Uso en dispositivos móviles

El simulador es completamente responsive y funciona en:
- 📱 Smartphones
- 📱 Tablets  
- 💻 Laptops
- 🖥️ Monitores de escritorio

## 🐛 Solución de problemas

### Error: "Error al obtener aulas"
- **Causa**: Backend no está corriendo o URL incorrecta
- **Solución**: Verifica que `node server.js` esté ejecutándose en puerto 3003

### Error: "No se encontró aula con IP 192.168.1.XXX"
- **Causa**: No existe un aula con esa IP en la base de datos
- **Solución**: 
  1. Ve a la app web
  2. Crea un aula con esa IP específica
  3. O cambia la `DEVICE_IP` a una IP existente

### Los cambios no se reflejan en la app
- **Causa**: No estás conectado o hay un error de red
- **Solución**: 
  1. Verifica el estado de conexión (debe estar verde)
  2. Revisa los logs para errores
  3. Intenta reconectar

### Sensor no encontrado
- **Causa**: El aula no tiene sensores configurados
- **Solución**: 
  1. Ve a la vista de detalle del aula en la app web
  2. Agrega sensores (luz, ventana, movimiento)
  3. Reconecta el simulador

## 🎨 Diferencias clave con el modelo anterior

### ❌ **Modelo anterior** (Polling desde ESP32):
- ESP32 consultaba constantemente al servidor
- Mayor carga en la red
- Latencia en la detección de cambios

### ✅ **Modelo actual** (Push desde ESP32):
- ESP32 **envía** datos solo cuando hay cambios
- Más eficiente y realista
- Simula el comportamiento real de hardware IoT
- Identificación automática por IP

## 🔐 Seguridad

⚠️ **Nota importante**: Este simulador es solo para desarrollo y pruebas. En producción:
- Implementar autenticación ESP32 (tokens, certificados)
- Validar certificados SSL/TLS
- Usar conexiones HTTPS
- Implementar rate limiting en el backend
- Agregar validación de origen de IPs

## 📚 Referencias

- [ESP32 Documentation](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/)
- [API Endpoints](../INSTRUCCIONES.md#api-endpoints-de-sensores)
- [Backend Routes](../backend/routes/sensores.js)

## 🤝 Contribuir

Para mejorar el simulador:
1. Agregar WebSocket para recepción de comandos
2. Implementar reconexión automática
3. Agregar más tipos de sensores
4. Implementar gráficos en tiempo real
5. Simular latencia de red

---

**Desarrollado para el proyecto Aula IoT - 2025** 🚀
