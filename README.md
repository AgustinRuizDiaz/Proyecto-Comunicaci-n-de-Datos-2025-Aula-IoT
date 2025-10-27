# 🏫 Sistema de Gestión de Aulas IoT

**Universidad Nacional del Nordeste (UNNE)**  
**Materia:** Comunicación de Datos 2025  
**Autor:** Agustín Ruiz Díaz

Sistema full-stack para monitoreo y control de aulas inteligentes con dispositivos ESP32.

---

## ⚡ INICIO RÁPIDO

### 1️⃣ Iniciar Backend (Terminal 1)
```bash
cd backend
node server.js
```
✅ **Servidor corriendo en:** http://localhost:3003

### 2️⃣ Iniciar Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
✅ **Aplicación corriendo en:** http://localhost:5173

### 3️⃣ Acceder a la Aplicación
- **URL:** http://localhost:5173/login
- **Admin:** `ADMIN001` / `admin123`
- **Operario:** `OP001` / `operario123`

---

## 🏗️ Arquitectura del Proyecto

```
📁 GestorAulas/
├── backend/              # Node.js + Express + SQLite
│   ├── server.js        # Servidor principal
│   ├── database.js      # Configuración BD
│   ├── models/          # Modelos de datos
│   ├── routes/          # Rutas API
│   ├── middleware/      # Autenticación JWT
│   └── scripts/         # Scripts de inicialización
├── frontend/            # React + Vite + Tailwind
│   ├── src/
│   │   ├── pages/       # Vistas principales
│   │   ├── components/  # Componentes reutilizables
│   │   ├── services/    # API services
│   │   └── contexts/    # Auth y Socket contexts
│   └── public/          # Archivos estáticos
└── esp32/               # Código ESP32 (real y simulado)
    ├── esp32_real.ino   # Código Arduino
    └── simulador-simple.html  # Simulador web
```

---

## 🎯 Funcionalidades Implementadas

### ✅ Módulos Disponibles

#### 1. **Usuarios** (Solo Admin)
- CRUD completo de usuarios
- Roles: Administrador / Operario
- Autenticación JWT

#### 2. **Aulas**
- 5 aulas predefinidas
- Estados: Online / Offline
- Indicadores visuales de conexión
- Búsqueda y filtrado

#### 3. **Sensores**
- **Sensor de luz:** Control ON/OFF (admin y operarios)
- **Sensor de ventana:** Solo lectura
- **Sensor de movimiento:** Solo lectura
- Estados actualizables desde ESP32

#### 4. **Registros de Historial** ⭐
- Registro automático de todos los cambios
- Tipos de actuador:
  - `usuario`: Cambio manual desde la app
  - `inactividad`: Apagado automático
  - `externo`: Cambio físico detectado por ESP32
- API REST completa con filtros

#### 5. **Simulador ESP32**
- Simulación web sin hardware
- Comunicación HTTP + WebSocket
- Interfaz visual intuitiva
- Ideal para desarrollo y demos

---

## 🔌 Tecnologías

### Backend
- **Node.js** v20.9.0
- **Express.js** 4.18.2
- **SQLite3** 5.1.6
- **Socket.IO** 4.8.1
- **JWT** para autenticación
- **bcryptjs** para hash de contraseñas

### Frontend
- **React** 18.2.0
- **Vite** 4.5.0
- **Tailwind CSS** 3.3.5
- **Axios** para HTTP
- **Socket.IO-client** 4.7.2
- **React Router** 6.17.0

### Hardware (Opcional)
- **ESP32 DevKit V1**
- **Sensores:** LDR, PIR, Reed Switch
- **Actuadores:** Módulos de relé

---

## 📊 Base de Datos (SQLite)

### Tablas Principales

#### `usuarios`
```sql
- id, legajo (UNIQUE), nombre, apellido
- password_hash, rol, estado
- created_at, updated_at
```

#### `aulas`
```sql
- id, nombre (UNIQUE), ip (UNIQUE)
- ultima_senal, created_at, updated_at
```

#### `sensores`
```sql
- id, id_aula, tipo, pin (UNIQUE por aula)
- estado, descripcion
- created_at, updated_at
```

#### `registros` ⭐
```sql
- id, id_sensor, tipo_actuador
- id_usuario (nullable), estado
- fecha_hora
```

---

## 🚀 Guía de Instalación Completa

