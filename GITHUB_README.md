# 🏫 Gestor de Aulas IoT - Universidad 2025

[![Django](https://img.shields.io/badge/Django-4.2.7-green.svg)](https://djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0.0-green.svg)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-5.0.1-red.svg)](https://redis.io/)
[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://python.org)
[![Node.js](https://img.shields.io/badge/Node.js-18.17.0-green.svg)](https://nodejs.org/)

Sistema completo de gestión de aulas universitarias con integración IoT para monitoreo en tiempo real de sensores y condiciones ambientales.

## ✨ Características Principales

### 🔧 Backend (Django REST Framework)
- **API REST completa** con autenticación JWT
- **WebSockets** para comunicación en tiempo real
- **Documentación automática** con Swagger/OpenAPI
- **Configuración dual**: SQLite (desarrollo) / MongoDB (producción)
- **Sistema de usuarios** con roles y permisos
- **Gestión de sensores IoT** con datos históricos

### 🎨 Frontend (React + Vite)
- **Interfaz moderna** con Tailwind CSS
- **Componentes reutilizables** y estado global
- **Routing dinámico** con React Router
- **PWA ready** para instalación como app nativa
- **Dashboard responsive** para diferentes dispositivos

### 📡 IoT Integration
- **Monitoreo en tiempo real** de sensores
- **Gestión de aulas** con condiciones ambientales
- **Historial de datos** con gráficos y estadísticas
- **Alertas automáticas** para condiciones críticas

## 🚀 Inicio Rápido

### Opción 1: Desarrollo Rápido (SQLite)
```bash
# Clonar el repositorio
git clone https://github.com/AgustinRuizDiaz/Proyecto-Comunicaci-n-de-Datos-2025-Aula-IoT.git
cd Proyecto-Comunicaci-n-de-Datos-2025-Aula-IoT

# Inicio simple con SQLite
.\start_simple.bat
```

### Opción 2: Producción Completa (MongoDB)
```bash
# Configuración completa con MongoDB y Redis
.\setup.ps1  # Como Administrador

# Inicio completo
.\start.bat
```

## 🌐 URLs de Acceso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentación API**: http://localhost:8000/api/schema/swagger-ui/
- **Admin Django**: http://localhost:8000/admin/

## 📁 Estructura del Proyecto

```
├── backend/                    # Django Backend
│   ├── gestor_aulas/          # Configuración Django
│   ├── users/                 # Gestión de usuarios
│   ├── classrooms/            # Gestión de aulas
│   ├── sensors/               # Gestión de sensores IoT
│   ├── history/               # Historial y reportes
│   └── requirements.txt       # Dependencias Python
├── frontend/                  # React Frontend
│   ├── src/                   # Código fuente
│   ├── public/                # Archivos estáticos
│   └── package.json           # Dependencias Node.js
├── docs/                      # Documentación técnica
└── scripts/                   # Scripts de utilidad
```

## 🔧 Tecnologías Utilizadas

### Backend
- **Django 4.2.7** - Framework web Python
- **Django REST Framework** - API REST
- **Django Channels** - WebSockets
- **MongoDB** - Base de datos NoSQL
- **Redis** - Cache y canales
- **JWT** - Autenticación

### Frontend
- **React 18.2.0** - Librería UI
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework CSS
- **React Router** - Routing
- **Context API** - Estado global

### IoT & DevOps
- **Python SocketIO** - WebSockets
- **Docker** - Containerización
- **Git** - Control de versiones
- **PowerShell** - Scripts de automatización

## 📋 Requisitos del Sistema

### Mínimos
- **Python 3.11+**
- **Node.js 18.17+**
- **Git**
- **SQLite** (incluido con Python)

### Producción (Opcional)
- **MongoDB 7.0+**
- **Redis 5.0+**
- **Docker & Docker Compose**

## 📚 Documentación

- 📖 **[README.md](README.md)** - Información general del proyecto
- 📋 **[README_FINAL.txt](README_FINAL.txt)** - Instrucciones detalladas
- 🔧 **[docs/TECHNICAL_DOCS.md](docs/TECHNICAL_DOCS.md)** - Documentación técnica

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `start.bat` | Inicio completo con MongoDB |
| `start_simple.bat` | Inicio simple con SQLite |
| `start_all.bat` | Ejecuta ambos servicios |
| `clean.bat` | Limpia procesos |
| `setup.ps1` | Configuración completa |

## 👥 Autores

- **Agustín Ruiz Díaz** - *Desarrollador Principal*
- **Universidad 2025** - *Comunicación de Datos*

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- Django Community
- React Community
- MongoDB Community
- Todos los contributors

---

**⭐ Si te gusta este proyecto, ¡dale una estrella!**

**🔗 [Repositorio GitHub](https://github.com/AgustinRuizDiaz/Proyecto-Comunicaci-n-de-Datos-2025-Aula-IoT)**
