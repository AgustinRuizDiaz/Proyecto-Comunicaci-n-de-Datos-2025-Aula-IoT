=== SOLUCIÓN FINAL -# Gestor de Aulas IoT - Instrucciones de Instalación y Uso

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
└── scripts/                # Scripts de utilidad
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

### Error: "No module named 'settings_simple'"
**Solución**: El archivo `settings_simple.py` está configurado para SQLite.
Asegúrate de tener las dependencias instaladas:
```batch
cd backend
venv\Scripts\activate
pip install Django==4.2.7 djangorestframework==3.14.0
```

### Error: Puerto ocupado
**Solución**: Limpia los procesos existentes:
```batch
.\clean.bat
```

### Error: MongoDB no encontrado
**Solución**: Usa la configuración SQLite:
```batch
.\start_simple.bat
```

## 📚 Documentación Técnica

Para documentación técnica detallada, consulta:
- `docs/TECHNICAL_DOCS.md` - Documentación técnica completa
- `README.md` - Información general del proyecto

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo `LICENSE` para más detalles.

---

**¡Sistema listo para usar!** 🚀===
