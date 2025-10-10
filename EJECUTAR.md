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
│   ├── scripts/      # Scripts de inicialización
│   └── package.json
├── frontend/         # React + Vite
│   ├── src/         # Código fuente
│   ├── public/      # Archivos públicos
│   └── package.json
└── docs/            # Documentación
```

---

## ⚙️ Requisitos Previos

- **Node.js:** Versión 18.x o superior (recomendado: v20.9.0)
- **npm:** Incluido con Node.js
- **Git:** Para clonar el repositorio

---

## 🚀 Inicio Rápido (Desarrollo)

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/AgustinRuizDiaz/Proyecto-Comunicaci-n-de-Datos-2025-Aula-IoT.git
cd Proyecto-Comunicaci-n-de-Datos-2025-Aula-IoT
```

### Paso 2: Backend - Node.js + Express + SQLite

**⚠️ IMPORTANTE:** El backend debe estar corriendo ANTES de iniciar el frontend.

```bash
# Navegar a la carpeta backend
cd backend

# Instalar dependencias
npm install

# Inicializar base de datos con usuarios de prueba
node scripts/resetDatabase.js

# Ejecutar servidor backend
node server.js
```

**✅ Backend ejecutándose en:** http://localhost:3003

**Verificación:** Deberías ver el mensaje:
```
🚀 Servidor corriendo en http://localhost:3003
📊 Base de datos: SQLite conectada
```

### Paso 3: Frontend - React (En otra terminal)

**⚠️ Abrir una NUEVA terminal** sin cerrar la del backend.

```bash
# Navegar a la carpeta frontend
cd frontend

# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev
```

**✅ Frontend ejecutándose en:** http://localhost:5173

**Acceso:** Abre tu navegador en http://localhost:5173

---

## 🔐 Usuarios de Prueba

**Los usuarios se crean automáticamente al ejecutar `node scripts/resetDatabase.js`**

### 👨‍💼 Usuario Administrador
- **Legajo:** `ADMIN001`
- **Contraseña:** `admin123`
- **Rol:** `Administrador`
- **Acceso:** Dashboard completo, gestión de usuarios, estadísticas

### 👷 Usuario Operario
- **Legajo:** `OP001`
- **Contraseña:** `operario123`
- **Rol:** `Operario`
- **Acceso:** Gestión de aulas, visualización de estado

**Nota:** Usa el **legajo** (no nombre de usuario) para iniciar sesión.

---

## 📚 API Endpoints Principales

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar usuario (requiere token de administrador)

### Usuarios (Solo Administradores)
- `GET /usuarios` - Listar todos los usuarios
- `POST /usuarios` - Crear nuevo usuario
- `PUT /usuarios/:id` - Actualizar usuario
- `DELETE /usuarios/:id` - Eliminar usuario

**Nota:** Todos los endpoints requieren autenticación con token JWT (excepto `/auth/login`)

---

## 🔧 Configuración

### Variables de Entorno Backend (.env)
```env
PORT=3003
NODE_ENV=development
JWT_SECRET=gestor_aulas_secret_key_2025
```

### Variables de Entorno Frontend (.env)
```env
VITE_API_URL=http://localhost:3003
VITE_WS_URL=http://127.0.0.1:3003
```

**⚠️ IMPORTANTE:** Los archivos `.env` ya están configurados correctamente. **NO los modifiques** a menos que cambies los puertos intencionalmente.

---

## 🛠️ Comandos Útiles

### Backend (desde carpeta `/backend`)
```bash
# Instalar dependencias
npm install

# Resetear base de datos (ELIMINA todos los datos y crea usuarios de prueba)
node scripts/resetDatabase.js

# Ejecutar servidor backend
node server.js

# Ver contenido de la base de datos (opcional)
sqlite3 database.sqlite ".tables"
sqlite3 database.sqlite "SELECT * FROM usuarios;"
```

### Frontend (desde carpeta `/frontend`)
```bash
# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar build de producción
npm run preview
```

---

## 📱 Características Implementadas

### ✅ Funcionalidades Completadas
- ✅ **Sistema de autenticación JWT** con roles (Administrador/Operario)
- ✅ **Gestión de usuarios** (CRUD completo, solo administradores)
- ✅ **Interfaz responsiva** con Tailwind CSS
- ✅ **Base de datos SQLite** con scripts de inicialización
- ✅ **Redirección basada en roles** (Admin → Dashboard, Operario → Aulas)

### 🔄 En Desarrollo
- 🔄 **Módulo de Aulas** (gestión de aulas y dispositivos)
- 🔄 **Historial de eventos** (logs de cambios y actividades)
- 🔄 **Integración ESP32** (comunicación IoT via WebSocket)
- 🔄 **Monitoreo en tiempo real** con Socket.IO

