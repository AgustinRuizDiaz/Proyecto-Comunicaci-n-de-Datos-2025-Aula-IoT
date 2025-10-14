# 🔧 CAMBIOS IMPORTANTES - Limpieza y Simplificación del Proyecto

**Última actualización:** 2025-10-14  
**Estado:** Sistema simplificado y funcional con polling optimizado

---

## 🆕 NUEVO: Sensores en Estado 0 cuando Aula está Offline (14 Oct 2025)

### ✅ Implementación
Ahora cuando un aula está **Fuera de línea** (sin señal por más de 2 minutos):
- ✅ Todos los sensores se muestran automáticamente en estado **0 (apagado)**
- ✅ Los botones de control están **deshabilitados** (gris, no clickeables)
- ✅ Tooltip muestra "Aula fuera de línea" al pasar el mouse
- ✅ El backend también bloquea cambios como capa extra de seguridad
- ✅ No hay mensajes molestos, el UI es claro visualmente

### 📝 Cambios Técnicos

#### Backend (`backend/routes/sensores.js`)
1. **GET `/sensores/aula/:id_aula`**: 
   - Verifica si el aula está offline
   - Si está offline → retorna todos los sensores con `estado: 0`
   - Si nunca ha enviado señal → retorna todos con `estado: 0`

2. **PATCH `/sensores/:id/estado`**:
   - Valida si el aula está online antes de encolar comandos
   - Si está offline → retorna error 503 con mensaje descriptivo
   - Bloquea cambios desde la app cuando el aula está offline

#### Frontend (`frontend/src/pages/AulaDetail.jsx`)
1. **`loadSensores()`**:
   - Verifica estado online del aula
   - Fuerza sensores a estado 0 si está offline
   
2. **`handleToggleSensorEstado()`**:
   - Si el aula está offline, no hace nada (botón ya deshabilitado)
   
3. **Botón de control de sensor**:
   - `disabled={!isOnline(aula?.ultima_senal)}` → Deshabilitado si offline
   - Estilos visuales: gris, cursor-not-allowed, opacity reducida
   - Tooltip: "Aula fuera de línea" cuando está deshabilitado

### 🎯 Comportamiento

| Estado del Aula | Sensores Mostrados | Botones | Tooltip | Cambios Permitidos |
|-----------------|-------------------|---------|---------|-------------------|
| **Online** (<2 min) | Estado real | ✅ Habilitados | "Encender/Apagar" | ✅ Sí |
| **Offline** (≥2 min) | Todos en 0 | ❌ Deshabilitados | "Aula fuera de línea" | ❌ No |
| **Sin señal** | Todos en 0 | ❌ Deshabilitados | "Aula fuera de línea" | ❌ No |

---

## 🆕 Fix de Recarga Innecesaria (14 Oct 2025)

### ❌ Problema
La página de detalle del aula se recargaba visualmente cada 3-10 segundos debido al polling automático, causando parpadeo molesto.

### ✅ Solución
Las actualizaciones automáticas ahora son **silenciosas** (sin loading spinner), mientras que las acciones del usuario sí muestran feedback visual.

### 📝 Cambios Técnicos
- `loadAulaData(showLoading)` y `loadSensores(showLoading)` ahora aceptan parámetro
- **Polling**: `showLoading = false` → Sin parpadeo
- **Acciones usuario**: `showLoading = true` → Con feedback visual

---

## ⚡ CÓMO EJECUTAR LA APLICACIÓN

### 🚨 **MUY IMPORTANTE: Debes iniciar AMBOS servidores**

**NO funcionará si solo inicias uno.** Necesitas backend Y frontend corriendo al mismo tiempo.

### Terminal 1 - Backend:
```bash
cd backend
node server.js
```
✅ Espera ver: "🚀 Servidor corriendo en http://localhost:3003"

### Terminal 2 - Frontend:
```bash
cd frontend  
npm run dev
```
✅ Espera ver: "➜ Local: http://localhost:5173/"

### Ahora abre el navegador:
http://localhost:5173/login

---

## ✅ CAMBIOS REALIZADOS

### 1. **Archivos Eliminados (Backend)**
Se eliminaron archivos duplicados y de prueba que causaban confusión:

- ❌ `server-clean.js` - Duplicado
- ❌ `server-simple.js` - Versión antigua
- ❌ `simpleServer.js` - Duplicado
- ❌ `socketServer.js` - Solo pruebas
- ❌ `testSocket.js` - Solo pruebas

**Archivo principal:** ✅ `server.js` (único servidor)

---

### 2. **Sistema de Autenticación Simplificado**

#### **ANTES:**
- ❌ Sistema de respaldo con tokens falsos (`fake-jwt-token-admin`)
- ❌ Lógica compleja en frontend para simular login
- ❌ Backend aceptaba tokens falsos en modo desarrollo

#### **DESPUÉS:**
- ✅ Solo autenticación JWT real
- ✅ Login siempre usa el backend
- ✅ Sin tokens falsos ni sistemas de respaldo

**Archivos modificados:**
- `frontend/src/services/api.js` - Eliminado sistema de respaldo
- `backend/middleware/auth.js` - Eliminado soporte de tokens falsos

---

### 3. **Control de Acceso por Roles**

