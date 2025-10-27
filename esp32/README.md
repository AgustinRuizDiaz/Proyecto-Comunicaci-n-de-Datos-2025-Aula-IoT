# 📟 ESP32 - Sistema de Gestión de Aulas IoT# � ESP32 - Sistema de Gestión de Aulas IoT



**Documentación completa para ESP32 (físico y simulado)****Documentación completa para ESP32 (físico y simulado)**



Este directorio contiene todo lo necesario para trabajar con ESP32 en el proyecto, tanto con hardware real como con simulador web.Este directorio contiene todo lo necesario para trabajar con ESP32 en el proyecto, tanto con hardware real como con simulador web.



---## 📋 Características



## 📁 Archivos Disponibles- ✅ **Identificación automática por IP**

  - El simulador se identifica con una IP fija (ej: `192.168.1.103`)

### 🔧 Código  - El servidor busca automáticamente el aula correspondiente a esa IP

- **`esp32_real.ino`** - Código Arduino para ESP32 físico (PRODUCCIÓN)  - Simula el comportamiento real de un ESP32 en la red

- **`simulador-simple.html`** - Simulador web del ESP32 (DESARROLLO/DEMO)

- ✅ **Simulación de sensores IoT**

### 📚 Documentación Completa  - Sensor de luz (control on/off)

- **`README.md`** - Este archivo (documentación consolidada)  - Sensor de ventana (abierta/cerrada)

  - Sensor de movimiento (detectado/no detectado)

---

- ✅ **Comunicación unidireccional proactiva**

## 🚀 Quick Start  - El ESP32 **envía** cambios de sensores al servidor

  - El servidor actualiza la base de datos

### Opción A: Simulador Web (Sin Hardware) ⚡  - La aplicación web detecta los cambios automáticamente

  - Sistema de heartbeat automático cada 30 segundos

**Ideal para desarrollo y demos sin necesidad de hardware físico**

- ✅ **Interfaz visual intuitiva**

1. Asegúrate de que el backend esté corriendo:  - Estado de conexión en tiempo real

```bash  - Información del aula identificada (nombre, IP, ID)

cd backend  - Registro de actividad con timestamps

node server.js  - Controles táctiles para cada sensor

```

## 🚀 Cómo usar

2. Abre `simulador-simple.html` en tu navegador

### 1. **Configurar la IP del dispositivo**

3. El simulador se conecta automáticamenteAntes de usar el simulador, edita la línea 218 en `simulador.html`:

```javascript

4. Usa los controles para simular sensoresconst DEVICE_IP = '192.168.1.103'; // Cambiar a la IP del aula que quieres simular

```

**Ventajas del simulador:**

- ✅ Sin costo de hardware**IPs disponibles por defecto:**

- ✅ Deploy instantáneo- `192.168.1.101` - Aula 101

- ✅ Fácil debugging- `192.168.1.102` - Laboratorio A  

- ✅ Múltiples instancias (varias pestañas)- `192.168.1.103` - Aula 203

- `192.168.1.104` - Aula 304

---- `192.168.1.105` - Laboratorio B



### Opción B: ESP32 Real (Hardware Físico) 🔌### 2. **Preparación**

Asegúrate de que el backend esté corriendo:

**Ideal para producción en aulas reales**```bash

cd backend

#### Requisitos de Hardwarenode server.js

- **1x ESP32 DevKit V1** (o compatible)```

- **2x LDR** (fotoresistencias) + 2x resistencias 10kΩ

- **1x PIR HC-SR501** (sensor de movimiento)### 3. **Abrir el simulador**

- **2x Reed Switch** (sensores magnéticos)- Abre el archivo `simulador.html` en tu navegador web

- **2x Módulo relé** (para control de luces)- Recomendado: Chrome, Firefox o Edge

- Protoboard y cables jumper- Verás la IP configurada al cargar la página

- Cable USB para programación

### 4. **Conectar al servidor**

