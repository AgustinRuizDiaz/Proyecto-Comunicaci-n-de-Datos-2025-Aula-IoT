# Gestor de Aulas Universitarias con IoT

Sistema completo de gestión de aulas universitarias con integración IoT para monitoreo en tiempo real de sensores y condiciones ambientales.

## 🚀 Inicio Rápido

### Opción 1: Con MongoDB (Completo)
```batch
.\start.bat
```

### Opción 2: Con SQLite (Desarrollo Rápido)
```batch
.\start_simple.bat
```

### Opción 3: Ambos Servicios
```batch
.\start_all.bat
```

## 🌐 URLs de Acceso
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentación**: http://localhost:8000/api/schema/swagger-ui/

## 📁 Estructura del Proyecto

```
gestor-aulas/
├── backend/                 # Django Backend
│   ├── gestor_aulas/       # Proyecto Django
│   ├── users/              # App de usuarios
│   ├── classrooms/         # App de aulas
│   ├── sensors/            # App de sensores
│   ├── history/            # App de historial
│   ├── requirements.txt    # Dependencias Python
│   └── .env.example        # Variables de entorno
├── frontend/               # React Frontend
│   ├── src/                # Código fuente
│   ├── public/             # Archivos públicos
│   ├── package.json        # Dependencias Node.js
│   └── .env.example        # Variables de entorno
├── docs/                   # Documentación técnica
└── README_FINAL.txt        # Instrucciones detalladas
```

## ⚡ Características

### Backend (Django)
- ✅ API REST completa con Django REST Framework
- ✅ Autenticación JWT con refresh tokens
- ✅ WebSockets con Django Channels
- ✅ Documentación automática con Swagger
- ✅ Configuración SQLite para desarrollo
- ✅ Configuración MongoDB para producción

### Frontend (React)
- ✅ Interfaz moderna con Tailwind CSS
- ✅ Componentes reutilizables
- ✅ Estado global con Context API
- ✅ Routing con React Router
- ✅ Configuración responsive

### IoT Integration
- ✅ Gestión de sensores en tiempo real
- ✅ Monitoreo de condiciones ambientales
- ✅ Historial de datos
- ✅ Alertas y notificaciones

## 🔧 Configuración

### Variables de Entorno Backend
Copia `.env.example` a `.env` y configura:
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (SQLite para desarrollo)
DATABASES=default:ENGINE=django.db.backends.sqlite3

# Database (MongoDB para producción)
MONGODB_NAME=gestor_aulas_db
MONGODB_HOST=localhost
MONGODB_PORT=27017

# JWT Configuration
JWT_ACCESS_TOKEN_LIFETIME=5
JWT_REFRESH_TOKEN_LIFETIME=1440

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Variables de Entorno Frontend
Copia `.env.example` a `.env` y configura:
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_SOCKET_URL=http://localhost:8000
VITE_APP_NAME="Gestor de Aulas"
VITE_APP_DESCRIPTION="Sistema de gestión de aulas con IoT"
```

## 📋 Comandos Útiles

### Limpiar Procesos
```batch
.\clean.bat
```

### Instalar Dependencias
```batch
# Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

### Ejecutar Servicios
```batch
# Backend
cd backend
venv\Scripts\activate
python manage.py runserver

# Frontend
cd frontend
npm run dev
```

## 🔍 Solución de Problemas

### Error: Puerto ocupado
```batch
.\clean.bat
```

### Error: MongoDB no encontrado
Usa la configuración SQLite:
```batch
.\start_simple.bat
```

### Error: Módulo no encontrado
Reinstala dependencias:
```batch
cd backend
venv\Scripts\activate
pip install -r requirements.txt
```

## 📚 Documentación

- `README_FINAL.txt` - Instrucciones detalladas de instalación y uso
- `docs/TECHNICAL_DOCS.md` - Documentación técnica completa

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

