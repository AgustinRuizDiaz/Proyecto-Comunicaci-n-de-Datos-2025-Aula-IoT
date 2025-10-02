import os
from django.conf import settings
from django.core.cache import cache
from django.core.cache.backends.redis import RedisCache

# Configuración de cache
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}

# Si está configurado Redis, usar Redis para cache
if os.getenv('REDIS_URL'):
    CACHES['default'] = {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': os.getenv('REDIS_URL'),
    }

# Cache específico para sesiones de WebSocket
CACHES['websocket_sessions'] = {
    'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    'TIMEOUT': 3600,  # 1 hora
    'OPTIONS': {
        'MAX_ENTRIES': 1000,
    }
}

# Cache para heartbeat y estados de conexión (corto plazo)
CACHES['connection_status'] = {
    'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    'TIMEOUT': 60,  # 1 minuto
    'OPTIONS': {
        'MAX_ENTRIES': 500,
    }
}

# Cache para estadísticas de aulas (actualizaciones menos frecuentes)
CACHES['aula_stats'] = {
    'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    'TIMEOUT': 600,  # 10 minutos
    'OPTIONS': {
        'MAX_ENTRIES': 200,
    }
}

# Cache para historial reciente de sensores
CACHES['sensor_history'] = {
    'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    'TIMEOUT': 1800,  # 30 minutos
    'OPTIONS': {
        'MAX_ENTRIES': 5000,
    }
}

# Configuración de cache para producción
if not settings.DEBUG:
    # Usar Redis para producción si está disponible
    redis_url = os.getenv('REDIS_URL')
    if redis_url:
        CACHES['default'] = {
            'BACKEND': 'django.core.cache.backends.redis.RedisCache',
            'LOCATION': redis_url,
            'OPTIONS': {
                'CLIENT_CLASS': 'django_redis.client.DefaultClient',
                'CONNECTION_POOL_KWARGS': {
                    'max_connections': 20,
                    'decode_responses': True,
                }
            }
        }

        # Cache separado para sesiones largas
        CACHES['sessions'] = {
            'BACKEND': 'django.core.cache.backends.redis.RedisCache',
            'LOCATION': redis_url,
            'OPTIONS': {
                'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            }
        }