#### Requisitos de Software1. Haz clic en el botón **"Conectar al Servidor"**

- Arduino IDE 2.x o superior2. El simulador busca automáticamente el aula con la IP configurada

- Driver USB-Serial (CH340/CP2102)3. Si encuentra el aula, carga todos sus sensores

4. El estado cambia a "Conectado" (verde)

#### Instalación Rápida

### 5. **Simular cambios en sensores**

1. **Instalar Arduino IDE** y configurar ESP32:- **💡 Sensor de Luz**: Usa el toggle para encender/apagar

   - Tools → Board Manager → Buscar "esp32"- **🪟 Sensor de Ventana**: Simula abrir/cerrar ventanas

   - Instalar versión 2.0.11+- **👤 Sensor de Movimiento**: Simula detección de personas



2. **Instalar librerías** (Tools → Manage Libraries):Cada cambio:

   - **ArduinoJson** (v6.21.3+) by Benoit Blanchon1. Se actualiza visualmente en el simulador

   - **SocketIOclient** (v2.5.1+) by Markus Sattler2. Se **envía inmediatamente** al servidor (PATCH request)

3. Se actualiza en la base de datos

3. **Configurar Board:**4. La aplicación web lo detecta automáticamente

   - Tools → Board → "ESP32 Dev Module"

   - Upload Speed: 921600### 6. **Heartbeat automático**

   - CPU Frequency: 240MHz- El simulador envía un "pulso" cada 30 segundos automáticamente

- Esto mantiene el aula como "online" en el sistema

4. **Cargar código:**- Puedes enviar un heartbeat manual con el botón correspondiente

   - Abrir `esp32_real.ino`

   - Click en Upload (→)## 🎯 Flujo de trabajo (Arquitectura Real ESP32)

   - Abrir Serial Monitor (115200 baud)

### Escenario 1: ESP32 detecta cambio físico en sensor

---```

1. Sensor físico cambia de estado (ej: se enciende luz)

## 📊 Configuración de Pines2. ESP32 detecta cambio en GPIO

3. ESP32 → Servidor: PATCH /sensores/:id/estado { estado: 1 }

| Pin | Tipo | Función | Conexión |4. Servidor actualiza base de datos

|-----|------|---------|----------|5. Aplicación web consulta servidor y ve el cambio

| **36** | Entrada Analógica | Sensor Luz 1 | LDR + 10kΩ a GND |```

| **25** | Entrada Analógica | Sensor Luz 2 | LDR + 10kΩ a GND |

| **34** | Entrada Digital | Movimiento | PIR OUT |### Escenario 2: Usuario controla desde la app web

| **27** | Entrada Digital (PULLUP) | Ventana 1 | Reed Switch |```

| **26** | Entrada Digital (PULLUP) | Ventana 2 | Reed Switch |NOTA: En este modelo, el ESP32 NO recibe comandos directos.

| **22** | Salida Digital | Control Luz 1 | Relé IN1 |El flujo correcto sería:

| **23** | Salida Digital | Control Luz 2 | Relé IN2 |

1. Usuario en app: Click en botón de luz

### Diagrama de Conexión2. App → Servidor: PATCH /sensores/:id/estado { estado: 1 }

3. Servidor actualiza BD

```4. ESP32 debe consultar periódicamente el servidor (polling)

ESP32 DevKit V1   O usar WebSockets para recibir notificaciones push

