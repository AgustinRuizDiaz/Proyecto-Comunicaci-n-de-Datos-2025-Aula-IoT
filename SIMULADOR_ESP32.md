# 🔧 Guía de Uso: Simulador ESP32

**Última actualización:** 2025-10-14

---

## 🎯 Comportamiento Actual

### ✅ Características Implementadas

1. **Envío de Datos Solo Cuando Hay Cambios**
   - ❌ NO envía datos periódicamente cada X segundos
   - ✅ Solo envía cuando:
     - Al conectarse por primera vez (estado inicial)
     - Al hacer click en un botón (cambio manual)
     - Al recibir y ejecutar un comando de la app
     - Heartbeat cada 30 segundos (solo para mantener "online")

2. **Estado Inicial: Todos Prendidos**
   - Todos los sensores inician en estado **1** (prendido/activo/abierto)
   - Pin 4: Luz ✅ ON
   - Pin 20: Luz ✅ ON
   - Pin 2: Ventana ✅ ABIERTA
   - Pin 3: Movimiento ✅ DETECTADO

3. **Comunicación Bidireccional**
   - **ESP32 → App**: Envía cambios de sensores
   - **App → ESP32**: Recibe comandos para cambiar estados

---

## 🚀 Cómo Usar

### 1️⃣ **Preparación**

Asegúrate de que el backend esté corriendo:
```bash
cd backend
node server.js
```

Deberías ver:
```
✅ Base de datos conectada
🚀 Servidor corriendo en http://localhost:3003
```

### 2️⃣ **Abrir el Simulador**

1. Navega a: `esp32/simulador-simple.html`
2. Abre el archivo en tu navegador (Chrome, Firefox, Edge)
3. El simulador se conecta automáticamente al cargar

### 3️⃣ **Verificar Conexión Inicial**

Al cargar, verás en los logs:
```
🚀 ESP32 iniciado con IP: 192.168.1.103
📡 Modo: Envío solo cuando hay cambios
💓 Estado inicial enviado
✅ Simulador activo - Todos los sensores prendidos
```

Y en el backend verás:
```
📡 Datos recibidos de ESP32 con IP: 192.168.1.103
  ✅ Heartbeat actualizado para aula Aula 203 (ID: 3)
  📊 Procesando 4 sensores...
  🔍 Sensor encontrado: Sensor de luz (ID: X, Pin: 4)
     Estado anterior: 0 → Nuevo estado: 1
  ✅ Sensor pin 4 actualizado exitosamente a estado 1
  ... (para cada sensor)
```

### 4️⃣ **Probar Cambios desde Simulador**

**Escenario: Apagar una luz desde el simulador**

1. Click en botón "Apagar" de **Sensor de Luz Pin 4**
2. El botón cambia a gris (OFF)
3. Log en simulador: `🔘 Cambio local: Pin 4 desactivado`
4. Se envía automáticamente al servidor
5. Log en simulador: `💓 Cambio enviado correctamente`
6. Backend actualiza la BD
7. **App detecta el cambio en máximo 3 segundos** (gracias al polling)

### 5️⃣ **Probar Cambios desde App Web**

**Escenario: Encender una luz desde la app**

1. Abre la app web en el navegador
2. Navega a Aula 203 (vista de detalle)
3. Click en botón de un sensor de luz
4. Backend encola el comando
5. Simulador recibe el comando en el próximo heartbeat (máx 30s)
6. Log en simulador: `📥 Recibidos 1 comando(s) del servidor`
7. Log en simulador: `🔄 Comando ejecutado: Pin 4 → ON`
8. Simulador envía confirmación al backend
9. Backend actualiza la BD
10. **App detecta el cambio en máximo 3 segundos**

---

## 🔄 Flujos de Datos

### Flujo 1: Simulador → App

```
┌──────────────┐
│  Simulador   │
│  (Click btn) │
└──────┬───────┘
       │ 1. Cambio local
       │ estado: 0 → 1
       ▼
┌──────────────┐
│   sendData() │
│ POST /esp32/ │
│     data     │
└──────┬───────┘
       │ 2. Envía:
       │ {ip, sensores: [{pin, estado}]}
       ▼
┌──────────────┐
│   Backend    │
│ Actualiza BD │
└──────┬───────┘
       │ 3. Guarda nuevo estado
       ▼
┌──────────────┐
│   App Web    │
│   (Polling   │
│   cada 3s)   │
└──────────────┘
       │ 4. GET /sensores/aula/3
       ▼
    UI actualizada ✅
```

### Flujo 2: App → Simulador

```
┌──────────────┐
│   App Web    │
│  (Click btn) │
└──────┬───────┘
       │ 1. PATCH /sensores/:id/estado
       ▼
┌──────────────┐
│   Backend    │
│  Encola cmd  │
└──────┬───────┘
       │ 2. commandQueue.enqueue()
       │    NO actualiza BD aún
       ▼
    (Espera confirmación ESP32)
       │
┌──────┴───────┐
│  Simulador   │
│  Heartbeat   │
│  cada 30s    │
└──────┬───────┘
       │ 3. POST /esp32/data
       │    (heartbeat)
       ▼
┌──────────────┐
│   Backend    │
│  Retorna cmd │
└──────┬───────┘
       │ 4. Response: {commands: [...]}
       ▼
┌──────────────┐
│  Simulador   │
│ Ejecuta cmd  │
└──────┬───────┘
       │ 5. Cambia estado local
       │    Actualiza UI
       ▼
┌──────────────┐
│  sendData()  │
│ Confirmación │
└──────┬───────┘
       │ 6. POST /esp32/data
       │    con nuevo estado
       ▼
┌──────────────┐
│   Backend    │
│ Actualiza BD │
└──────┬───────┘
       │ 7. Ahora SÍ guarda
       ▼
┌──────────────┐
│   App Web    │
│  Ve cambio   │
└──────────────┘
    (en máx 3s) ✅
```

