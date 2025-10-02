---
trigger: always_on
---

# Estructura del Proyecto

## Arquitectura General
- Frontend: React + Vite + TypeScript + Tailwind CSS
- Backend: Django REST Framework + SQLite/PostgreSQL
- Comunicación: REST API + WebSockets (Django Channels)
- Autenticación: Token-based (Django REST Framework Token)

## Estructura de Carpetas/
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/         # Páginas/vistas principales
│   │   ├── services/      # Llamadas a API
│   │   ├── hooks/         # Custom hooks
│   │   ├── contexts/      # Context providers
│   │   ├── utils/         # Utilidades
│   │   └── types/         # TypeScript types
│   └── public/
├── backend/
│   ├── apps/
│   │   ├── users/         # Gestión de usuarios
│   │   ├── classrooms/    # Gestión de aulas
│   │   ├── sensors/       # Gestión de sensores
│   │   └── history/       # Registros y logs
│   ├── core/              # Configuración principal
│   └── api/               # Endpoints API
└── docs/

## Convenciones de Nomenclatura
- Componentes React: PascalCase (UserList.tsx)
- Hooks: camelCase con prefijo 'use' (useAuth.ts)
- Archivos de servicio: camelCase con sufijo 'Service' (authService.ts)
- Django apps: snake_case plural (users, classrooms)
- Modelos Django: PascalCase singular (User, Classroom)
- URLs: kebab-case (/api/esp32/sensor-update)