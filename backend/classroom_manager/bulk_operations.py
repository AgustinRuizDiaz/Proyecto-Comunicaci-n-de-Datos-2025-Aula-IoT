"""
Utilidades para operaciones bulk en el sistema de aulas
"""

from django.db import transaction
from django.utils import timezone
from typing import List, Dict, Any
from collections import defaultdict

from classrooms.models import Aula
from sensors.models import Sensor
from history.models import Registro


class BulkOperationsManager:
    """Gestor para operaciones bulk eficientes"""

    @staticmethod
    def bulk_update_aulas(aulas_data: List[Dict[str, Any]]) -> int:
        """
        Actualizar múltiples aulas en una sola operación

        Args:
            aulas_data: Lista de diccionarios con datos de aulas a actualizar
                       Formato: [{'id': 1, 'nombre': 'Nuevo nombre', ...}, ...]

        Returns:
            Número de aulas actualizadas
        """
        if not aulas_data:
            return 0

        # Preparar objetos para actualización
        aulas_to_update = []
        for aula_data in aulas_data:
            aula_id = aula_data.pop('id')
            try:
                aula = Aula.objects.get(id=aula_id)
                for field, value in aula_data.items():
                    setattr(aula, field, value)
                aulas_to_update.append(aula)
            except Aula.DoesNotExist:
                continue

        if not aulas_to_update:
            return 0

        # Usar bulk_update para máxima eficiencia
        fields_to_update = list(aulas_data[0].keys())
        Aula.objects.bulk_update(aulas_to_update, fields_to_update)

        return len(aulas_to_update)

    @staticmethod
    def bulk_update_sensors(sensors_data: List[Dict[str, Any]]) -> int:
        """
        Actualizar múltiples sensores en una sola operación

        Args:
            sensors_data: Lista de diccionarios con datos de sensores
                         Formato: [{'id': 1, 'estado_actual': 'true', ...}, ...]

        Returns:
            Número de sensores actualizados
        """
        if not sensors_data:
            return 0

        sensors_to_update = []
        for sensor_data in sensors_data:
            sensor_id = sensor_data.pop('id')
            try:
                sensor = Sensor.objects.get(id=sensor_id)
                for field, value in sensor_data.items():
                    setattr(sensor, field, value)
                sensors_to_update.append(sensor)
            except Sensor.DoesNotExist:
                continue

        if not sensors_to_update:
            return 0

        fields_to_update = list(sensors_data[0].keys())
        Sensor.objects.bulk_update(sensors_to_update, fields_to_update)

        return len(sensors_to_update)

    @staticmethod
    def bulk_create_registros(registros_data: List[Dict[str, Any]]) -> int:
        """
        Crear múltiples registros en una sola operación

        Args:
            registros_data: Lista de diccionarios con datos de registros
                           Formato: [{'sensor_id': 1, 'estado_anterior': 'false', ...}, ...]

        Returns:
            Número de registros creados
        """
        if not registros_data:
            return 0

        # Preparar objetos Registro
        registros_to_create = []
        for registro_data in registros_data:
            sensor_id = registro_data['sensor_id']
            try:
                sensor = Sensor.objects.get(id=sensor_id)
                registro = Registro(
                    sensor=sensor,
                    estado_anterior=registro_data.get('estado_anterior', ''),
                    estado_nuevo=registro_data.get('estado_nuevo', ''),
                    tipo_cambio=registro_data.get('tipo_cambio', 'automatico'),
                    fecha=registro_data.get('fecha', timezone.now().date()),
                    hora=registro_data.get('hora', timezone.now().time()),
                    usuario_id=registro_data.get('usuario_id')
                )
                registros_to_create.append(registro)
            except Sensor.DoesNotExist:
                continue

        if not registros_to_create:
            return 0

        # Usar bulk_create para máxima eficiencia
        Registro.objects.bulk_create(registros_to_create)

        return len(registros_to_create)

    @staticmethod
    def bulk_update_heartbeat_status(aulas_status: Dict[int, str]) -> int:
        """
        Actualizar estado de heartbeat de múltiples aulas

        Args:
            aulas_status: Diccionario con aula_id -> status

        Returns:
            Número de aulas actualizadas
        """
        if not aulas_status:
            return 0

        # Usar transacción para atomicidad
        with transaction.atomic():
            updated_count = 0
            for aula_id, status in aulas_status.items():
                try:
                    Aula.objects.filter(id=aula_id).update(
                        ultima_señal=timezone.now(),
                        # Podríamos añadir un campo estado_conexion si fuera necesario
                    )
                    updated_count += 1
                except Exception:
                    continue

        return updated_count

    @staticmethod
    def bulk_sensor_update_with_history(sensors_updates: List[Dict[str, Any]], usuario=None) -> Dict[str, int]:
        """
        Actualizar múltiples sensores y crear registros de historial en una operación

        Args:
            sensors_updates: Lista de actualizaciones de sensores
                           Formato: [{'sensor_id': 1, 'estado_nuevo': 'true', 'tipo_cambio': 'manual'}, ...]
            usuario: Usuario que realiza la operación (opcional)

        Returns:
            Diccionario con estadísticas: {'sensores_actualizados': int, 'registros_creados': int}
        """
        if not sensors_updates:
            return {'sensores_actualizados': 0, 'registros_creados': 0}

        # Agrupar por sensor para obtener estados actuales
        sensor_ids = [update['sensor_id'] for update in sensors_updates]
        sensors = Sensor.objects.filter(id__in=sensor_ids).select_related('aula')

        # Crear mapas para acceso rápido
        sensors_by_id = {sensor.id: sensor for sensor in sensors}

        # Preparar datos para bulk operations
        sensors_to_update = []
        registros_data = []

        for update in sensors_updates:
            sensor_id = update['sensor_id']
            sensor = sensors_by_id.get(sensor_id)

            if not sensor:
                continue

            estado_anterior = sensor.estado_actual
            estado_nuevo = update['estado_nuevo']

            # Preparar sensor para actualización
            sensor.estado_actual = estado_nuevo
            sensor.ultima_actualizacion = timezone.now()
            sensors_to_update.append(sensor)

            # Preparar registro
            registros_data.append({
                'sensor_id': sensor_id,
                'estado_anterior': estado_anterior,
                'estado_nuevo': estado_nuevo,
                'tipo_cambio': update.get('tipo_cambio', 'automatico'),
                'usuario_id': usuario.id if usuario else None
            })

        # Ejecutar operaciones bulk en transacción
        with transaction.atomic():
            # Actualizar sensores
            sensors_updated = 0
            if sensors_to_update:
                Sensor.objects.bulk_update(
                    sensors_to_update,
                    ['estado_actual', 'ultima_actualizacion']
                )
                sensors_updated = len(sensors_to_update)

            # Crear registros
            registros_created = BulkOperationsManager.bulk_create_registros(registros_data)

        return {
            'sensores_actualizados': sensors_updated,
            'registros_creados': registros_created
        }

    @staticmethod
    def get_aulas_with_sensor_counts() -> List[Dict[str, Any]]:
        """
        Obtener aulas con conteos de sensores usando consulta optimizada

        Returns:
            Lista de diccionarios con información de aulas y sensores
        """
        aulas = Aula.objects.annotate(
            sensores_count=models.Count('sensores')
        ).prefetch_related(
            'sensores'
        ).select_related()

        result = []
        for aula in aulas:
            # Contar sensores por tipo
            sensores_por_tipo = defaultdict(lambda: {'total': 0, 'activos': 0})

            for sensor in aula.sensores.all():
                tipo = sensor.tipo
                sensores_por_tipo[tipo]['total'] += 1
                if sensor.estado_actual in ['true', '1', 'on', 'encendido']:
                    sensores_por_tipo[tipo]['activos'] += 1

            aula_data = {
                'id': aula.id,
                'nombre': aula.nombre,
                'ip_esp32': aula.ip_esp32,
                'estado_conexion': aula.estado_conexion,
                'ultima_señal': aula.ultima_señal,
                'sensores_count': aula.sensores_count,
                'sensores_por_tipo': dict(sensores_por_tipo),
                'luces_prendidas': sensores_por_tipo.get('luz', {}).get('activos', 0)
            }
            result.append(aula_data)

        return result
