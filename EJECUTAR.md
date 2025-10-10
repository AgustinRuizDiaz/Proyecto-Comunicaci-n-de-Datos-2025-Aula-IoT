# 🚀 Guía de Ejecución - Gestor de Aulas IoT

## 📋 Descripción del Proyecto

**Gestor de Aulas IoT** es una aplicación full-stack para monitoreo y control de aulas inteligentes con dispositivos ESP32.

- **Backend:** Node.js + Express.js + SQLite
- **Frontend:** React + Vite + Tailwind CSS
- **Autenticación:** JWT con roles (Administrador/Operario)
- **Base de datos:** SQLite para desarrollo
- **Comunicación:** REST API (preparado para WebSockets y ESP32)

## 🏗️ Arquitectura

```
📁 Proyecto Completo
├── backend/           # Node.js + Express.js
│   ├── models/       # Modelos de datos
│   ├── routes/       # Rutas de la API
│   ├── middleware/   # Middleware personalizado
│   └── package.json
├── frontend/         # React + Vite
└── docs/            # Documentación
```

---

## 🚀 Inicio Rápido (Desarrollo)

### 1. Backend - Node.js + Express + SQLite

```bash
# Instalar dependencias
cd backend
npm install

# Inicializar base de datos (crea tablas y datos de ejemplo)
npm run init-db

# Ejecutar servidor backend (modo desarrollo)
npm run dev
```

**✅ Backend ejecutándose en:** http://localhost:3002

### 2. Frontend - React

```bash
# Instalar dependencias
cd frontend
npm install

# Ejecutar servidor frontend
npm run dev
```

**✅ Frontend ejecutándose en:** http://localhost:5173

---

## 🔐 Usuarios de Prueba

### Usuario Administrador
- **Legajo:** `ADMIN001`
- **Nombre:** `Administrador Sistema`
- **Apellido:** `Sistema`
- **Contraseña:** `admin123`
- **Rol:** `Administrador`

### Usuario Operario
- **Legajo:** `OP001`
- **Nombre:** `Operario`
- **Apellido:** `Ejemplo`
- **Contraseña:** `operario123`
- **Rol:** `Operario`

---

## 📚 API Endpoints Principales

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/profile` - Obtener perfil del usuario autenticado

### Aulas
- `GET /api/aulas` - Listar todas las aulas
- `GET /api/aulas/:id` - Obtener aula específica
- `POST /api/aulas` - Crear nueva aula
- `PUT /api/aulas/:id` - Actualizar aula
- `DELETE /api/aulas/:id` - Eliminar aula
- `GET /api/aulas/search?q=query` - Buscar aulas
- `GET /api/aulas/stats` - Estadísticas de aulas

### Usuarios (Solo Administradores)
- `GET /api/usuarios` - Listar todos los usuarios
- `GET /api/usuarios/stats` - Estadísticas de usuarios
- `POST /api/usuarios` - Crear nuevo usuario
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario

---

## 🔧 Configuración

### Variables de Entorno Backend (.env)
```env
PORT=3002
NODE_ENV=development
JWT_SECRET=gestor_aulas_secret_key_2025
```

### Variables de Entorno Frontend (.env)
```env
VITE_API_URL=http://127.0.0.1:3002
VITE_WS_URL=ws://127.0.0.1:3002
```

---

## 🛠️ Comandos Útiles

### Backend
```bash
# Instalar dependencias
npm install

# Inicializar base de datos con datos de ejemplo
npm run init-db

# Ejecutar en modo desarrollo (con auto-reload)
npm run dev

# Ejecutar en modo producción
npm start

# Ver logs del servidor
npm run logs
```

### Frontend
```bash
# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar build de producción
npm run preview

# Ejecutar tests
npm run test

# Limpiar caché de Vite
npm run clear-cache
```

---

## 📱 Características de la Aplicación

### Funcionalidades del Frontend
- ✅ **Autenticación completa** con manejo de sesiones
- ✅ **Gestión de aulas** (CRUD completo)
- ✅ **Búsqueda y filtrado** de aulas
- ✅ **Estadísticas** en tiempo real
- ✅ **Interfaz responsiva** (mobile-first)
- ✅ **PWA** (Progressive Web App)
- ✅ **Gestión de usuarios** (solo administradores)
- 🔄 **Monitoreo en tiempo real** (preparado para WebSockets)
- 🔄 **Control de dispositivos IoT** (preparado para ESP32)

### Seguridad Implementada
- 🔐 **JWT Authentication** con expiración automática
- 👥 **Control de roles** (Administrador/Operario)
- 🔒 **Validación de datos** en todos los endpoints
- 🛡️ **CORS configurado** para desarrollo seguro
- 🚫 **Manejo seguro de errores** (sin exposición de datos sensibles)

---

## 🚨 Solución de Problemas

### Problema: Frontend no se conecta al backend
**Solución:** Verificar que ambas aplicaciones estén corriendo y en los puertos correctos:
- Backend: http://localhost:3002
- Frontend: http://localhost:5173

### Problema: Error de autenticación
**Solución:**
1. Verificar que el backend esté inicializado con usuarios de ejemplo
2. Usar las credenciales correctas desde la sección "Usuarios de Prueba"
3. Verificar que el token JWT no esté expirado

### Problema: Base de datos no se inicializa
**Solución:**
```bash
# Limpiar base de datos existente
rm backend/database.sqlite

# Re-inicializar
cd backend
npm run init-db
```

### Problema: Frontend muestra errores de red
**Solución:**
1. Reiniciar el servidor del backend
2. Limpiar caché del navegador (Ctrl+Shift+R)
3. Verificar configuración de CORS en el backend

---

## 📈 Próximas Funcionalidades

- [ ] **WebSockets** para monitoreo en tiempo real
- [ ] **Integración con ESP32** para control de dispositivos IoT
- [ ] **Sistema de reservas** de aulas
- [ ] **Reportes avanzados** y exportación
- [ ] **Notificaciones push** para eventos importantes
- [ ] **Tests automatizados** (unitarios e integración)
- [ ] **Despliegue en producción** (Docker + Nginx)

---

## 🤝 Contribución

1. Crear rama para nuevas funcionalidades
2. Implementar cambios siguiendo las convenciones del proyecto
3. Ejecutar pruebas antes de hacer merge
4. Documentar cambios en este archivo si es necesario

---

**📞 Contacto:** Agustín Ruiz Díaz - Proyecto Comunicación de Datos 2025