┌──────────────────────────────────┐```

│                                  │

│  GPIO 36 ───┬─── LDR1 ─── 3.3V  │  Sensor Luz 1## 🔍 Registro de actividad

│             └─── 10kΩ ─── GND   │

│                                  │El panel de logs muestra:

│  GPIO 25 ───┬─── LDR2 ─── 3.3V  │  Sensor Luz 2- ✅ **Verde**: Operaciones exitosas (conexión, envío de datos)

│             └─── 10kΩ ─── GND   │- ⚠️ **Naranja**: Advertencias importantes

│                                  │- ❌ **Rojo**: Errores de conexión o API

│  GPIO 34 ──────── PIR OUT        │  Movimiento- ℹ️ **Gris**: Información general del sistema

│                                  │

│  GPIO 27 ──────── Reed SW1       │  Ventana 1 (PULLUP)Ejemplos de logs:

│  GPIO 26 ──────── Reed SW2       │  Ventana 2 (PULLUP)- `🔧 Dispositivo ESP32 iniciado con IP: 192.168.1.103`

│                                  │- `✅ Identificado como: Aula 203`

│  GPIO 22 ──────── Relé 1 IN      │  Control Luz 1- `📡 Cargados 3 sensores`

│  GPIO 23 ──────── Relé 2 IN      │  Control Luz 2- `📤 Enviado: Sensor ID 5 → Estado 1`

│                                  │- `💓 Heartbeat enviado`

│  5V ────────────── Relés VCC     │

│  GND ───────────── Común GND     │## 🛠️ Configuración avanzada

└──────────────────────────────────┘

```### Cambiar el servidor API

Edita la línea 217 en `simulador.html`:

---```javascript

const API_BASE_URL = 'http://localhost:3003'; // Cambiar URL si es necesario

## 🌐 Configuración de Red```



### WiFi (ESP32 Real)### Cambiar la IP del dispositivo simulado

```cppEdita la línea 218 en `simulador.html`:

// Hardcoded en esp32_real.ino```javascript

SSID: "Personal-388-2.4GHz"const DEVICE_IP = '192.168.1.105'; // IP del aula a simular

Password: "01424678639"```

```

### Ajustar frecuencia de heartbeat

### BackendCambiar intervalo de heartbeat (línea ~359):

```cpp```javascript

IP: 181.228.9.25heartbeatInterval = setInterval(sendHeartbeat, 30000); // Milisegundos

Port: 3003```

Endpoint: /api/esp32/data

```### Simular múltiples ESP32

Para simular varias placas simultáneamente:

**⚠️ Para cambiar:** Editar variables en `esp32_real.ino` y recompilar1. Copia `simulador.html` con diferentes nombres

2. Edita la `DEVICE_IP` en cada uno

---3. Abre cada archivo en una pestaña diferente del navegador



## 🎯 Características ImplementadasEjemplo:

- `simulador-aula101.html` → IP: `192.168.1.101`

### ESP32 Real ✅- `simulador-aula203.html` → IP: `192.168.1.103`

- **Conectividad WiFi automática**- `simulador-lab-a.html` → IP: `192.168.1.102`

- **Comunicación HTTP + WebSocket bidireccional**

- **Control manual desde la app** (prioridad absoluta)## 📱 Uso en dispositivos móviles

- **Apagado automático** (30 segundos sin movimiento)

- **Luces independientes** (cada luz se controla por separado)El simulador es completamente responsive y funciona en:

- **Detección de cambios inteligente** (evita envíos redundantes)- 📱 Smartphones

- **Reconexión automática** (WiFi y WebSocket)- 📱 Tablets  

- **Logs detallados** en Serial Monitor- 💻 Laptops

- 🖥️ Monitores de escritorio

### Simulador Web ✅

- **Sin hardware necesario**## 🐛 Solución de problemas

- **Interfaz visual intuitiva**

- **Comunicación HTTP + WebSocket**### Error: "Error al obtener aulas"

- **Ideal para desarrollo y demos**- **Causa**: Backend no está corriendo o URL incorrecta

- **Controles manuales de todos los sensores**- **Solución**: Verifica que `node server.js` esté ejecutándose en puerto 3003

- **Multi-instancia** (varias pestañas = varios ESP32)

### Error: "No se encontró aula con IP 192.168.1.XXX"

---- **Causa**: No existe un aula con esa IP en la base de datos

- **Solución**: 

## 📡 Protocolo de Comunicación  1. Ve a la app web

  2. Crea un aula con esa IP específica

