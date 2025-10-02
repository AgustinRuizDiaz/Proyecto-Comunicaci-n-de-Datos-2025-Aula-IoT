---
trigger: always_on
---

```markdown
# Integración API y ESP32

## Estructura de Endpoints
/api/auth/
POST   /login         # Login con legajo/password
POST   /logout        # Logout
GET    /me           # Usuario actual
/api/users/
GET    /             # Lista usuarios (admin)
POST   /             # Crear usuario (admin)
GET    /{id}/        # Detalle usuario
PUT    /{id}/        # Actualizar usuario (admin)
DELETE /{id}/        # Eliminar usuario (admin)
/api/aulas/
GET    /             # Lista aulas
POST   /             # Crear aula (admin)
GET    /{id}/        # Detalle aula con sensores
PUT    /{id}/        # Actualizar aula (admin)
DELETE /{id}/        # Eliminar aula (admin)
POST   /{id}/toggle-lights/  # Apagar todas las luces
/api/sensores/
GET    /             # Lista sensores
POST   /{id}/toggle/ # Cambiar estado sensor
GET    /{id}/history/# Historial del sensor
/api/esp32/
POST   /heartbeat    # Heartbeat del ESP32
GET    /commands/{ip}# Comandos pendientes
POST   /sensor-update# Actualización individual
/api/history/
GET    /             # Historial con filtros
GET    /export/      # Exportar CSV

## Formato de Respuestas
```typescript
// Éxito
{
  "success": true,
  "data": {},
  "message": "Operación exitosa"
}

// Error
{
  "success": false,
  "error": {
    "code": "AUTH_001",
    "message": "Credenciales inválidas",
    "details": {}
  }
}

// Listados paginados
{
  "count": 100,
  "next": "http://api/users/?page=2",
  "previous": null,
  "results": []
}
Headers Requeridos
javascript{
  'Authorization': 'Token {token}',
  'Content-Type': 'application/json',
  'X-Device-ID': '{esp32_ip}' // Solo para ESP32
}