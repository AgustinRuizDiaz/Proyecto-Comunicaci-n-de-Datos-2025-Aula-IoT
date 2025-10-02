# Sistema de Actualización en Tiempo Real - Documentación

## Arquitectura General

El sistema de tiempo real está compuesto por:

1. **Backend Django Channels**: Maneja WebSockets y broadcasting
2. **Frontend React Hooks**: Gestiona conexiones y estado
3. **ESP32 Integration**: Endpoints para dispositivos IoT
4. **Optimizaciones**: Cache, debounce, batch updates

## Backend Django Channels

### Consumer Principal (`sensors/consumers.py`)

```python
# Ejemplo de uso básico
class AulaConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.aula_id = self.scope['query_string'].decode().split('aula_id=')[-1]
        await self.channel_layer.group_add(f'aula_{self.aula_id}', self.channel_name)
        await self.accept()

    async def sensor_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'sensor_update',
            'sensor_id': event['sensor_id'],
            'estado_anterior': event['estado_anterior'],
            'estado_nuevo': event['estado_nuevo']
        }))
```

### Eventos WebSocket

| Evento | Descripción | Datos |
|--------|-------------|-------|
| `sensor_update` | Cambio de estado de sensor | `sensor_id`, `estado_anterior`, `estado_nuevo` |
| `aula_heartbeat` | Heartbeat del aula | `aula_id`, `estado`, `timestamp` |
| `aula_status_change` | Cambio de estado del aula | `estado_anterior`, `estado_nuevo` |
| `luz_toggle` | Cambio específico de luces | `sensor_id`, `estado_anterior`, `estado_nuevo` |
| `connection_established` | Conexión establecida | `aula_id`, `timestamp` |

### Endpoints ESP32

```bash
# Heartbeat desde ESP32
POST /api/sensors/esp32/heartbeat/
{
  "ip": "192.168.1.100",
  "sensores": [
    {"id": 1, "tipo": "luz", "estado": true, "pin": 23}
  ]
}

# Actualización individual
POST /api/sensors/esp32/sensor-update/
{
  "ip": "192.168.1.100",
  "sensor_id": 2,
  "nuevo_estado": true
}
```

## Frontend React Hooks

### useWebSocket

Hook principal para gestión de conexiones WebSocket:

```jsx
import useWebSocket from '../hooks/useWebSocket';

const MyComponent = ({ aulaId }) => {
  const {
    isConnected,
    sensorUpdates,
    connectionError,
    sendCommand,
    subscribeToAula
  } = useWebSocket(aulaId);

  const handleToggleLight = () => {
    sendCommand(sensorId, 'toggle');
  };

  return (
    <div>
      <ConnectionIndicator isConnected={isConnected} />
      <button onClick={handleToggleLight} disabled={!isConnected}>
        Toggle Light
      </button>
    </div>
  );
};
```

### useRealtimeNotifications

Hook avanzado con notificaciones y cola offline:

```jsx
import useRealtimeNotifications from '../hooks/useRealtimeNotifications';

const AdvancedComponent = ({ aulaId }) => {
  const {
    notifications,
    aulaStatuses,
    sendCommand,
    removeNotification
  } = useRealtimeNotifications(aulaId);

  return (
    <div>
      <NotificationContainer
        notifications={notifications}
        onRemoveNotification={removeNotification}
      />
      <button onClick={() => sendCommand(sensorId, 'toggle')}>
        Toggle with Optimistic Update
      </button>
    </div>
  );
};
```

## Componentes UI

### ConnectionIndicator

Muestra el estado de conexión en tiempo real:

```jsx
import ConnectionIndicator from '../components/ConnectionIndicator';

<ConnectionIndicator
  isConnected={isConnected}
  connectionError={connectionError}
  lastHeartbeat={lastHeartbeat}
  offlineQueue={offlineQueue}
/>
```

### RealtimeStatusBar

Barra superior con estado global:

```jsx
import RealtimeStatusBar from '../components/RealtimeStatusBar';

<RealtimeStatusBar aulaId={aulaId} />
```

### SensorCard

Tarjeta de sensor optimizada:

```jsx
import SensorCard from '../components/SensorCard';

<SensorCard
  sensor={sensor}
  aulaId={aulaId}
  onUpdate={handleUpdate}
/>
```