### Datos Enviados al Backend (HTTP POST)  3. O cambia la `DEVICE_IP` a una IP existente

```json

{### Los cambios no se reflejan en la app

  "ip": "192.168.1.100",- **Causa**: No estás conectado o hay un error de red

  "sensores": [- **Solución**: 

    {"pin": 36, "estado": 1},  // Luz 1 (0=oscuro, 1=luz)  1. Verifica el estado de conexión (debe estar verde)

    {"pin": 25, "estado": 0},  // Luz 2  2. Revisa los logs para errores

    {"pin": 34, "estado": 1},  // Movimiento (0=no, 1=sí)  3. Intenta reconectar

    {"pin": 27, "estado": 0},  // Ventana 1 (0=cerrada, 1=abierta)

    {"pin": 26, "estado": 1},  // Ventana 2### Sensor no encontrado

    {"pin": 22, "estado": 1},  // Relé 1 (0=off, 1=on)- **Causa**: El aula no tiene sensores configurados

    {"pin": 23, "estado": 0}   // Relé 2- **Solución**: 

  ]  1. Ve a la vista de detalle del aula en la app web

}  2. Agrega sensores (luz, ventana, movimiento)

```  3. Reconecta el simulador



### Comandos Recibidos (WebSocket)## 🎨 Diferencias clave con el modelo anterior

```json

{### ❌ **Modelo anterior** (Polling desde ESP32):

  "pin": 22,- ESP32 consultaba constantemente al servidor

  "estado": 1- Mayor carga en la red

}- Latencia en la detección de cambios

```

### ✅ **Modelo actual** (Push desde ESP32):

---- ESP32 **envía** datos solo cuando hay cambios

- Más eficiente y realista

## 🔄 Flujo de Datos Completo- Simula el comportamiento real de hardware IoT

- Identificación automática por IP

```

┌──────────────┐         HTTP POST         ┌──────────────┐## 🔐 Seguridad

│   ESP32      │ ───────────────────────> │   Backend    │

│ (Real/Sim)   │   (cada 2s o cambio)      │  (Node.js)   │⚠️ **Nota importante**: Este simulador es solo para desarrollo y pruebas. En producción:

└──────────────┘                            └──────────────┘- Implementar autenticación ESP32 (tokens, certificados)

       ↑                                           │- Validar certificados SSL/TLS

       │         WebSocket (Socket.IO)             │- Usar conexiones HTTPS

       │       ┌───────────────────────────────────┘- Implementar rate limiting en el backend

       │       │     'esp32:command'- Agregar validación de origen de IPs

       └───────┘     {pin: X, estado: Y}

                     ## 📚 Referencias

┌──────────────┐         WebSocket         ┌──────────────┐

│   Frontend   │ <───────────────────────  │   Backend    │- [ESP32 Documentation](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/)

│  (React App) │    'sensorUpdate'         │              │- [API Endpoints](../INSTRUCCIONES.md#api-endpoints-de-sensores)

└──────────────┘                            └──────────────┘- [Backend Routes](../backend/routes/sensores.js)

```

## 🤝 Contribuir

**Tiempo total de sincronización:**

- **Simulador → App:** 3 segundos (polling)Para mejorar el simulador:

- **App → ESP32 Real:** < 200ms (WebSocket)1. Agregar WebSocket para recepción de comandos

- **ESP32 Real → App:** < 150ms (WebSocket)2. Implementar reconexión automática

3. Agregar más tipos de sensores

---4. Implementar gráficos en tiempo real

5. Simular latencia de red

## 📊 Comparación: Simulador vs ESP32 Real

---

| Característica | Simulador Web | ESP32 Real |

|----------------|---------------|------------|**Desarrollado para el proyecto Aula IoT - 2025** 🚀

