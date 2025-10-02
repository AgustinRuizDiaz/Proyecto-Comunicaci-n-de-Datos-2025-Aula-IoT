# Gestor de Aulas Universitarias con IoT

Un sistema completo de gestión de aulas universitarias con integración de sensores IoT para monitoreo en tiempo real de temperatura, humedad, ocupación y otros parámetros ambientales.

## 🚀 Características

### Frontend
- **React 18** con **Vite** para desarrollo rápido
- **Progressive Web App (PWA)** para funcionamiento offline
- **Tailwind CSS** para estilos modernos y responsivos
- **React Router** para navegación SPA
- **Axios** para comunicación HTTP
- **Socket.io-client** para actualizaciones en tiempo real
- **Autenticación JWT** con refresh tokens

### Backend
- **Django REST Framework** para APIs robustas
- **Django Channels** para WebSockets
- **JWT Authentication** para seguridad
- **CORS** configurado para desarrollo
- **SQLite** para desarrollo (PostgreSQL ready)
- **Estructura modular** con apps separadas

## 📁 Estructura del Proyecto

```
GestorAulas/
├── frontend/                 # Aplicación React
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   ├── pages/           # Páginas de la aplicación
│   │   ├── services/        # Servicios de API
│   │   ├── contexts/        # Contextos de React
│   │   ├── hooks/           # Custom hooks
│   │   └── utils/           # Utilidades
│   ├── public/              # Archivos estáticos
│   └── dist/                # Build de producción
├── backend/                 # API Django
│   ├── classroom_manager/   # Proyecto Django
│   ├── users/              # App de usuarios
│   ├── classrooms/         # App de aulas
│   ├── sensors/            # App de sensores
│   └── history/            # App de historial
└── docs/                   # Documentación
```

## 🛠️ Instalación y Configuración

### Prerrequisitos

- **Python 3.8+**
- **Node.js 16+**
- **npm** o **yarn**

### Backend Setup

1. **Crear entorno virtual:**
   ```bash
   cd backend
   python -m venv venv
   .\venv\Scripts\activate  # Windows
   # o en Linux/Mac:
   # source venv/bin/activate
   ```

2. **Instalar dependencias:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   ```
   
   Editar `.env` con tus configuraciones:
   ```env
   # Django Settings
   DEBUG=True
   SECRET_KEY=django-insecure-74=5kdaz43wbald8m_h0ejrh3jdca5lx+9o%8b)ex&-#ko&@2z

   # Database
   DATABASE_URL=sqlite:///db.sqlite3
   # For PostgreSQL production:
   # DATABASE_URL=postgresql://user:password@localhost:5432/classroom_manager

   # CORS
   CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

   # JWT
   ACCESS_TOKEN_LIFETIME_MINUTES=60
   REFRESH_TOKEN_LIFETIME_DAYS=7

   # IoT Sensors
   SENSOR_UPDATE_INTERVAL_SECONDS=30
   ```

4. **Ejecutar migraciones:**
   ```bash
   python manage.py migrate
   ```

5. **Crear superusuario (opcional):**
   ```bash
   python manage.py createsuperuser
   ```

6. **Ejecutar servidor:**
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```

### Frontend Setup

1. **Instalar dependencias:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   ```
   
   El archivo `.env` debe contener:
   ```env
   # API Configuration
   VITE_API_URL=http://localhost:8000/api
   VITE_WS_URL=ws://localhost:8000/ws

   # PWA Configuration
   VITE_APP_NAME="Gestor de Aulas"
   VITE_APP_SHORT_NAME="GestorAulas"
   VITE_APP_DESCRIPTION="Sistema de gestión de aulas universitarias con IoT"
   VITE_APP_THEME_COLOR="#1f2937"
   VITE_APP_BACKGROUND_COLOR="#111827"
   ```

# ✅ Estado Actual del Proyecto

## Backend Django
- ✅ **Servidor ejecutándose** en `http://localhost:8000`
- ✅ **Base de datos SQLite** completamente funcional
- ✅ **CORS habilitado** para frontend en puerto 5173
- ✅ **JWT Authentication** configurado
- ✅ **Django Channels** listo para WebSockets
- ✅ **Variables de entorno** configuradas correctamente
- ✅ **19 migraciones aplicadas** correctamente

