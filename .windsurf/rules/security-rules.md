---
trigger: always_on
---

```markdown
# Reglas de Seguridad

## Autenticación y Autorización
- NUNCA exponer endpoints sin autenticación excepto /api/auth/login
- Verificar permisos en CADA endpoint
- Token expiration: 24 horas
- Refresh token: 7 días
- Rate limiting: 100 requests/hora por IP

## Validaciones Críticas
```python
# Backend - Siempre validar
- Legajo único y formato correcto (regex: ^\d{6,8}$)
- IPs válidas para ESP32
- Permisos antes de cualquier operación
- Sanitizar inputs contra SQL injection (usar ORM)
- Validar tipos de datos esperados

# Frontend - Validación doble
- Validar formularios antes de enviar
- No confiar en validación solo frontend
- Sanitizar inputs mostrados (XSS prevention)
Secretos y Configuración
bash# NUNCA commitear
- .env files
- Secret keys
- Database passwords
- API keys de ESP32

# Usar variables de entorno
SECRET_KEY=os.environ.get('SECRET_KEY')
DATABASE_URL=os.environ.get('DATABASE_URL')
ESP32_API_KEY=os.environ.get('ESP32_API_KEY')
CORS Configuration
python# Development
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
]

# Production
CORS_ALLOWED_ORIGINS = [
    "https://tudominio.com",
]