# Pasos para probar el sistema ESP32

## 1. Iniciar el Backend (Terminal 1)
```powershell
cd "c:\Users\ivand\Documents\Universidad\Quinto Año (2025)\Comunicación de Datos\GestorAulas\backend"
node server.js
```

**Deberías ver:**
- ✅ Servidor corriendo en puerto 3003
- Logs cada vez que el ESP32 envíe datos

---

## 2. Iniciar el Frontend (Terminal 2)
```powershell
cd "c:\Users\ivand\Documents\Universidad\Quinto Año (2025)\Comunicación de Datos\GestorAulas\frontend"
npm run dev
```

**Deberías ver:**
- ✅ Servidor frontend en http://localhost:5174

---

## 3. Prueba Manual con Script (Opcional)
```powershell
cd "c:\Users\ivand\Documents\Universidad\Quinto Año (2025)\Comunicación de Datos\GestorAulas\backend"
node test-esp32.js
```

**Deberías ver:**
- Datos enviados
- Respuesta del servidor
- Estado actual de los sensores

---

## 4. Abrir Simulador ESP32
1. Abrir en navegador: `c:\Users\ivand\Documents\Universidad\Quinto Año (2025)\Comunicación de Datos\GestorAulas\esp32\simulador-simple.html`
2. Verificar que dice "Activo" en el badge
3. Click en cualquier botón (ej: Luz Pin 4)
4. Ver logs en la consola del navegador y en el terminal del backend

---

## 5. Abrir App y Verificar
1. Ir a http://localhost:5174
2. Login con tu usuario
3. Ir a "Aulas" → "Aula 203"
4. **Abrir DevTools (F12) → Network tab**
5. Deberías ver requests cada 3 segundos a `/sensores/aula/3`

---

## 6. Probar el Flujo Completo

### HTML → App:
1. Click en botón del simulador (ej: Luz Pin 4 ON)
2. Ver en logs del backend: "✅ Sensor pin 4 actualizado exitosamente a estado 1"
3. **Esperar máximo 3 segundos**
4. La app debería reflejar el cambio automáticamente

### App → HTML:
1. Click en sensor en la app
2. Ver en logs del backend: "📤 Comando encolado para ESP32..."
3. En máximo 5 segundos, el simulador ejecutará el comando
4. En máximo 3 segundos más, la app mostrará el cambio

---

## Logs Esperados en Backend

Cuando el simulador envía datos:
```
📡 Datos recibidos de ESP32 con IP: 192.168.1.103
  ✅ Heartbeat actualizado para aula Aula 203 (ID: 3)
  📊 Procesando 4 sensores...
  🔍 Sensor encontrado: Sensor de luz (ID: X, Pin: 4)
     Estado anterior: 0 → Nuevo estado: 1
  ✅ Sensor pin 4 actualizado exitosamente a estado 1
  ...
```

---

## Troubleshooting

### No se ven cambios en la app:
- ✅ Verificar que el backend esté corriendo
- ✅ Verificar que el frontend esté corriendo
- ✅ Abrir DevTools y ver si hay requests cada 3 segundos
- ✅ Ver si hay errores en console del navegador
- ✅ Hacer un **hard refresh** (Ctrl+Shift+R) en la app

### El simulador no se conecta:
- ✅ Verificar que el backend esté en puerto 3003
- ✅ Ver errores en la consola del navegador del simulador
- ✅ Verificar que la IP en el simulador sea 192.168.1.103

### Backend muestra "Sensor no encontrado":
- ✅ Verificar que existan sensores con esos pines en la BD
- ✅ Ejecutar: `cd backend && node scripts/initDatabase.js`