## Optimizaciones Implementadas

### Debounce y Throttle

```js
import { useDebounce, useThrottle } from '../utils/performance';

// Evitar múltiples cambios rápidos
const debouncedSearch = useDebounce(searchTerm, 300);

// Limitar frecuencia de actualizaciones
const throttledPosition = useThrottle(mousePosition, 16); // 60fps
```

### Batch Updates

```js
import { useBatchUpdate } from '../utils/performance';

const batchUpdate = useBatchUpdate((updates) => {
  // Procesar múltiples actualizaciones juntas
  console.log('Batch update:', updates);
}, 100);
```

### Cache con TTL

```js
import { useCache } from '../utils/performance';

const [cachedData, setCachedData, clearCache] = useCache('api_data', null, 300000); // 5 min
```

## Configuración de Producción

### Variables de Entorno Backend

```env
# Redis para producción
REDIS_URL=redis://127.0.0.1:6379/1

# Configuración de seguridad
DEBUG=False
SECRET_KEY=your-production-secret
ALLOWED_HOSTS=yourdomain.com
```

### Variables de Entorno Frontend

```env
# WebSocket URL
VITE_WS_URL=ws://localhost:8000

# Configuración de reconexión
VITE_WS_RECONNECT_ATTEMPTS=5
VITE_WS_RECONNECT_INTERVAL=30000
```

### Instalación Redis (Producción)

```bash
# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Configurar en Django settings.py
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [os.getenv('REDIS_URL', 'redis://127.0.0.1:6379/1')],
        },
    },
}
```

## Monitoreo y Debugging

### Logs Backend

```python
# En settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'channels': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

### Debug Frontend

```js
// En navegador consola
// Ver estado de conexión
console.log('WebSocket connected:', isConnected);
console.log('Pending commands:', offlineQueue.length);
console.log('Last heartbeat:', lastHeartbeat);

// Eventos WebSocket
socket.onAny((event, data) => {
  console.log('WebSocket event:', event, data);
});
```

## Testing

### Tests Backend

```python
# Test de consumer WebSocket
class AulaConsumerTests(TestCase):
    async def test_sensor_update_broadcast(self):
        # Crear mock de mensaje
        message = {
            'type': 'sensor_update',
            'sensor_id': 1,
            'estado_anterior': 'false',
            'estado_nuevo': 'true'
        }

        # Enviar a grupo
        await channel_layer.group_send(
            'aula_1',
            message
        )

        # Verificar que se recibió
        self.assertEqual(received_message, message)
```

### Tests Frontend

```jsx
import { render, screen } from '@testing-library/react';
import useWebSocket from '../hooks/useWebSocket';

test('WebSocket connection', () => {
  render(<TestComponent aulaId={1} />);

  expect(screen.getByText('Connected')).toBeInTheDocument();
});
```

## Troubleshooting

### Problemas Comunes

1. **WebSocket no conecta**
   - Verificar que Django Channels esté corriendo
   - Comprobar configuración ASGI
   - Validar permisos de red

2. **Mensajes no llegan**
   - Verificar grupos de channels
   - Comprobar formato de mensajes
   - Revisar logs de Django

3. **Reconexión infinita**
   - Ajustar `maxReconnectAttempts`
   - Verificar estado del servidor
   - Comprobar configuración de timeout

4. **Performance issues**
   - Usar batch updates para múltiples cambios
   - Implementar debounce en búsquedas
   - Configurar cache apropiado

### Comandos Útiles

```bash
# Backend
python manage.py runserver  # Servidor desarrollo
python manage.py shell     # Debug interactivo

# Frontend
npm run dev               # Desarrollo con hot reload
npm run build            # Build producción

# Redis (si aplica)
redis-cli ping           # Verificar Redis
redis-cli monitor        # Monitorear comandos Redis
```

## Próximos Pasos

1. **Implementar autenticación JWT en WebSocket**
2. **Agregar métricas y monitoreo avanzado**
3. **Soporte para múltiples servidores**
4. **Sistema de alertas configurables**
5. **Dashboard administrativo con gráficos en tiempo real**

---

**Estado**: ✅ Sistema completo implementado y documentado