| **Plataforma** | HTML + JavaScript | Arduino C++ |
| **Conexión WiFi** | Automática (navegador) | Manual (SSID/Password) |
| **Sensores** | Botones/Toggles | LDR, PIR, Reed Switch |
| **Actuadores** | Indicadores visuales | Relés físicos |
| **Apagado Auto** | ❌ No implementado | ✅ 30 segundos |
| **IP** | Se ingresa manualmente | Se obtiene por DHCP |
| **Debugging** | Console.log() | Serial.println() |
| **Costo** | $0 | ~$15-20 USD |
| **Setup** | Abrir HTML | Arduino IDE + circuito |
| **Use Case** | Desarrollo/Demo | Producción |

**Conclusión:** Ambos usan la misma estructura de datos y backend. Son 100% compatibles.

---

## 🧪 Testing y Verificación

### Simulador Web

1. **Abrir simulador:**
   ```
   Abrir esp32/simulador-simple.html en navegador
   ```

2. **Verificar conexión inicial:**
   - Badge debe mostrar "Activo" (verde)
   - Logs: "🚀 ESP32 iniciado con IP: 192.168.1.103"
   - Logs: "📡 Modo: Envío solo cuando hay cambios"

3. **Probar cambio desde simulador:**
   - Click en botón "Apagar Luz Pin 4"
   - Ver log: "🔘 Cambio local: Pin 4 desactivado"
   - Abrir app web → Aula 203
   - Cambio se refleja en máximo 3 segundos

4. **Probar cambio desde app:**
   - Click en sensor en la app
   - Simulador recibe comando vía WebSocket
   - Log: "📥 Comando recibido: Pin X → Estado Y"
   - UI se actualiza automáticamente

---

### ESP32 Real

1. **Verificar Monitor Serial (115200 baud):**
   ```
   ✓ WiFi conectado
   IP del ESP32: 192.168.X.XXX
   ✓ WebSocket conectado
   ✓ Datos enviados al backend (HTTP 200)
   ```

2. **Probar sensores:**
   - **Movimiento:** Logs "👤 Movimiento: DETECTADO"
   - **Ventana:** Logs "🪟 Ventana 1: ABIERTA"
   - **Luz:** Logs "☀️ Luz 1: 1250"

3. **Probar control desde app:**
   - Click en sensor de luz en la app
   - Serial muestra: "📩 Evento recibido: esp32:command"
   - Serial muestra: "💡 Luz 1 (Pin 22): ENCENDIDA"

4. **Probar apagado automático:**
   - Encender luz desde app
   - NO mover por 30 segundos
   - Serial muestra: "💤 Apagado automático: Luz 1"

---

## 🎨 Uso del Simulador

### Configuración Avanzada

```javascript
// Línea 218 del HTML
const DEVICE_IP = '192.168.1.103'; // Cambiar IP del dispositivo

// Línea 217 del HTML
const API_BASE_URL = 'http://localhost:3003'; // Cambiar URL backend

// Línea 219 del HTML
const HEARTBEAT_INTERVAL = 30000; // Cambiar frecuencia heartbeat (ms)
```

### Simular Múltiples ESP32

Para simular varias placas simultáneamente:

1. Copia `simulador-simple.html` con diferentes nombres
2. Edita la `DEVICE_IP` en cada uno
3. Abre cada archivo en pestañas diferentes

**Ejemplo:**
- `simulador-aula101.html` → IP: `192.168.1.101`
- `simulador-aula203.html` → IP: `192.168.1.103`
- `simulador-lab-a.html` → IP: `192.168.1.102`

### Logs del Simulador

- ✅ **Verde (success):** Operaciones exitosas
- ℹ️ **Azul (info):** Información general
- ⚠️ **Naranja (error):** Errores importantes

**Ejemplos:**
```
🚀 ESP32 iniciado con IP: 192.168.1.103
💓 Estado inicial enviado
🔘 Cambio local: Pin 4 desactivado
📥 Recibidos 1 comando(s) del servidor
🔄 Comando ejecutado: Pin 20 → OFF
```

---

## 🛠️ Instalación Detallada ESP32 Real