## Frontend React
- ✅ **Material-UI completamente funcional** instalado y configurado
- ✅ **Sistema de autenticación completo** implementado
- ✅ **Diseño institucional** aplicado con colores azul (#1e40af, #3b82f6)
- ✅ **Rutas protegidas** con permisos por roles (Admin/Operario)
- ✅ **Auto-logout por inactividad** (30 minutos)
- ✅ **Persistencia de sesión** en localStorage

## 🔧 Características Implementadas

| Característica | Backend | Frontend | Estado |
|---------------|---------|----------|--------|
| Modelo User personalizado | ✅ | ✅ | **Completo** |
| Login con JWT | ✅ | ✅ | **Completo** |
| Logout seguro | ✅ | ✅ | **Completo** |
| **Sistema de Roles y Permisos RBAC** | ✅ | ✅ | **Completo** |
| **Gestión completa de usuarios** | ✅ | ✅ | **Completo** |
| Rutas protegidas | ✅ | ✅ | **Completo** |
| Persistencia de sesión | ✅ | ✅ | **Completo** |
| Auto-logout inactividad | ✅ | ✅ | **Completo** |
| Material-UI instalado | ✅ | ✅ | **Completo** |
| Página acceso denegado | ✅ | ✅ | **Completo** |
| Diseño institucional | ✅ | ✅ | **Completo** |

## 🔐 Sistema de Roles y Permisos (RBAC)

### Roles Disponibles
- **👑 Administrador (Admin)**: Acceso completo a todas las funcionalidades
- **👤 Operario (Operario)**: Acceso limitado según responsabilidades

### Permisos por Rol

| Recurso | Admin | Operario |
|---------|-------|----------|
| **Usuarios** | ✅ CRUD completo | ❌ Solo lectura activos |
| **Aulas** | ✅ CRUD completo | ❌ Solo lectura |
| **Sensores** | ✅ CRUD completo | ✅ CRUD completo |
| **Historial** | ✅ CRUD completo | ✅ CRUD completo |
| **Panel Admin** | ✅ Acceso completo | ❌ No visible |
| **Panel Operario** | ❌ No visible | ✅ Acceso completo |

### Funcionalidades RBAC
- ✅ **Autenticación JWT** con roles personalizados
- ✅ **Permisos granulares** en ViewSets Django
- ✅ **Serializers diferenciados** según rol del usuario
- ✅ **HOC para acceso condicional** en React
- ✅ **Rutas protegidas** por rol
- ✅ **UI adaptativa** según permisos del usuario
- ✅ **Navegación inteligente** en navbar

## 🎯 APIs REST Disponibles

### Backend Django (http://localhost:8000)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/` | GET | Página principal del proyecto |
| `/api/status/` | GET | Estado de la API |
| `/api/users/login/` | POST | Iniciar sesión (devuelve tokens JWT) |
| `/api/users/logout/` | POST | Cerrar sesión |
| `/api/users/profile/` | GET | Perfil del usuario autenticado |
| `/api/users/token/refresh/` | POST | Refresh token JWT |
| `/api/users/` | GET/POST | Gestión de usuarios |
| `/api/classrooms/` | GET/POST | Gestión de aulas |
| `/api/sensors/` | GET/POST | Gestión de sensores |
| `/api/history/` | GET/POST | Historial de registros |
| `/admin/` | GET | Panel de administración |

## 🔐 Sistema de Autenticación

El sistema utiliza JWT (JSON Web Tokens) para autenticación:

1. **Login** devuelve `access` y `refresh` tokens
2. **Access token** expira en 60 minutos (configurable)
3. **Refresh token** se usa para obtener nuevo access token
4. **Auto-refresh** automático cuando el token expira
5. **Blacklist** de tokens al hacer logout
6. **Auto-logout** por inactividad (30 minutos)

### Ejemplos de uso:

```bash
# Login (obtiene tokens JWT)
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"legajo": "12345", "password": "test123"}'

# Usar token en requests posteriores
curl -H "Authorization: Bearer <access_token>" \
  http://localhost:8000/api/classrooms/

# Refresh token
curl -X POST http://localhost:8000/api/users/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh": "<refresh_token>"}'

# Logout
curl -X POST http://localhost:8000/api/users/logout/ \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "<refresh_token>"}'
```

## 📱 Uso de la Aplicación

### Dashboard Principal
- Vista general de todas las aulas y sensores
- Estadísticas en tiempo real
- Alertas y notificaciones del sistema

### Gestión de Aulas
- Crear, editar y eliminar aulas
- Asignar sensores a aulas
- Monitorear estado de ocupación

### Sistema de Autenticación
- **Página de login responsive** con diseño institucional
- **Campos:** Número de legajo y contraseña
- **Validación automática** de credenciales
- **Persistencia de sesión** entre visitas
- **Logout automático** por inactividad

### Datos de Prueba
- **Usuario administrador:** Legajo "12345", contraseña "test123", rol "Admin"
- **Aula de prueba:** "Aula 101" con IP ESP32 "192.168.1.100"
- **Sensores de prueba:** Sensor de luz y movimiento asociados al aula

**✅ Usuario creado automáticamente en la base de datos**

## 🚀 Próximos Pasos

1. **Desarrollar funcionalidades IoT** para integración con ESP32
2. **Implementar WebSockets** para actualizaciones en tiempo real
3. **Agregar más tipos de sensores** (temperatura, humedad, CO2)
4. **Crear sistema de alertas** configurables
5. **Implementar dashboard administrativo** completo

---

**¡El proyecto está listo para desarrollo!** 🎉

4. **Construir para producción:**
   ```bash
   npm run build
   ```

## 🔧 Configuración de Producción

### Base de Datos PostgreSQL

1. Instalar PostgreSQL y crear base de datos
2. Instalar `psycopg2-binary`
3. Actualizar `DATABASE_URL` en `.env`:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/classroom_manager
   ```

### Variables de Entorno de Producción

```env
DEBUG=False
SECRET_KEY=your-production-secret-key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

### Despliegue

#### Backend (Django)
```bash
pip install -r requirements.txt
python manage.py collectstatic
python manage.py migrate
```

#### Frontend (Vite + PWA)
```bash
npm run build
```

## 📱 Uso de la Aplicación

### Dashboard Principal
- Vista general de todas las aulas y sensores
- Estadísticas en tiempo real
- Alertas y notificaciones

### Gestión de Aulas
- Crear, editar y eliminar aulas
- Asignar sensores a aulas
- Monitorear estado de ocupación

### Gestión de Usuarios (Solo Administradores)
- **Página dedicada** de gestión de usuarios en `/admin/users`
- **Búsqueda en tiempo real** por legajo
- **Filtros avanzados** por rol y estado
- **Modal responsivo** para crear/editar usuarios
- **Validación de formularios** con mensajes de error claros
- **Confirmación de eliminación** con prevención de auto-eliminación
- **Indicadores visuales** de roles con badges diferenciados
- **Paginación automática** para grandes listas de usuarios

#### Funcionalidades del Módulo de Usuarios
- ✅ **CRUD completo** de usuarios
- ✅ **Validación de legajos únicos** a nivel de base de datos
- ✅ **Validación de contraseñas seguras** usando Django's validators
- ✅ **Prevención de auto-eliminación** de cuentas
- ✅ **Cambio de contraseña** para otros usuarios
- ✅ **Estadísticas de usuarios** (total, activos, por rol)
- ✅ **Diseño mobile-first** con cards en móvil y tabla en desktop

### Sensores IoT
- Configuración de sensores
- Visualización de datos en tiempo real
- Historial de lecturas
- Alertas configurables

### Historial
- Consulta de datos históricos
- Filtros por fecha, aula y sensor
- Exportación de datos

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/login/` - Iniciar sesión
- `POST /api/auth/register/` - Registrar usuario
- `GET /api/auth/user/` - Obtener usuario actual

### Gestión de Usuarios (Solo Administradores)
- `GET /api/users/` - Listar usuarios con filtros y búsqueda
- `POST /api/users/` - Crear nuevo usuario
- `GET /api/users/{id}/` - Detalle de usuario
- `PUT /api/users/{id}/` - Actualizar usuario
- `DELETE /api/users/{id}/` - Eliminar usuario
- `POST /api/users/{id}/change_password/` - Cambiar contraseña de usuario
- `GET /api/users/stats/` - Estadísticas de usuarios

### Parámetros de Consulta para Usuarios
- `search`: Buscar por legajo
- `rol`: Filtrar por rol (Admin/Operario)
- `is_active`: Filtrar por estado (true/false)
- `ordering`: Ordenar por campo (-date_joined, legajo)
- `page`: Número de página para paginación
- `page_size`: Tamaño de página (máximo 100)

### Sensores
- `GET /api/sensors/` - Listar sensores
- `POST /api/sensors/` - Crear sensor
- `GET /api/sensors/{id}/` - Detalle de sensor

### Historial
- `GET /api/history/` - Historial general
- `GET /api/history/classroom/{id}/` - Historial por aula
- `GET /api/history/sensor/{id}/` - Historial por sensor

## 🔐 Autenticación

El sistema utiliza JWT (JSON Web Tokens) para autenticación:

1. **Login** devuelve `access` y `refresh` tokens
2. **Access token** expira en 60 minutos
3. **Refresh token** se usa para obtener nuevo access token
4. Tokens se almacenan en localStorage

## 📡 WebSockets

Para actualizaciones en tiempo real:

- Conectar a `ws://localhost:8000/ws/`
- Eventos: `sensor_update`, `alert`, `classroom_status`
- Autenticación requerida con token JWT

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama para nueva funcionalidad
3. Commit cambios
4. Push a la rama
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🆘 Soporte

Para soporte técnico o preguntas:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo

---

**Desarrollado con ❤️ para la gestión eficiente de aulas universitarias**