### Requisitos Previos
- Node.js v18+ ([Descargar](https://nodejs.org/))
- npm (incluido con Node.js)
- Git

### Paso 1: Clonar Repositorio
```bash
git clone https://github.com/AgustinRuizDiaz/Proyecto-Comunicaci-n-de-Datos-2025-Aula-IoT.git
cd Proyecto-Comunicaci-n-de-Datos-2025-Aula-IoT
```

### Paso 2: Configurar Backend
```bash
cd backend
npm install
node scripts/resetDatabase.js  # Crear BD con datos de prueba
node server.js                  # Iniciar servidor
```

### Paso 3: Configurar Frontend
```bash
cd frontend
npm install
npm run dev  # Iniciar aplicación
```

### Paso 4: Acceder
Abre http://localhost:5173 en tu navegador

---

## 🔐 Usuarios de Prueba

| Legajo | Contraseña | Rol | Acceso |
|--------|------------|-----|--------|
| ADMIN001 | admin123 | Administrador | Dashboard, Usuarios, Aulas, Registros |
| OP001 | operario123 | Operario | Aulas, Registros |

---

## 📡 Comunicación en Tiempo Real

### Arquitectura WebSocket

```
App ←→ Backend ←→ ESP32
    Socket.IO WebSocket
    ⚡ Latencia < 200ms
```

### Flujo de Datos

**App → ESP32 (Cambiar sensor):**
1. Usuario hace clic → UI actualiza (optimistic)
2. POST /sensores/:id/estado
3. Backend encola comando → Emite WebSocket
4. ESP32 recibe comando → Ejecuta
5. ESP32 confirma → POST /esp32/data
6. Backend actualiza BD → Emite WebSocket
7. Todos los clientes se actualizan

**ESP32 → App (Cambio físico):**
1. Cambio físico detectado
2. POST /esp32/data
3. Backend actualiza BD → Emite WebSocket
4. Clientes se actualizan instantáneamente

---

## 🧪 Testing y Desarrollo

### Opción 1: Simulador Web (Sin Hardware)
```bash
# Abrir en navegador:
esp32/simulador-simple.html
```

### Opción 2: ESP32 Real (Producción)
Ver documentación completa en `esp32/README.md`

**Hardware requerido:**
- ESP32 DevKit V1
- 2x LDR + resistencias 10kΩ
- 1x PIR HC-SR501
- 2x Reed Switch
- 2x Módulos relé

---

## 📝 Características Avanzadas

### Sistema de Prevención de Duplicados
- Ventana de tiempo para cambios de usuario (10s)
- Ventana para cambios externos (3s)
- Evita registros duplicados ESP32 → App

### Apagado Automático (ESP32 Real)
- 30 segundos sin movimiento → Luces OFF
- Timer se reinicia al detectar movimiento
- App tiene prioridad sobre automatización

### Actualización Granular
- Sin recargas de página
- Actualización optimista de UI
- Solo se actualiza el sensor modificado

---

## 🔍 Solución de Problemas

### Backend no inicia
```bash
# Verificar puerto disponible
netstat -ano | findstr :3003

# Reiniciar backend
cd backend
node server.js
```

### Frontend no carga
```bash
# Limpiar dependencias
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Base de datos corrupta
```bash
cd backend
node scripts/resetDatabase.js  # ⚠️ Borra todos los datos
```

### Aula offline
- Verificar que ESP32/simulador esté conectado
- Esperar 2 minutos sin señal = offline
- Heartbeat cada 30 segundos mantiene online

---

## 📚 Documentación Adicional

### Carpeta Raíz
- ✅ **README.md** - Este archivo (resumen completo)

### Backend (`backend/`)
- ✅ **README.md** - API endpoints, estructura, configuración

### ESP32 (`esp32/`)
- ✅ **README.md** - Código Arduino, simulador, instalación completa

---

## 🔄 Flujo Completo de Trabajo

### Desarrollo
```
1. Iniciar backend (Terminal 1)
2. Iniciar frontend (Terminal 2)
3. Abrir simulador web (navegador)
4. Probar funcionalidades en la app
5. Verificar logs en backend
```

### Producción
```
1. Cargar código en ESP32 real
2. Conectar sensores y relés
3. Actualizar IP del aula en BD
4. Verificar conexión WiFi
5. Probar desde la app
```

---

## 🎉 Próximas Mejoras

- [ ] Interfaz de historial con gráficos
- [ ] Exportar registros a CSV
- [ ] Dashboard con métricas en tiempo real
- [ ] Notificaciones push
- [ ] WiFi Manager para ESP32
- [ ] OTA Updates para ESP32
- [ ] Deep Sleep para ahorro energético
- [ ] Sensores de temperatura y humedad

---

## 📞 Contacto y Soporte

**Repositorio:** [GitHub](https://github.com/AgustinRuizDiaz/Proyecto-Comunicaci-n-de-Datos-2025-Aula-IoT)  
**Branch:** desarrollo  
**Issues:** [Reportar problemas](https://github.com/AgustinRuizDiaz/Proyecto-Comunicaci-n-de-Datos-2025-Aula-IoT/issues)

---

## 📅 Changelog

### v1.0 (Octubre 2025)
- ✅ Sistema de autenticación JWT
- ✅ Gestión de usuarios (CRUD)
- ✅ Módulo de aulas completo
- ✅ Sistema de sensores
- ✅ Registros de historial
- ✅ Comunicación WebSocket en tiempo real
- ✅ Simulador ESP32 web
- ✅ Código ESP32 real
- ✅ Prevención de registros duplicados
- ✅ Apagado automático por inactividad
- ✅ Actualización granular sin recargas

---

**🚀 Sistema listo para producción - Elige simulador (desarrollo) o ESP32 real (producción)**