### Paso 1: Instalar Arduino IDE

1. Descargar Arduino IDE 2.x desde https://www.arduino.cc/
2. Instalar normalmente
3. Abrir Arduino IDE

### Paso 2: Configurar ESP32 en Arduino IDE

1. Ve a **File → Preferences**
2. En **Additional Board Manager URLs**, agrega:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. Click **OK**
4. Ve a **Tools → Board → Boards Manager**
5. Busca **"esp32"** by Espressif Systems
6. Instala versión **2.0.11+**

### Paso 3: Instalar Librerías

Ve a **Tools → Manage Libraries** e instala:

#### ArduinoJson
- Autor: Benoit Blanchon
- Versión: 6.21.3+
- Para parsear y crear JSON

#### SocketIOclient
- Autor: Markus Sattler (Links2004)
- Versión: 2.5.1+
- Cliente WebSocket para Socket.IO

### Paso 4: Armar Circuito

Sigue el **Diagrama de Conexión** mostrado arriba.

**Notas importantes:**
- LDR usa divisor de tensión (10kΩ a GND)
- Reed Switch usa PULLUP interno del ESP32
- Relés usan lógica inversa (LOW=ON, HIGH=OFF)
- PIR alimentación: 5V o 3.3V según modelo

### Paso 5: Cargar Código

1. Conecta ESP32 por USB
2. Tools → Board → "ESP32 Dev Module"
3. Tools → Port → Selecciona puerto COM
4. Abre `esp32_real.ino`
5. Click en **✓ Verify**
6. Click en **→ Upload**
7. Espera a que termine

### Paso 6: Verificar Funcionamiento

1. Abre **Tools → Serial Monitor**
2. Baud Rate: **115200**
3. Deberías ver logs de conexión y funcionamiento

---

## 🔧 Configuración del Aula en BD

### Verificar IP del ESP32

Una vez conectado, el ESP32 muestra su IP en Serial Monitor. **Anótala.**

### Actualizar Base de Datos

El **Aula Real** ya está configurada con todos los sensores. Solo necesitas actualizar su IP:

```bash
cd backend
node check-esp32-config.js
```

O manualmente en la base de datos:
```sql
UPDATE aulas 
SET ip = '192.168.X.XXX' 
WHERE nombre = 'Aula Real';
```

**Sensores ya configurados en Aula Real:**
- Sensor de luz - Pin 36 (Luz 1)
- Sensor de luz - Pin 25 (Luz 2)
- Sensor de movimiento - Pin 34
- Sensor de ventana - Pin 27 (Ventana 1)
- Sensor de ventana - Pin 26 (Ventana 2)
- Relé - Pin 22 (Control Luz 1)
- Relé - Pin 23 (Control Luz 2)

---

## 🐛 Troubleshooting

### Simulador

#### ❌ "Error al enviar datos"
- Backend no está corriendo
- Puerto incorrecto (debe ser 3003)
- **Solución:** `cd backend && node server.js`

#### ❌ "No se encontró aula con IP"
- El aula no existe en la BD
- **Solución:** Crear aula con esa IP en la app web

#### ⚠️ Cambios de app no llegan al simulador
- Heartbeat demasiado largo (30s)
- **Solución:** Esperar o hacer click en cualquier botón

---

### ESP32 Real

#### ❌ No se conecta al WiFi
- Verificar SSID y password en código
- Asegurarse que es red 2.4GHz (ESP32 no soporta 5GHz)
- **Solución:** Editar `esp32_real.ino` y recompilar

#### ❌ Backend no recibe datos
- Verificar backend corriendo en 181.228.9.25:3003
- Comprobar IP del ESP32 registrada en BD
- **Solución:** Revisar logs del backend

#### ❌ Relés no responden
- Verificar conexiones físicas
- Verificar alimentación 5V
- Recordar lógica inversa (LOW=ON)
- **Solución:** Medir con multímetro