**¡Sistema listo para usar!** 🚀│   ├── classrooms/         # App de aulas
│   ├── sensors/            # App de sensores
│   └── history/            # App de historial
├── frontend/               # React Frontend
│   ├── src/
│   ├── components/         # Componentes React
│   ├── pages/              # Páginas
│   ├── services/           # Servicios API
│   └── hooks/              # Custom hooks
└── docs/                   # Documentación
```

## Requisitos Previos

- Python 3.8+
- Node.js 16+
- MongoDB 4.4+
- Redis 6.0+ (opcional, para WebSockets y Celery)

## Instalación

### Backend (Django)

1. **Crear entorno virtual**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # o
   venv\Scripts\activate     # Windows
   ```

2. **Instalar dependencias**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```

   Editar el archivo `.env` con tus configuraciones:
   - `SECRET_KEY`: Clave secreta de Django
   - `MONGODB_*`: Configuración de MongoDB
   - `REDIS_URL`: URL de Redis (opcional)
   - `CORS_ALLOWED_ORIGINS`: Orígenes permitidos para CORS

4. **Ejecutar migraciones**
   ```bash
   python manage.py migrate
   ```

5. **Crear superusuario (opcional)**
   ```bash
   python manage.py createsuperuser
   ```

6. **Ejecutar servidor de desarrollo**
   ```bash
   python manage.py runserver
   ```

   El backend estará disponible en `http://localhost:8000`

### Frontend (React)

1. **Instalar dependencias**
   ```bash
   cd frontend
   npm install
   ```

2. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```

   Editar el archivo `.env` si es necesario cambiar las URLs de la API.

3. **Ejecutar servidor de desarrollo**
   ```bash
   npm run dev
   ```

   El frontend estará disponible en `http://localhost:3000`

## Uso

### Acceso al Sistema

1. Abrir el navegador y acceder a `http://localhost:3000`
2. Registrarse o iniciar sesión
3. Explorar las funcionalidades disponibles

### Funcionalidades Principales

- **Dashboard**: Vista general del estado de las aulas
- **Gestión de Aulas**: Crear, editar y monitorear aulas
- **Sensores IoT**: Configurar y monitorear sensores
- **Historial**: Ver datos históricos de sensores
- **Perfil de Usuario**: Gestionar información personal

### API Documentation

Una vez que el backend esté ejecutándose, la documentación de la API estará disponible en:
- Swagger UI: `http://localhost:8000/api/schema/swagger-ui/`
- ReDoc: `http://localhost:8000/api/schema/redoc/`

## Configuración de Producción

### Backend

1. Configurar las variables de entorno para producción
2. Usar un servidor WSGI como Gunicorn
3. Configurar un reverse proxy (Nginx)
4. Habilitar HTTPS

### Frontend

1. Construir la aplicación para producción:
   ```bash
   npm run build
   ```
2. Servir los archivos estáticos con un servidor web
3. Configurar HTTPS

## Tecnologías Utilizadas

### Backend
- **Django**: Framework web
- **Django REST Framework**: API REST
- **Django Channels**: WebSockets
- **djongo**: Conector MongoDB
- **JWT**: Autenticación
- **Celery**: Procesamiento en background

### Frontend
- **React 18**: Biblioteca UI
- **Vite**: Build tool
- **Tailwind CSS**: Framework CSS
- **React Router**: Navegación
- **Axios**: Cliente HTTP
- **Socket.io-client**: WebSockets
- **React Query**: Gestión de estado del servidor
- **PWA**: Aplicación web progresiva

### Base de Datos
- **MongoDB**: Base de datos NoSQL
- **Redis**: Cache y message broker

## Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Soporte

Para soporte técnico o preguntas, contactar al equipo de desarrollo.

## Roadmap

- [ ] Implementar notificaciones push
- [ ] Agregar soporte para más tipos de sensores
- [ ] Implementar machine learning para predicciones
- [ ] Crear aplicación móvil nativa
- [ ] Agregar soporte multi-idioma