---

## 📊 Tiempos de Sincronización

| Acción | Tiempo Máximo |
|--------|---------------|
| **Simulador → App** | 3 segundos (polling app) |
| **App → Simulador** | 30 segundos (heartbeat ESP32) |
| **Confirmación ESP32 → App** | 3 segundos adicionales |
| **Heartbeat (mantener online)** | Cada 30 segundos |

**Total App → Simulador → App**: Máximo **33 segundos**

---

## 🎨 Logs del Simulador

### Estados del Badge
- 🟡 **"Enviando datos..."**: Enviando request al backend
- 🟢 **"Activo"**: Conectado y funcionando normalmente
- 🔴 **"Error"**: Problema de conexión o API

### Tipos de Logs
- ✅ **Verde** (success): Operaciones exitosas
- ℹ️ **Azul** (info): Información general
- ⚠️ **Naranja** (error): Errores importantes

### Ejemplos de Logs
```
🚀 ESP32 iniciado con IP: 192.168.1.103
📡 Modo: Envío solo cuando hay cambios
💓 Estado inicial enviado
✅ Simulador activo - Todos los sensores prendidos
🔘 Cambio local: Pin 4 desactivado
💓 Cambio enviado correctamente
📥 Recibidos 1 comando(s) del servidor
🔄 Comando ejecutado: Pin 20 → OFF
💓 Heartbeat enviado
```

---

## 🐛 Solución de Problemas

### ❌ Error: "Error al enviar datos"

**Posibles causas:**
1. Backend no está corriendo
2. Puerto incorrecto (debe ser 3003)
3. CORS bloqueando las peticiones

**Solución:**
```bash
# Verificar que el backend esté corriendo
cd backend
node server.js

# Debe mostrar: "Servidor corriendo en http://localhost:3003"
```

### ❌ "No se encontró aula con IP 192.168.1.103"

**Causa:** El aula no existe en la BD

**Solución:**
1. Abre la app web
2. Login como admin
3. Crea el Aula 203 con IP `192.168.1.103`
4. Recarga el simulador

### ❌ "Sensor pin X no encontrado en BD"

**Causa:** El aula no tiene sensores con esos pines

**Solución:**
1. Abre la app web
2. Ve a Aula 203 (detalle)
3. Agrega los sensores:
   - Pin 4: Sensor de luz
   - Pin 20: Sensor de luz
   - Pin 2: Sensor de ventana
   - Pin 3: Sensor de movimiento
4. Recarga el simulador

### ⚠️ Los cambios de la app no llegan al simulador

**Causa:** Heartbeat demasiado largo (30s)

**Solución temporal:**
- Espera hasta 30 segundos para que el simulador consulte comandos
- O haz click en cualquier botón del simulador (fuerza consulta inmediata)

**Solución definitiva (opcional):**
- Reducir `HEARTBEAT_INTERVAL` a 5000 (5 segundos) en línea 214 del HTML

---

## ⚙️ Configuración Avanzada

### Cambiar IP del Dispositivo

Línea 213 del HTML:
```javascript
const DEVICE_IP = '192.168.1.105'; // Cambiar según el aula
```

### Cambiar URL del Backend

Línea 212 del HTML:
```javascript
const API_BASE_URL = 'http://localhost:5000'; // Si backend en otro puerto
```

### Reducir Tiempo de Heartbeat

Línea 214 del HTML:
```javascript
const HEARTBEAT_INTERVAL = 5000; // De 30s a 5s para respuesta más rápida
```

⚠️ **Advertencia**: Menos tiempo = más requests al servidor

---

## ✅ Checklist de Verificación

Antes de usar el simulador, verifica:

- [ ] Backend corriendo en puerto 3003
- [ ] Aula 203 existe con IP 192.168.1.103
- [ ] Aula 203 tiene 4 sensores (pins 4, 20, 2, 3)
- [ ] App web corriendo en puerto 5174
- [ ] Navegador moderno (Chrome/Firefox/Edge)
- [ ] Consola del navegador abierta (F12) para ver errores

---

## 🎯 Testing Completo

### Test 1: Conexión Inicial
1. Abrir simulador
2. Verificar badge "Activo" (verde)
3. Verificar ID del aula aparece
4. Verificar todos los sensores en verde (prendidos)

### Test 2: Cambio desde Simulador
1. Click en "Apagar" de Luz Pin 4
2. Botón cambia a gris
3. Log muestra "Cambio enviado"
4. Abrir app web → Aula 203
5. Esperar máx 3 segundos
6. Verificar luz Pin 4 apagada en app

### Test 3: Cambio desde App
1. Abrir app web → Aula 203
2. Click en sensor de Luz Pin 20
3. Esperar máx 30 segundos
4. En simulador, log muestra "Comando ejecutado"
5. Botón cambia a correspondiente estado
6. Volver a app, verificar cambio en máx 3s

### Test 4: Aula Offline
1. Cerrar el simulador
2. Esperar 2 minutos
3. En app, aula debe mostrar "Fuera de línea"
4. Todos los sensores en 0 (apagados)
5. Botones deshabilitados (grises)

---

**¡Todo listo para usar! 🚀**
