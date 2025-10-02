import json
import asyncio
from datetime import datetime
from typing import Dict, Any

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from django.core.cache import cache

from classrooms.models import Aula
from sensors.models import Sensor
from history.models import Registro
from classroom_manager.cache_utils import CacheManager, cache_sensor_update, cache_aula_heartbeat
from classroom_manager.debounce_manager import debounce_manager


class AulaConsumer(AsyncWebsocketConsumer):
    """
    Consumer WebSocket para comunicación en tiempo real con aulas
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.aula_id = None
        self.aula_group_name = None
        self.heartbeat_task = None
        self.last_heartbeat_sent = None
        self.last_heartbeat_received = None
        self.is_authenticated = False
        self.debounce_manager = debounce_manager

    async def connect(self):
        """
        Manejar conexión WebSocket
        """
        try:
            # Obtener aula_id de los parámetros de consulta
            self.aula_id = self.scope['query_string'].decode().split('aula_id=')[-1]
            if not self.aula_id:
                await self.close(code=4001)
                return

            # Verificar que el aula existe
            aula_exists = await self.aula_exists(self.aula_id)
            if not aula_exists:
                await self.close(code=4002)  # Aula no encontrada
                return

            self.aula_group_name = f'aula_{self.aula_id}'

            # Unirse al grupo de la sala
            await self.channel_layer.group_add(
                self.aula_group_name,
                self.channel_name
            )

            await self.accept()

            # Actualizar última señal del aula
            await self.update_aula_last_signal()

            # Actualizar cache de conexión
            await self.update_connection_cache('online')

            # Iniciar heartbeat cada 30 segundos
            self.heartbeat_task = asyncio.create_task(self.heartbeat_loop())

            # Enviar confirmación de conexión
            await self.send(text_data=json.dumps({
                'type': 'connection_established',
                'aula_id': self.aula_id,
                'timestamp': datetime.now().isoformat(),
                'message': 'Conectado exitosamente al sistema de aulas'
            }))

            print(f'✅ WebSocket conectado para aula {self.aula_id}')

        except Exception as e:
            print(f'❌ Error en conexión WebSocket: {e}')
            await self.close(code=4000)

    async def disconnect(self, close_code):
        """
        Manejar desconexión WebSocket
        """
        try:
            # Cancelar tarea de heartbeat
            if self.heartbeat_task:
                self.heartbeat_task.cancel()

            # Salir del grupo de la sala
            if self.aula_group_name:
                await self.channel_layer.group_discard(
                    self.aula_group_name,
                    self.channel_name
                )

            print(f'❌ WebSocket desconectado para aula {self.aula_id}, código: {close_code}')

        except Exception as e:
            print(f'Error en desconexión: {e}')

    @database_sync_to_async
    def update_connection_cache(self, status):
        """Actualizar cache de estado de conexión"""
        try:
            cache_aula_heartbeat(self.aula_id, status)
        except Exception as e:
            print(f'Error actualizando cache de conexión: {e}')

    @database_sync_to_async
    def update_sensor_cache(self, sensor_id, new_state):
        """Actualizar cache de estado de sensor"""
        try:
            cache_sensor_update(sensor_id, new_state, self.aula_id)
        except Exception as e:
            print(f'Error actualizando cache de sensor: {e}')

    async def receive(self, text_data):
        """
        Manejar mensajes recibidos del cliente
        """
        try:
            data = json.loads(text_data)
            message_type = data.get('type')

            if message_type == 'heartbeat':
                # Responder al heartbeat del cliente
                await self.handle_heartbeat_response()
                await self.send(text_data=json.dumps({
                    'type': 'heartbeat_response',
                    'timestamp': datetime.now().isoformat()
                }))

            elif message_type == 'subscribe_aula':
                # Suscribirse a otra aula (para admins que ven múltiples aulas)
                target_aula_id = data.get('aula_id')
                if target_aula_id:
                    old_group = self.aula_group_name
                    self.aula_group_name = f'aula_{target_aula_id}'

                    # Cambiar de grupo
                    if old_group:
                        await self.channel_layer.group_discard(old_group, self.channel_name)
                    await self.channel_layer.group_add(self.aula_group_name, self.channel_name)

            elif message_type == 'unsubscribe_aula':
                # Desuscribirse de una aula
                target_aula_id = data.get('aula_id')
                if target_aula_id:
                    target_group = f'aula_{target_aula_id}'
                    await self.channel_layer.group_discard(target_group, self.channel_name)

            elif message_type == 'sensor_command':
                # Ejecutar comando en sensor
                await self.handle_sensor_command(data)

        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Formato de mensaje inválido'
            }))

    async def handle_sensor_command(self, data):
        """
        Manejar comandos de sensores
        """
        sensor_id = data.get('sensor_id')
        action = data.get('action')
        value = data.get('value')

        try:
            # Verificar que el sensor existe y pertenece al aula
            sensor = await self.get_sensor(sensor_id)
            if not sensor:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Sensor no encontrado'
                }))
                return

            # Crear registro en historial
            await self.create_sensor_record(sensor, action, value, 'manual')

            # Actualizar estado del sensor
            estado_anterior = await self.update_sensor_state(sensor, action, value)

            # Actualizar cache del sensor
            nuevo_estado = value if action == 'set' else not sensor.estado_actual if action == 'toggle' else value
            await self.update_sensor_cache(sensor.id, nuevo_estado)

            # Enviar confirmación
            await self.send(text_data=json.dumps({
                'type': 'command_executed',
                'sensor_id': sensor_id,
                'action': action,
                'value': value,
                'timestamp': datetime.now().isoformat()
            }))

            # Broadcast del cambio a todos los clientes de la sala
            await self.channel_layer.group_send(
                self.aula_group_name,
                {
                    'type': 'sensor_update',
                    'sensor_id': sensor_id,
                    'action': action,
                    'value': value,
                    'estado_anterior': sensor.estado_actual,
                    'estado_nuevo': value if action == 'set' else not sensor.estado_actual if action == 'toggle' else value,
                    'timestamp': datetime.now().isoformat()
                }
            )

        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f'Error ejecutando comando: {str(e)}'
            }))

    # Métodos de utilidad para operaciones de base de datos
    @database_sync_to_async
    def aula_exists(self, aula_id):
        """Verificar si existe el aula"""
        try:
            return Aula.objects.filter(id=aula_id).exists()
        except:
            return False

    @database_sync_to_async
    def update_aula_last_signal(self):
        """Actualizar última señal del aula"""
        try:
            aula = Aula.objects.get(id=self.aula_id)
            aula.ultima_señal = timezone.now()
            aula.save(update_fields=['ultima_señal'])
        except Aula.DoesNotExist:
            pass

    @database_sync_to_async
    def get_sensor(self, sensor_id):
        """Obtener sensor por ID"""
        try:
            return Sensor.objects.select_related('aula').get(id=sensor_id, aula_id=self.aula_id)
        except Sensor.DoesNotExist:
            return None

    @database_sync_to_async
    def update_sensor_state(self, sensor, action, value):
        """Actualizar estado del sensor"""
        estado_anterior = sensor.estado_actual

        if action == 'toggle':
            if sensor.tipo == 'luz' or sensor.tipo == 'rele':
                nuevo_estado = 'true' if estado_anterior == 'false' else 'false'
            else:
                nuevo_estado = value
        elif action == 'set':
            nuevo_estado = str(value)
        else:
            nuevo_estado = str(value)

        sensor.estado_actual = nuevo_estado
        sensor.ultima_actualizacion = timezone.now()
        sensor.save(update_fields=['estado_actual', 'ultima_actualizacion'])

        return estado_anterior

    @database_sync_to_async
    def create_sensor_record(self, sensor, action, value, tipo_cambio):
        """Crear registro en historial"""
        estado_anterior = sensor.estado_actual

        if action == 'toggle':
            estado_nuevo = 'true' if estado_anterior == 'false' else 'false'
        else:
            estado_nuevo = str(value)

        Registro.objects.create(
            sensor=sensor,
            usuario=None,  # Los comandos desde ESP32 no tienen usuario específico
            estado_anterior=estado_anterior,
            estado_nuevo=estado_nuevo,
            tipo_cambio=tipo_cambio
        )

    async def heartbeat_loop(self):
        """
        Loop de heartbeat mejorado con monitoreo de conexión
        """
        try:
            while True:
                await asyncio.sleep(30)  # Cada 30 segundos

                current_time = timezone.now()

                # Verificar si hemos recibido heartbeat del cliente recientemente
                if self.last_heartbeat_received:
                    time_since_last_heartbeat = current_time - self.last_heartbeat_received
                    if time_since_last_heartbeat.total_seconds() > 90:  # 90 segundos sin respuesta
                        print(f'⚠️ Cliente no responde heartbeat para aula {self.aula_id}')
                        # Podríamos marcar como desconectado o tomar acciones

                # Enviar heartbeat a clientes conectados
                await self.channel_layer.group_send(
                    self.aula_group_name,
                    {
                        'type': 'aula_heartbeat',
                        'aula_id': self.aula_id,
                        'timestamp': datetime.now().isoformat(),
                        'estado': await self.get_aula_status(),
                        'uptime': await self.get_connection_uptime()
                    }
                )

                self.last_heartbeat_sent = current_time

        except asyncio.CancelledError:
            print(f'Heartbeat loop cancelado para aula {self.aula_id}')
        except Exception as e:
            print(f'Error en heartbeat loop para aula {self.aula_id}: {e}')

    @database_sync_to_async
    def get_connection_uptime(self):
        """Obtener tiempo de conexión activa"""
        if not self.last_heartbeat_sent:
            return 0

        uptime_seconds = (timezone.now() - self.last_heartbeat_sent).total_seconds()
        return int(uptime_seconds)

    async def handle_heartbeat_response(self):
        """Manejar respuesta de heartbeat del cliente"""
        self.last_heartbeat_received = timezone.now()

        # Actualizar cache con información de heartbeat
        await self.update_connection_cache('online')

    @database_sync_to_async
    def get_aula_status(self):
        """Obtener estado actual del aula"""
        try:
            aula = Aula.objects.get(id=self.aula_id)
            return aula.estado_conexion
        except Aula.DoesNotExist:
            return 'desconocido'

    # Métodos para manejar mensajes de grupo
    async def sensor_update(self, event):
        """
        Manejar actualizaciones de sensores desde otros clientes o ESP32
        """
        await self.send(text_data=json.dumps({
            'type': 'sensor_update',
            'sensor_id': event['sensor_id'],
            'action': event['action'],
            'value': event['value'],
            'estado_anterior': event['estado_anterior'],
            'estado_nuevo': event['estado_nuevo'],
            'timestamp': event['timestamp']
        }))

    async def aula_heartbeat(self, event):
        """
        Manejar heartbeat del aula
        """
        await self.send(text_data=json.dumps({
            'type': 'aula_heartbeat',
            'aula_id': event['aula_id'],
            'timestamp': event['timestamp'],
            'estado': event['estado']
        }))

    async def aula_status_change(self, event):
        """
        Manejar cambios de estado del aula
        """
        await self.send(text_data=json.dumps({
            'type': 'aula_status_change',
            'aula_id': event['aula_id'],
            'estado_anterior': event['estado_anterior'],
            'estado_nuevo': event['estado_nuevo'],
            'timestamp': event['timestamp']
        }))

    async def luz_toggle(self, event):
        """
        Manejar cambios de luces
        """
        await self.send(text_data=json.dumps({
            'type': 'luz_toggle',
            'sensor_id': event['sensor_id'],
            'estado_anterior': event['estado_anterior'],
            'estado_nuevo': event['estado_nuevo'],
            'timestamp': event['timestamp']
        }))
