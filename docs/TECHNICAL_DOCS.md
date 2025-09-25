# Documentación Técnica - Gestor de Aulas IoT

## Arquitectura del Sistema

### Visión General

El sistema está diseñado con una arquitectura fullstack moderna que incluye:

- **Frontend**: Aplicación React de una sola página (SPA) con PWA
- **Backend**: API REST con Django REST Framework
- **Base de datos**: MongoDB para almacenamiento flexible
- **Comunicación en tiempo real**: WebSockets con Django Channels
- **Autenticación**: JWT con refresh tokens

### Diagrama de Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React SPA     │    │  Django REST    │    │    MongoDB      │
│   + PWA +       │◄──►│   Framework     │◄──►│   + Redis       │
│   Tailwind CSS  │    │ + Channels      │    │   Cache         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    WebSockets               HTTP/REST              Sensors
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Socket.io     │    │   IoT Devices   │    │   Celery        │
│   Client        │    │   (ESP32, etc)  │    │   Workers       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Modelos de Datos

### Usuario (User)
```json
{
  "_id": "ObjectId",
  "username": "string",
  "email": "string",
  "first_name": "string",
  "last_name": "string",
  "role": "admin|teacher|student",
  "is_active": "boolean",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Aula (Classroom)
```json
{
  "_id": "ObjectId",
  "name": "string",
  "description": "string",
  "capacity": "integer",
  "location": "string",
  "status": "active|inactive|maintenance",
  "sensors": ["ObjectId"],
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Sensor (Sensor)
```json
{
  "_id": "ObjectId",
  "name": "string",
  "type": "temperature|humidity|co2|motion|light",
  "classroom_id": "ObjectId",
  "device_id": "string",
  "status": "online|offline|error",
  "last_reading": {
    "value": "float",
    "timestamp": "datetime"
  },
  "config": {
    "min_threshold": "float",
    "max_threshold": "float",
    "update_interval": "integer"
  },
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Historial (History)
```json
{
  "_id": "ObjectId",
  "sensor_id": "ObjectId",
  "classroom_id": "ObjectId",
  "value": "float",
  "timestamp": "datetime",
  "metadata": {
    "source": "string",
    "quality": "float"
  }
}
```

## Endpoints de la API

### Autenticación
- `POST /api/users/login/` - Iniciar sesión
- `POST /api/users/register/` - Registrar usuario
- `POST /api/users/refresh/` - Refrescar token
- `GET /api/users/profile/` - Obtener perfil
- `PATCH /api/users/profile/` - Actualizar perfil

### Aulas
- `GET /api/classrooms/` - Listar aulas
- `POST /api/classrooms/` - Crear aula
- `GET /api/classrooms/{id}/` - Detalle de aula
- `PATCH /api/classrooms/{id}/` - Actualizar aula
- `DELETE /api/classrooms/{id}/` - Eliminar aula
- `GET /api/classrooms/{id}/sensors/` - Sensores de aula
- `GET /api/classrooms/{id}/status/` - Estado de aula

### Sensores
- `GET /api/sensors/` - Listar sensores
- `POST /api/sensors/` - Crear sensor
- `GET /api/sensors/{id}/` - Detalle de sensor
- `PATCH /api/sensors/{id}/` - Actualizar sensor
- `DELETE /api/sensors/{id}/` - Eliminar sensor
- `GET /api/sensors/{id}/data/` - Datos del sensor
- `GET /api/sensors/{id}/history/` - Historial del sensor
- `POST /api/sensors/register/` - Registrar sensor IoT

### Historial
- `GET /api/history/` - Listar historial
- `GET /api/history/{id}/` - Detalle de registro
- `GET /api/history/sensor/{sensor_id}/` - Historial por sensor
- `GET /api/history/classroom/{classroom_id}/` - Historial por aula
- `GET /api/history/export/` - Exportar historial

## WebSockets Events

### Client → Server
- `join` - Unirse a una sala
- `leave` - Salir de una sala
- `sensor_command` - Enviar comando a sensor

### Server → Client
- `sensor_update` - Actualización de sensor
- `classroom_status_change` - Cambio de estado de aula
- `alert` - Alerta del sistema

## Configuración de Sensores IoT

### ESP32/ESP8266
```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

#define DHTPIN 4
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);
WiFiClient client;

