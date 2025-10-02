import json
from datetime import datetime
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from django.utils import timezone
from django.db import transaction
from django.core.cache import cache

from .models import Sensor
from .serializers import SensorSerializer
from users.permissions import CanAccessSensorData


class SensorViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de sensores con permisos basados en roles

    - Admin: CRUD completo
    - Operario: CRUD completo (manejan sensores)
    """
    queryset = Sensor.objects.select_related('aula').prefetch_related('aula__sensores')
    serializer_class = SensorSerializer
    permission_classes = [CanAccessSensorData]  # Requiere permisos específicos


class ESP32HeartbeatView(View):
    """
    Endpoint para heartbeat de ESP32
    """

    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            ip_esp32 = data.get('ip')

            if not ip_esp32:
                return JsonResponse({
                    'success': False,
                    'error': {'message': 'IP ESP32 requerida'}
                }, status=400)

            # Buscar aula por IP
            try:
                from classrooms.models import Aula
                aula = Aula.objects.get(ip_esp32=ip_esp32)
            except Aula.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'error': {'message': 'Aula no encontrada'}
                }, status=404)

            # Actualizar última señal
            aula.ultima_señal = timezone.now()
            aula.save(update_fields=['ultima_señal'])

            # Procesar datos de sensores
            sensores_data = data.get('sensores', [])
            commands = []

            for sensor_data in sensores_data:
                sensor_id = sensor_data.get('id')
                estado_actual = sensor_data.get('estado')

                try:
                    sensor = Sensor.objects.get(id=sensor_id, aula=aula)

                    # Verificar si cambió el estado
                    if str(sensor.estado_actual) != str(estado_actual):
                        # Crear registro de cambio automático
                        from history.models import Registro
                        Registro.objects.create(
                            sensor=sensor,
                            estado_anterior=sensor.estado_actual,
                            estado_nuevo=estado_actual,
                            tipo_cambio='automatico'
                        )

                        # Actualizar estado del sensor
                        sensor.estado_actual = estado_actual
                        sensor.ultima_actualizacion = timezone.now()
                        sensor.save(update_fields=['estado_actual', 'ultima_actualizacion'])

                        # Verificar si necesita comandos basados en reglas
                        commands.extend(self._generate_commands(sensor, estado_actual))

                except Sensor.DoesNotExist:
                    continue

            # Enviar actualización por WebSocket
            from channels.layers import get_channel_layer
            channel_layer = get_channel_layer()

            # Broadcast de heartbeat
            import asyncio
            asyncio.create_task(channel_layer.group_send(
                f'aula_{aula.id}',
                {
                    'type': 'aula_heartbeat',
                    'aula_id': aula.id,
                    'timestamp': datetime.now().isoformat(),
                    'estado': aula.estado_conexion,
                    'ip_esp32': ip_esp32
                }
            ))

            # Broadcast de actualizaciones de sensores
            for command in commands:
                asyncio.create_task(channel_layer.group_send(
                    f'aula_{aula.id}',
                    {
                        'type': 'sensor_update',
                        'sensor_id': command['sensor_id'],
                        'action': command['action'],
                        'value': command['value'],
                        'estado_anterior': command['estado_anterior'],
                        'estado_nuevo': command['estado_nuevo'],
                        'timestamp': datetime.now().isoformat()
                    }
                ))

            return JsonResponse({
                'success': True,
                'data': {
                    'aula_id': aula.id,
                    'commands': commands,
                    'heartbeat_interval': 30,
                    'timeout_inactividad': aula.timeout_inactividad
                }
            })

        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': {'message': 'JSON inválido'}
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': {'message': f'Error interno: {str(e)}'}
            }, status=500)

    def _generate_commands(self, sensor, estado_actual):
        """
        Generar comandos automáticos basados en reglas de negocio
        """
        commands = []

        # Ejemplo: Si hay movimiento y está oscuro, encender luces
        if (sensor.tipo == 'movimiento' and estado_actual and
            hasattr(sensor, 'aula') and sensor.aula):

            # Buscar sensor de luz en la misma aula
            luces = Sensor.objects.filter(aula=sensor.aula, tipo='luz')
            for luz in luces:
                if luz.estado_actual == 'false':  # Si está apagada
                    commands.append({
                        'sensor_id': luz.id,
                        'action': 'toggle',
                        'value': True,
                        'estado_anterior': luz.estado_actual,
                        'estado_nuevo': 'true'
                    })

        # Ejemplo: Si no hay movimiento por X tiempo, apagar luces
        if (sensor.tipo == 'movimiento' and not estado_actual and
            hasattr(sensor, 'aula') and sensor.aula):

            # Verificar si hay luces encendidas
            luces = Sensor.objects.filter(aula=sensor.aula, tipo='luz')
            for luz in luces:
                if luz.estado_actual == 'true':  # Si está encendida
                    commands.append({
                        'sensor_id': luz.id,
                        'action': 'toggle',
                        'value': False,
                        'estado_anterior': luz.estado_actual,
                        'estado_nuevo': 'false'
                    })

        return commands


class ESP32SensorUpdateView(View):
    """
    Endpoint para actualizaciones individuales de sensores desde ESP32
    """

    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            ip_esp32 = data.get('ip')
            sensor_id = data.get('sensor_id')
            nuevo_estado = data.get('nuevo_estado')

            if not all([ip_esp32, sensor_id, nuevo_estado is not None]):
                return JsonResponse({
                    'success': False,
                    'error': {'message': 'Datos incompletos'}
                }, status=400)

            # Buscar aula por IP
            try:
                from classrooms.models import Aula
                aula = Aula.objects.get(ip_esp32=ip_esp32)
            except Aula.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'error': {'message': 'Aula no encontrada'}
                }, status=404)

            # Buscar sensor
            try:
                sensor = Sensor.objects.get(id=sensor_id, aula=aula)
            except Sensor.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'error': {'message': 'Sensor no encontrado'}
                }, status=404)

            # Verificar si cambió el estado
            estado_anterior = sensor.estado_actual
            if str(estado_anterior) != str(nuevo_estado):

                # Crear registro de cambio automático
                from history.models import Registro
                Registro.objects.create(
                    sensor=sensor,
                    estado_anterior=estado_anterior,
                    estado_nuevo=nuevo_estado,
                    tipo_cambio='automatico'
                )

                # Actualizar estado del sensor
                sensor.estado_actual = nuevo_estado
                sensor.ultima_actualizacion = timezone.now()
                sensor.save(update_fields=['estado_actual', 'ultima_actualizacion'])

                # Enviar actualización por WebSocket
                from channels.layers import get_channel_layer
                channel_layer = get_channel_layer()

                import asyncio
                asyncio.create_task(channel_layer.group_send(
                    f'aula_{aula.id}',
                    {
                        'type': 'sensor_update',
                        'sensor_id': sensor_id,
                        'action': 'update',
                        'value': nuevo_estado,
                        'estado_anterior': estado_anterior,
                        'estado_nuevo': nuevo_estado,
                        'timestamp': datetime.now().isoformat()
                    }
                ))

            return JsonResponse({
                'success': True,
                'data': {
                    'sensor_id': sensor_id,
                    'estado_actual': nuevo_estado
                }
            })

        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': {'message': 'JSON inválido'}
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': {'message': f'Error interno: {str(e)}'}
            }, status=500)