### 🔐 Seguridad Implementada
- 🔐 **JWT Authentication** con tokens firmados
- 👥 **Control de acceso basado en roles** (RBAC)
- 🔒 **Middleware de autenticación** en todas las rutas protegidas
- 🛡️ **CORS configurado** para desarrollo seguro
- 🚫 **Validación de contraseñas** con bcrypt

---

## 🚨 Solución de Problemas Comunes

### ❌ Error: "Network Error" al iniciar sesión

**Causa:** El backend no está corriendo o está en un puerto incorrecto.

**Solución:**
1. Verifica que el backend esté corriendo en http://localhost:3003
2. En una terminal, navega a `/backend` y ejecuta: `node server.js`
3. Deberías ver: "🚀 Servidor corriendo en http://localhost:3003"

### ❌ Error: "No se encontró el usuario" o "Credenciales inválidas"

**Causa:** La base de datos no tiene usuarios o las credenciales son incorrectas.

**Solución:**
```bash
# En la carpeta backend
cd backend
node scripts/resetDatabase.js

# Verifica que se crearon los usuarios:
# ✅ Usuario Administrador: ADMIN001 / admin123
# ✅ Usuario Operario: OP001 / operario123
```

### ❌ El frontend no carga (pantalla en blanco)

**Solución:**
1. Verifica que el frontend esté corriendo en http://localhost:5173
2. Abre la consola del navegador (F12) y busca errores
3. Limpia la caché del navegador: Ctrl+Shift+R (Windows) o Cmd+Shift+R (Mac)
4. Si persiste, navega a `/frontend` y ejecuta:
```bash
npm install
npm run dev
```

### ❌ Puerto 3003 ya está en uso

**Solución (Windows PowerShell):**
```powershell
# Ver qué proceso usa el puerto 3003
netstat -ano | findstr :3003

# Matar el proceso (reemplaza PID con el número del proceso)
taskkill /PID <PID> /F
```

**Solución (Linux/Mac):**
```bash
# Ver qué proceso usa el puerto 3003
lsof -i :3003

# Matar el proceso
kill -9 <PID>
```

### ❌ Error: "Cannot find module 'sqlite3'" o similar

**Causa:** Dependencias no instaladas.

**Solución:**
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### ⚠️ Los cambios no se reflejan en el frontend

**Solución:**
1. Detén el servidor (Ctrl+C)
2. Ejecuta nuevamente: `npm run dev`
3. Si persiste, elimina la carpeta `node_modules` y `package-lock.json`, luego:
```bash
npm install
npm run dev
```

---

## � Checklist de Inicio

Antes de empezar a trabajar, verifica:

- [ ] Node.js instalado (v18+): `node --version`
- [ ] npm instalado: `npm --version`
- [ ] Repositorio clonado correctamente
- [ ] Dependencias del backend instaladas (`cd backend && npm install`)
- [ ] Dependencias del frontend instaladas (`cd frontend && npm install`)
- [ ] Base de datos inicializada (`node scripts/resetDatabase.js`)
- [ ] Backend corriendo en http://localhost:3003
- [ ] Frontend corriendo en http://localhost:5173
- [ ] Puedes iniciar sesión con ADMIN001/admin123

---

## 📈 Próximas Funcionalidades

- [ ] **Módulo de Aulas** - CRUD completo con dispositivos asociados
- [ ] **Módulo de Historial** - Logs de eventos y cambios
- [ ] **WebSockets** - Comunicación en tiempo real
- [ ] **Integración ESP32** - Control de luces y sensores
- [ ] **Sistema de alertas** - Notificaciones automáticas
- [ ] **Dashboard con métricas** - Gráficos y estadísticas
- [ ] **Tests automatizados** - Pruebas unitarias e integración

---

## 🤝 Información del Proyecto

**Proyecto:** Gestor de Aulas IoT  
**Materia:** Comunicación de Datos 2025  
**Universidad:** Universidad Nacional del Nordeste (UNNE)  
**Autor:** Agustín Ruiz Díaz  
**Repositorio:** [GitHub - Proyecto Comunicación de Datos 2025](https://github.com/AgustinRuizDiaz/Proyecto-Comunicaci-n-de-Datos-2025-Aula-IoT)

---

## 📞 Soporte

Si encuentras problemas no listados en esta guía:

1. Revisa los mensajes de error en la consola
2. Verifica que ambos servidores (backend y frontend) estén corriendo
3. Consulta el archivo `CAMBIOS_IMPORTANTES.md` para ver cambios recientes
4. Abre un issue en el repositorio de GitHub

---

**Última actualización:** Octubre 2025