void setup() {
  Serial.begin(115200);
  dht.begin();
  connectWiFi();
  registerSensor();
}

void loop() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  if (!isnan(temperature) && !isnan(humidity)) {
    sendSensorData(temperature, humidity);
  }

  delay(30000); // 30 segundos
}

void sendSensorData(float temp, float hum) {
  HTTPClient http;
  http.begin("http://localhost:8000/api/sensors/data/");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", "Bearer " + String(API_TOKEN));

  String payload = "{\"temperature\":" + String(temp) +
                   ",\"humidity\":" + String(hum) + "}";

  int httpResponseCode = http.POST(payload);

  if (httpResponseCode > 0) {
    Serial.println("Data sent successfully");
  } else {
    Serial.println("Error sending data");
  }

  http.end();
}
```

## Despliegue

### Docker Compose (Recomendado)

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:4.4
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - MONGODB_HOST=mongodb
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - mongodb
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

### Variables de Entorno de Producción

```env
# Django
SECRET_KEY=your-production-secret-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
MONGODB_HOST=mongodb
MONGODB_PORT=27017
MONGODB_NAME=gestor_aulas_prod

# Redis
REDIS_URL=redis://redis:6379/0

# Security
CORS_ALLOWED_ORIGINS=https://yourdomain.com
JWT_ACCESS_TOKEN_LIFETIME=15
JWT_REFRESH_TOKEN_LIFETIME=10080

# SSL/HTTPS
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

## Monitoreo y Logs

### Logs de Django
```bash
# Ver logs en tiempo real
tail -f logs/django.log

# Logs de errores
tail -f logs/django_error.log
```

### Monitoreo de Sensores
```bash
# Estado de sensores
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/sensors/

# Estado de aulas
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/classrooms/status/
```

## Seguridad

### Autenticación JWT
- Tokens de acceso con duración de 5 minutos
- Tokens de refresh con duración de 24 horas
- Almacenamiento seguro en localStorage
- Refresco automático de tokens

### CORS
- Configuración estricta de orígenes permitidos
- Headers de seguridad apropiados
- Protección CSRF

### Validación de Datos
- Serializadores DRF con validación estricta
- Sanitización de inputs
- Rate limiting en endpoints críticos

## Escalabilidad

### Estrategias
1. **Base de datos**: Sharding horizontal para sensores
2. **Cache**: Redis para sesiones y datos frecuentes
3. **CDN**: Para archivos estáticos del frontend
4. **Load Balancer**: Distribución de tráfico
5. **Microservicios**: Separar servicios IoT

### Optimizaciones
- Indexado de MongoDB en campos consultados frecuentemente
- Compresión de respuestas JSON
- Paginación en listados grandes
- Lazy loading en frontend

## Troubleshooting

### Problemas Comunes

1. **Error de conexión MongoDB**
   ```bash
   # Verificar conexión
   python manage.py dbshell
   ```

2. **WebSockets no funcionan**
   ```bash
   # Verificar Redis
   redis-cli ping
   # Verificar Channels
   python manage.py shell -c "from channels.layers import get_channel_layer; print(get_channel_layer())"
   ```

3. **PWA no se instala**
   - Verificar HTTPS en producción
   - Comprobar manifest.json
   - Revisar service worker

4. **Sensores no envían datos**
   - Verificar conectividad WiFi
   - Comprobar API_TOKEN
   - Revisar logs del backend

### Comandos Útiles

```bash
# Backend
python manage.py migrate
python manage.py collectstatic
python manage.py createsuperuser
python manage.py shell

# Frontend
npm run build
npm run preview
npm run lint

# Docker
docker-compose up -d
docker-compose logs -f
docker-compose down
```

## Soporte

Para soporte técnico:

1. Revisar logs del sistema
2. Verificar configuración de variables de entorno
3. Comprobar conectividad de servicios
4. Consultar documentación de Django y React
5. Abrir issue en el repositorio