#### ❌ LDR siempre lee 0 o 4095
- Verificar resistencia pull-down 10kΩ
- Verificar conexiones 3.3V y GND
- Usar pines ADC1 (evitar ADC2 con WiFi)
- **Solución:** Revisar circuito

---

## ⚙️ Lógica de Funcionamiento ESP32 Real

### Inicio (setup)
1. Inicializar pines (relés OFF, sensores INPUT)
2. Conectar WiFi → obtener IP por DHCP
3. Conectar WebSocket → unirse a sala `esp32:{IP}`
4. Enviar estado inicial al backend

### Bucle Principal (loop)
1. Mantener WebSocket activo
2. Leer sensores físicos
3. Detectar cambios significativos
4. Enviar datos si hay cambios o pasaron 2 segundos
5. Verificar timer de apagado automático (30s)
6. Delay 100ms

### Al Recibir Comando
1. WebSocket recibe evento `esp32:command`
2. Parsear JSON: `{pin: X, estado: Y}`
3. Actualizar estado del relé correspondiente
4. Aplicar cambio físico (`digitalWrite`)
5. Reiniciar timer si se encendió luz
6. Enviar confirmación al backend

### Apagado Automático
```
Si (tiempo desde último movimiento > 30 segundos):
  - Apagar todas las luces encendidas
  - Enviar actualización al backend
  - App se actualiza automáticamente vía WebSocket
```

---

## 📈 Próximas Mejoras

### Simulador
- [ ] Guardar IP en LocalStorage
- [ ] Modo "apagado automático" simulado
- [ ] Gráficos de sensores en tiempo real

### ESP32 Real
- [ ] WiFi Manager (configurar sin recompilar)
- [ ] OTA Updates (actualizar firmware por WiFi)
- [ ] Deep Sleep (ahorro energía)
- [ ] Sensores adicionales (temperatura, humedad)
- [ ] Display OLED para status local
- [ ] Credenciales en EEPROM (no hardcoded)

---

## 📚 Notas Técnicas

### Lógica de Relés
Los módulos de relé típicos usan **lógica inversa**:
- `digitalWrite(pin, LOW)` → Relé ENCENDIDO (luz ON)
- `digitalWrite(pin, HIGH)` → Relé APAGADO (luz OFF)

### Pines ADC del ESP32
ESP32 tiene dos controladores ADC:
- **ADC1** (Pines 32-39): ✅ Funciona con WiFi activo
- **ADC2** (Pines 0,2,4,12-15,25-27): ⚠️ No disponible con WiFi

Por eso usamos **Pin 36** (ADC1) para LDR1. El Pin 25 (ADC2) requiere manejo especial.

### Pull-up Resistors
Los sensores Reed Switch usan `INPUT_PULLUP`:
- **Ventana CERRADA:** Imán cerca → Contacto cerrado → `LOW`
- **Ventana ABIERTA:** Imán lejos → Contacto abierto → `HIGH`

---

## 📞 Soporte

**Proyecto:** Sistema de Gestión de Aulas IoT  
**Repositorio:** [GitHub](https://github.com/AgustinRuizDiaz/Proyecto-Comunicaci-n-de-Datos-2025-Aula-IoT)  
**Branch:** desarrollo

---

## ✅ Checklist de Verificación

### Simulador Web
- [ ] Backend corriendo en puerto 3003
- [ ] Simulador abierto en navegador
- [ ] Badge "Activo" (verde)
- [ ] Logs muestran conexión exitosa

### ESP32 Real
- [ ] Arduino IDE instalado
- [ ] Librerías instaladas (ArduinoJson, SocketIOclient)
- [ ] Circuito armado según diagrama
- [ ] Código cargado sin errores
- [ ] Serial Monitor muestra WiFi conectado
- [ ] Serial Monitor muestra WebSocket conectado
- [ ] IP del ESP32 actualizada en BD

---

**🎉 Sistema ESP32 listo - Elige simulador (desarrollo) o hardware real (producción)**
