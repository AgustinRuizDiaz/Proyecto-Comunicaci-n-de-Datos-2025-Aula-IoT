"""
Sistema de debounce para actualizaciones de sensores
"""

import asyncio
import time
from collections import defaultdict
from typing import Dict, List, Callable, Any
from django.core.cache import cache


class SensorDebounceManager:
    """
    Gestor de debounce para actualizaciones de sensores
    Agrupa múltiples cambios rápidos en una sola operación
    """

    def __init__(self):
        self.pending_updates = defaultdict(list)
        self.debounce_timers = {}
        self.debounce_delay = 2.0  # segundos
        self.max_batch_size = 50  # máximo número de updates por batch

    async def debounce_sensor_update(self, sensor_id: int, new_state: str, aula_id: int = None):
        """
        Añadir actualización de sensor al sistema de debounce

        Args:
            sensor_id: ID del sensor
            new_state: Nuevo estado del sensor
            aula_id: ID del aula (opcional)
        """
        current_time = time.time()

        # Crear clave única para el sensor
        sensor_key = f"sensor_{sensor_id}"

        # Añadir actualización pendiente
        update_data = {
            'sensor_id': sensor_id,
            'new_state': new_state,
            'aula_id': aula_id,
            'timestamp': current_time
        }

        self.pending_updates[sensor_key].append(update_data)

        # Si no hay timer activo para este sensor, crear uno
        if sensor_key not in self.debounce_timers:
            self.debounce_timers[sensor_key] = asyncio.create_task(
                self._process_debounced_updates(sensor_key)
            )

    async def _process_debounced_updates(self, sensor_key: str):
        """
        Procesar actualizaciones debounced para un sensor específico
        """
        try:
            # Esperar el tiempo de debounce
            await asyncio.sleep(self.debounce_delay)

            # Obtener todas las actualizaciones pendientes para este sensor
            updates = self.pending_updates[sensor_key]

            if not updates:
                return

            # Usar la actualización más reciente
            latest_update = max(updates, key=lambda x: x['timestamp'])

            # Procesar la actualización
            await self._execute_sensor_update(latest_update)

            # Limpiar actualizaciones procesadas
            self.pending_updates[sensor_key] = []

        except asyncio.CancelledError:
            # Timer fue cancelado, limpiar estado
            self.pending_updates[sensor_key] = []
        except Exception as e:
            print(f"Error procesando actualización debounced para sensor {sensor_key}: {e}")
            self.pending_updates[sensor_key] = []
        finally:
            # Limpiar timer
            self.debounce_timers.pop(sensor_key, None)

    async def _execute_sensor_update(self, update_data: Dict[str, Any]):
        """
        Ejecutar la actualización del sensor (debe ser implementado por el consumidor)
        """
        # Esta función debe ser sobreescrita o llamada con un callback
        # Por ahora, solo logueamos
        print(f"Ejecutando actualización debounced: {update_data}")

        # Aquí se podría llamar a funciones específicas del consumidor
        # o enviar mensajes a través de channels

    def force_flush_sensor(self, sensor_id: int) -> Dict[str, Any]:
        """
        Forzar procesamiento inmediato de actualizaciones pendientes para un sensor

        Args:
            sensor_id: ID del sensor

        Returns:
            Datos de la última actualización pendiente o None
        """
        sensor_key = f"sensor_{sensor_id}"
        updates = self.pending_updates.get(sensor_key, [])

        if not updates:
            return None

        # Cancelar timer si existe
        if sensor_key in self.debounce_timers:
            self.debounce_timers[sensor_key].cancel()
            self.debounce_timers.pop(sensor_key, None)

        # Procesar inmediatamente
        latest_update = max(updates, key=lambda x: x['timestamp'])

        # Crear tarea para procesar inmediatamente
        asyncio.create_task(self._execute_sensor_update(latest_update))

        # Limpiar
        self.pending_updates[sensor_key] = []

        return latest_update

    def flush_all_pending(self):
        """
        Forzar procesamiento inmediato de todas las actualizaciones pendientes
        """
        for sensor_key in list(self.pending_updates.keys()):
            self.force_flush_sensor(int(sensor_key.split('_')[1]))

    def get_pending_count(self) -> int:
        """Obtener número total de actualizaciones pendientes"""
        return sum(len(updates) for updates in self.pending_updates.values())

    def get_sensor_pending_count(self, sensor_id: int) -> int:
        """Obtener número de actualizaciones pendientes para un sensor específico"""
        sensor_key = f"sensor_{sensor_id}"
        return len(self.pending_updates.get(sensor_key, []))

    def cleanup_old_updates(self, max_age_seconds: int = 60):
        """
        Limpiar actualizaciones pendientes muy antiguas

        Args:
            max_age_seconds: Edad máxima en segundos para mantener actualizaciones
        """
        current_time = time.time()
        cutoff_time = current_time - max_age_seconds

        for sensor_key in list(self.pending_updates.keys()):
            updates = self.pending_updates[sensor_key]
            # Filtrar actualizaciones recientes
            recent_updates = [u for u in updates if u['timestamp'] > cutoff_time]

            if len(recent_updates) != len(updates):
                self.pending_updates[sensor_key] = recent_updates

                # Si no quedan actualizaciones recientes, limpiar timer
                if not recent_updates and sensor_key in self.debounce_timers:
                    self.debounce_timers[sensor_key].cancel()
                    self.debounce_timers.pop(sensor_key, None)


# Instancia global del gestor de debounce
debounce_manager = SensorDebounceManager()


class DebouncedAulaConsumer:
    """
    Wrapper para AulaConsumer que añade funcionalidad de debounce
    """

    def __init__(self, consumer_instance):
        self.consumer = consumer_instance
        self.debounce_manager = debounce_manager

    async def debounced_sensor_update(self, sensor_id: int, new_state: str, aula_id: int = None):
        """
        Actualizar sensor con debounce
        """
        await self.debounce_manager.debounce_sensor_update(sensor_id, new_state, aula_id)

    async def immediate_sensor_update(self, sensor_id: int, new_state: str, aula_id: int = None):
        """
        Actualizar sensor inmediatamente (sin debounce)
        """
        self.debounce_manager.force_flush_sensor(sensor_id)
        # Aquí se ejecutaría la actualización inmediata
        await self.consumer.update_sensor_state_immediate(sensor_id, new_state)

    def get_debounce_stats(self) -> Dict[str, Any]:
        """Obtener estadísticas del sistema de debounce"""
        return {
            'pending_updates': self.debounce_manager.get_pending_count(),
            'active_timers': len(self.debounce_manager.debounce_timers),
            'sensors_with_pending': len(self.debounce_manager.pending_updates)
        }
