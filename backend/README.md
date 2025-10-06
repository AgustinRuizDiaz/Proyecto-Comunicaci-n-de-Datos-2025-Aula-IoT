# Backend - Sistema de Gestión de Aulas IoT

Este es el backend del sistema de gestión de aulas IoT desarrollado con Node.js, Express.js y SQLite.

## 🚀 Características

- **API RESTful** completa para gestión de aulas
- **Base de datos SQLite** para almacenamiento local
- **Modelo de datos** para aulas, dispositivos IoT y usuarios
- **CORS habilitado** para integración con frontend
- **Manejo de errores** robusto
- **Variables de entorno** configurables

## 📋 Prerrequisitos

- Node.js (v16 o superior)
- npm o yarn

## 🛠️ Instalación

1. **Instalar dependencias:**
   ```bash
   cd backend
   npm install
   ```

2. **Configurar variables de entorno:**
   Copiar el archivo `.env` y modificar según sea necesario:
   ```bash
   cp .env .env.local
   ```

3. **Inicializar la base de datos:**
   ```bash
   npm run init-db
   ```

## 🚀 Ejecutar el servidor

### Modo desarrollo (con nodemon):
```bash
npm run dev
```

### Modo producción:
```bash
npm start
```

El servidor se ejecutará en `http://localhost:3001` por defecto.

## 📚 API Endpoints

### Aulas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/aulas` | Obtener todas las aulas |
| GET | `/api/aulas/:id` | Obtener aula por ID |
| GET | `/api/aulas/search?q=query` | Buscar aulas |
| GET | `/api/aulas/stats` | Estadísticas de aulas |
| POST | `/api/aulas` | Crear nueva aula |
| PUT | `/api/aulas/:id` | Actualizar aula |
| DELETE | `/api/aulas/:id` | Eliminar aula |

### Ejemplos de uso

#### Crear aula
```bash
curl -X POST http://localhost:3001/api/aulas \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Aula 201",
    "ubicacion": "Edificio A - Piso 2",
    "capacidad": 40,
    "descripcion": "Aula con equipo multimedia"
  }'
```

#### Obtener aulas
```bash
curl http://localhost:3001/api/aulas
```

## 🗂️ Estructura del proyecto

```
backend/
├── database.js          # Configuración de base de datos SQLite
├── server.js            # Punto de entrada de la aplicación
├── models/
│   └── Aula.js         # Modelo de datos para aulas
├── routes/
│   └── aulas.js        # Rutas API para aulas
├── scripts/
│   └── initDatabase.js # Script de inicialización de BD
├── .env                # Variables de entorno
├── package.json        # Dependencias y scripts
└── README.md           # Documentación
```

## 🗃️ Base de datos

### Tablas principales

#### `aulas`
- `id`: Identificador único
- `nombre`: Nombre del aula
- `ubicacion`: Ubicación física
- `capacidad`: Número máximo de personas
- `descripcion`: Descripción adicional
- `estado`: Estado (activa/inactiva)
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

#### `dispositivos`
- `id`: Identificador único
- `aula_id`: Referencia al aula
- `tipo`: Tipo de dispositivo IoT
- `nombre`: Nombre del dispositivo
- `descripcion`: Descripción del dispositivo
- `estado`: Estado del dispositivo
- `configuracion`: Configuración JSON

#### `usuarios`
- `id`: Identificador único
- `nombre`: Nombre del usuario
- `email`: Correo electrónico único
- `password_hash`: Hash de contraseña
- `rol`: Rol del usuario
- `estado`: Estado del usuario

## 🔧 Variables de entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|------------------|
| `PORT` | Puerto del servidor | `3001` |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `DATABASE_PATH` | Ruta de la base de datos | `./database.sqlite` |
| `JWT_SECRET` | Clave secreta para JWT | `gestor_aulas_secret_key_2025` |
| `CORS_ORIGIN` | Origen permitido para CORS | `http://localhost:3000` |

## 🔒 Seguridad

- **CORS configurado** para desarrollo local
- **Variables de entorno** para configuración sensible
- **Validación de datos** en endpoints
- **Manejo seguro de errores** (no exponer detalles en producción)

## 🚧 Próximas funcionalidades

- [ ] Autenticación JWT completa
- [ ] Modelos para dispositivos IoT
- [ ] Sistema de reservas de aulas
- [ ] WebSockets para monitoreo en tiempo real
- [ ] Logs detallados de actividades
- [ ] Tests unitarios e integración

## 📝 Desarrollo

Para contribuir al desarrollo:

1. Crear rama para nuevas funcionalidades
2. Implementar cambios
3. Ejecutar pruebas
4. Crear pull request

## 🐛 Reportar problemas

Si encuentras algún problema, por favor crea un issue en el repositorio con:
- Descripción del problema
- Pasos para reproducirlo
- Información del entorno
- Logs relevantes

---

**Desarrollado para el proyecto de Comunicación de Datos 2025**
