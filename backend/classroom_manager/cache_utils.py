"""
Utilidades para manejo de cache en el sistema de aulas
"""

from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta
import json


class CacheManager:
    """Gestor centralizado para operaciones de cache"""

    @staticmethod
    def get_connection_status(aula_id):
        """Obtener estado de conexión de un aula desde cache"""
        return cache.get(f'connection_status:{aula_id}')

    @staticmethod
    def set_connection_status(aula_id, status, timeout=60):
        """Guardar estado de conexión de un aula en cache"""
        cache.set(f'connection_status:{aula_id}', status, timeout)

    @staticmethod
    def delete_connection_status(aula_id):
        """Eliminar estado de conexión de un aula del cache"""
        cache.delete(f'connection_status:{aula_id}')

    @staticmethod
    def get_sensor_state(sensor_id):
        """Obtener estado actual de un sensor desde cache"""
        return cache.get(f'sensor_state:{sensor_id}')

    @staticmethod
    def set_sensor_state(sensor_id, state, timeout=300):
        """Guardar estado de un sensor en cache"""
        cache.set(f'sensor_state:{sensor_id}', state, timeout)

    @staticmethod
    def delete_sensor_state(sensor_id):
        """Eliminar estado de un sensor del cache"""
        cache.delete(f'sensor_state:{sensor_id}')

    @staticmethod
    def get_aula_stats(aula_id):
        """Obtener estadísticas de un aula desde cache"""
        return cache.get(f'aula_stats:{aula_id}')

    @staticmethod
    def set_aula_stats(aula_id, stats, timeout=600):
        """Guardar estadísticas de un aula en cache"""
        cache.set(f'aula_stats:{aula_id}', stats, timeout)

    @staticmethod
    def delete_aula_stats(aula_id):
        """Eliminar estadísticas de un aula del cache"""
        cache.delete(f'aula_stats:{aula_id}')

    @staticmethod
    def get_recent_sensor_history(sensor_id, limit=10):
        """Obtener historial reciente de un sensor desde cache"""
        return cache.get(f'sensor_history:{sensor_id}', [])

    @staticmethod
    def add_sensor_history_entry(sensor_id, entry, timeout=1800):
        """Añadir entrada al historial de un sensor en cache"""
        key = f'sensor_history:{sensor_id}'
        history = cache.get(key, [])

        # Añadir nueva entrada
        history.insert(0, {
            **entry,
            'cached_at': timezone.now().isoformat()
        })

        # Mantener solo las últimas entradas
        history = history[:limit]

        cache.set(key, history, timeout)

    @staticmethod
    def clear_sensor_history(sensor_id):
        """Limpiar historial de un sensor del cache"""
        cache.delete(f'sensor_history:{sensor_id}')

    @staticmethod
    def get_heartbeat_info(aula_id):
        """Obtener información de heartbeat de un aula"""
        return cache.get(f'heartbeat:{aula_id}')

    @staticmethod
    def set_heartbeat_info(aula_id, info, timeout=90):
        """Guardar información de heartbeat de un aula"""
        cache.set(f'heartbeat:{aula_id}', info, timeout)

    @staticmethod
    def cleanup_expired_keys():
        """Limpiar claves expiradas (operación de mantenimiento)"""
        # Esta función es principalmente informativa ya que Django maneja la expiración automáticamente
        # Pero podemos usarla para logging o métricas
        pass

    @staticmethod
    def get_cache_stats():
        """Obtener estadísticas básicas del cache"""
        # Nota: Esta función depende del backend de cache usado
        # Para LocMemCache, devuelve información limitada
        try:
            if hasattr(cache, '_cache'):
                return {
                    'backend': 'LocMemCache',
                    'max_entries': getattr(cache._cache, 'max_entries', 'N/A'),
                    'currsize': len(cache._cache) if hasattr(cache._cache, '__len__') else 'N/A'
                }
            return {'backend': 'Unknown'}
        except:
            return {'backend': 'Error accessing cache stats'}


def cache_sensor_update(sensor_id, new_state, aula_id=None):
    """
    Función helper para actualizar cache cuando cambia un sensor
    """
    # Actualizar estado del sensor
    CacheManager.set_sensor_state(sensor_id, new_state)

    # Añadir al historial
    entry = {
        'sensor_id': sensor_id,
        'state': new_state,
        'timestamp': timezone.now().isoformat(),
        'aula_id': aula_id
    }
    CacheManager.add_sensor_history_entry(sensor_id, entry)

    # Invalidar estadísticas del aula para forzar recálculo
    if aula_id:
        CacheManager.delete_aula_stats(aula_id)


def cache_aula_heartbeat(aula_id, status='online'):
    """
    Función helper para actualizar cache cuando hay heartbeat de aula
    """
    # Actualizar estado de conexión
    CacheManager.set_connection_status(aula_id, status)

    # Actualizar información de heartbeat
    heartbeat_info = {
        'aula_id': aula_id,
        'status': status,
        'last_heartbeat': timezone.now().isoformat()
    }
    CacheManager.set_heartbeat_info(aula_id, heartbeat_info)


def get_cached_aula_data(aula_id):
    """
    Obtener datos de aula desde cache, fallback a base de datos si no está en cache
    """
    # Intentar obtener de cache primero
    cached_stats = CacheManager.get_aula_stats(aula_id)
    if cached_stats:
        return cached_stats

    # Si no está en cache, devolver None para que el llamador consulte la BD
    return None