#### **Administradores:**
- ✅ Acceso completo a Gestión de Usuarios
- ✅ Pueden crear, editar y eliminar usuarios
- ✅ Ven opción "USUARIOS" en menú de navegación
- ✅ Redirigen a Dashboard (/) al hacer login

#### **Operarios:**
- ❌ NO tienen acceso a Gestión de Usuarios
- ❌ NO ven opción "USUARIOS" en menú
- ✅ Solo acceden a Aulas e Historial
- ✅ Redirigen a Aulas (/classrooms) al hacer login

**Archivos modificados:**
- `frontend/src/pages/Login.jsx` - Redirección según rol
- Rutas protegidas ya existían correctamente en `App.jsx`

---

### 4. **Protección de Rutas Backend**

Todas las rutas de `/usuarios` requieren:
1. ✅ Token JWT válido (middleware `authenticateToken`)
2. ✅ Rol de administrador (middleware `requireAdmin`)

**Archivo:** `backend/routes/usuarios.js`

---

## 🔐 CREDENCIALES DE PRUEBA

### Usuario Administrador:
```
Legajo: ADMIN001
Contraseña: admin123
```

### Usuario Operario:
```
Legajo: OP001
Contraseña: operario123
```

---

## 🚀 CÓMO USAR EL SISTEMA

### 1. **Iniciar Backend:**
```bash
cd backend
node server.js
```
**Corre en:** http://localhost:3003

### 2. **Iniciar Frontend:**
```bash
cd frontend
npm run dev
```
**Corre en:** http://localhost:5173

### 3. **Login como Administrador:**
1. Ir a: http://localhost:5173/login
2. Legajo: `ADMIN001`
3. Contraseña: `admin123`
4. → Redirige a Dashboard
5. → Puede acceder a "USUARIOS" en el menú

### 4. **Login como Operario:**
1. Ir a: http://localhost:5173/login
2. Legajo: `OP001`
3. Contraseña: `operario123`
4. → Redirige directamente a Aulas
5. → NO ve opción "USUARIOS" en el menú

---

## 🔍 DIAGNÓSTICO

Si encuentras problemas:

1. **Página de Diagnóstico:**  
   http://localhost:5173/diagnostico.html

2. **Limpiar Cache:**  
   http://localhost:5173/clear-cache.html

3. **Verificar Backend:**  
   ```bash
   curl http://localhost:3003/
   ```

---

## 📋 ESTRUCTURA FINAL

### Backend (Limpio):
```
backend/
├── server.js              ✅ Único servidor
├── database.js            ✅ Base de datos
├── .env                   ✅ Configuración
├── models/
│   └── Usuario.js         ✅ Modelo de usuario
├── routes/
│   ├── auth.js            ✅ Login/Registro
│   └── usuarios.js        ✅ CRUD usuarios (solo admin)
├── middleware/
│   └── auth.js            ✅ JWT puro (sin tokens falsos)
└── scripts/
    ├── initDatabase.js    ✅ Inicializar BD
    └── resetDatabase.js   ✅ Limpiar BD
```

### Frontend:
```
frontend/src/
├── App.jsx                ✅ Rutas protegidas
├── pages/
│   ├── Login.jsx          ✅ Redirección por rol
│   ├── Users.jsx          ✅ Solo para admin
│   ├── Classrooms.jsx     ✅ Para todos
│   └── History.jsx        ✅ Para todos
├── services/
│   └── api.js             ✅ Sin sistema de respaldo
└── components/
    ├── Navbar.jsx         ✅ Menú según rol
    └── BottomNavigation.jsx ✅ Menú móvil según rol
```

---

## ⚠️ IMPORTANTE

### Lo que CAMBIÓ:
- ❌ Ya NO funciona el login sin backend
- ❌ Ya NO existen tokens falsos
- ✅ Backend DEBE estar corriendo para usar la app
- ✅ Login siempre valida contra base de datos real

### Lo que se MANTUVO:
- ✅ Estructura de rutas protegidas
- ✅ Sistema de roles (admin/operario)
- ✅ Base de datos con usuarios de prueba
- ✅ Socket.IO configurado
- ✅ Componentes de navegación según rol

---

## 🎯 PRÓXIMOS PASOS SUGERIDOS

1. ✅ **Completado:** Limpieza de código y autenticación
2. ⏳ **Siguiente:** Implementar módulo de Aulas (backend + frontend)
3. ⏳ **Pendiente:** Implementar módulo de Historial
4. ⏳ **Pendiente:** Integración con ESP32

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "Token de acceso requerido"
- ✅ Solución: Hacer login primero
- ❌ Ya NO hay sistema de respaldo

### Error: "No se encontraron usuarios"
- ✅ Verificar que estés logueado como ADMIN
- ✅ Operarios no tienen acceso a esta sección

### Pantalla en blanco
- ✅ Ir a: http://localhost:5173/clear-cache.html
- ✅ Limpiar service workers y caches
- ✅ Recargar página

### Backend no responde
- ✅ Verificar que `node server.js` esté corriendo
- ✅ Verificar puerto 3003 disponible
- ✅ Revisar logs en terminal del backend

---

*Última actualización: 2025-10-10 20:45 hrs*  
*Sistema simplificado y listo para producción*
