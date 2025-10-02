from rest_framework import serializers
from django.db.models import Count, Q
from .models import Aula, ConfiguracionAula


class SensorSummarySerializer(serializers.Serializer):
    """Serializer para resumen de sensores por tipo"""
    tipo = serializers.CharField()
    cantidad = serializers.IntegerField()
    activos = serializers.IntegerField()


class AulaSerializer(serializers.ModelSerializer):
    """Serializer básico para Aula"""
    estado_conexion = serializers.SerializerMethodField()
    tiempo_desde_ultima_senal = serializers.SerializerMethodField()
    sensores_count = serializers.SerializerMethodField()

    class Meta:
        model = Aula
        fields = [
            'id', 'nombre', 'ip_esp32', 'ultima_señal',
            'timeout_inactividad', 'apagado_automatico',
            'estado_conexion', 'tiempo_desde_ultima_senal', 'sensores_count'
        ]
        read_only_fields = ['id', 'ultima_señal', 'estado_conexion', 'tiempo_desde_ultima_senal', 'sensores_count']

    def get_estado_conexion(self, obj):
        """Obtener estado de conexión"""
        return obj.estado_conexion

    def get_tiempo_desde_ultima_senal(self, obj):
        """Formatear tiempo desde última señal"""
        tiempo = obj.tiempo_desde_ultima_senal
        if tiempo is None:
            return None
        return {
            'minutos': int(tiempo.total_seconds() / 60),
            'segundos': int(tiempo.total_seconds() % 60)
        }

    def get_sensores_count(self, obj):
        """Contar sensores del aula"""
        return obj.sensores.count()


class AulaDetailSerializer(serializers.ModelSerializer):
    """Serializer detallado para Aula con sensores incluidos"""
    estado_conexion = serializers.SerializerMethodField()
    tiempo_desde_ultima_senal = serializers.SerializerMethodField()
    sensores_count = serializers.SerializerMethodField()
    sensores_por_tipo = serializers.SerializerMethodField()
    luces_prendidas = serializers.SerializerMethodField()

    # Incluir sensores relacionados
    sensores = serializers.SerializerMethodField()

    class Meta:
        model = Aula
        fields = [
            'id', 'nombre', 'ip_esp32', 'ultima_señal',
            'timeout_inactividad', 'apagado_automatico',
            'estado_conexion', 'tiempo_desde_ultima_senal',
            'sensores_count', 'sensores_por_tipo', 'luces_prendidas',
            'sensores'
        ]
        read_only_fields = [
            'id', 'ultima_señal', 'estado_conexion', 'tiempo_desde_ultima_senal',
            'sensores_count', 'sensores_por_tipo', 'luces_prendidas', 'sensores'
        ]

    def get_estado_conexion(self, obj):
        """Obtener estado de conexión"""
        return obj.estado_conexion

    def get_tiempo_desde_ultima_senal(self, obj):
        """Formatear tiempo desde última señal"""
        tiempo = obj.tiempo_desde_ultima_senal
        if tiempo is None:
            return None
        return {
            'minutos': int(tiempo.total_seconds() / 60),
            'segundos': int(tiempo.total_seconds() % 60)
        }

    def get_sensores_count(self, obj):
        """Contar sensores del aula"""
        return obj.sensores.count()

    def get_sensores_por_tipo(self, obj):
        """Contar sensores por tipo"""
        sensores = obj.sensores.all()
        tipos = {}
        for sensor in sensores:
            tipo = sensor.tipo
            if tipo not in tipos:
                tipos[tipo] = {'total': 0, 'activos': 0}
            tipos[tipo]['total'] += 1
            if sensor.estado_actual and sensor.estado_actual.lower() in ['true', 'on', 'prendido', 'activo']:
                tipos[tipo]['activos'] += 1

        return tipos

    def get_luces_prendidas(self, obj):
        """Contar luces prendidas"""
        luces = obj.sensores.filter(tipo='luz')
        return luces.filter(
            estado_actual__in=['true', 'on', 'prendido', 'activo']
        ).count()

    def get_sensores(self, obj):
        """Obtener sensores relacionados con información básica"""
        sensores = obj.sensores.all()
        return [{
            'id': sensor.id,
            'tipo': sensor.tipo,
            'descripcion': sensor.descripcion,
            'estado_actual': sensor.estado_actual,
            'pin_esp32': sensor.pin_esp32,
            'ultima_actualizacion': sensor.ultima_actualizacion
        } for sensor in sensores]


class AulaCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer para crear y actualizar aulas"""

    class Meta:
        model = Aula
        fields = [
            'nombre', 'ip_esp32',
            'timeout_inactividad', 'apagado_automatico'
        ]

    def validate_ip_esp32(self, value):
        """Validar IP única"""
        if Aula.objects.filter(ip_esp32=value).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError("Ya existe un aula con esta IP ESP32.")
        return value

    def validate_timeout_inactividad(self, value):
        """Validar timeout mínimo"""
        if value < 1:
            raise serializers.ValidationError("El timeout debe ser al menos 1 minuto.")
        return value


class ConfiguracionAulaSerializer(serializers.ModelSerializer):
    """Serializer para ConfiguracionAula"""
    aula_nombre = serializers.CharField(source='aula.nombre', read_only=True)
    esta_en_horario_laboral = serializers.SerializerMethodField()
    puede_apagar_automaticamente = serializers.SerializerMethodField()

    class Meta:
        model = ConfiguracionAula
        fields = [
            'id', 'aula', 'aula_nombre',
            'apagado_automatico_habilitado', 'tiempo_inactividad_minutos',
            'horario_laboral_solo', 'hora_inicio_laboral', 'hora_fin_laboral',
            'lunes_habilitado', 'martes_habilitado', 'miercoles_habilitado',
            'jueves_habilitado', 'viernes_habilitado', 'sabado_habilitado', 'domingo_habilitado',
            'tiempo_gracia_minutos', 'maximo_apagados_por_dia',
            'ultimo_apagado', 'apagados_hoy', 'fecha_ultimo_reset',
            'notificar_apagado',
            'esta_en_horario_laboral', 'puede_apagar_automaticamente'
        ]
        read_only_fields = [
            'id', 'aula', 'ultimo_apagado', 'apagados_hoy', 'fecha_ultimo_reset',
            'esta_en_horario_laboral', 'puede_apagar_automaticamente'
        ]

    def get_esta_en_horario_laboral(self, obj):
        """Verificar si está en horario laboral"""
        return obj.esta_en_horario_laboral

    def get_puede_apagar_automaticamente(self, obj):
        """Verificar si puede apagar automáticamente"""
        return obj.puede_apagar_automaticamente

    def validate_tiempo_inactividad_minutos(self, value):
        """Validar tiempo de inactividad"""
        if value < 1:
            raise serializers.ValidationError("El tiempo de inactividad debe ser al menos 1 minuto.")
        if value > 1440:  # 24 horas
            raise serializers.ValidationError("El tiempo de inactividad no puede exceder 24 horas.")
        return value

    def validate_tiempo_gracia_minutos(self, value):
        """Validar tiempo de gracia"""
        if value < 0:
            raise serializers.ValidationError("El tiempo de gracia no puede ser negativo.")
        if value > 60:
            raise serializers.ValidationError("El tiempo de gracia no puede exceder 60 minutos.")
        return value

    def validate_maximo_apagados_por_dia(self, value):
        """Validar máximo de apagados por día"""
        if value < 0:
            raise serializers.ValidationError("El máximo de apagados no puede ser negativo.")
        if value > 1000:
            raise serializers.ValidationError("El máximo de apagados no puede exceder 1000.")
        return value

    def validate_hora_inicio_laboral(self, value):
        """Validar hora de inicio laboral"""
        hora_fin = self.initial_data.get('hora_fin_laboral')
        if hora_fin and value >= hora_fin:
            raise serializers.ValidationError("La hora de inicio debe ser anterior a la hora de fin.")
        return value

    def validate_hora_fin_laboral(self, value):
        """Validar hora de fin laboral"""
        hora_inicio = self.initial_data.get('hora_inicio_laboral')
        if hora_inicio and value <= hora_inicio:
            raise serializers.ValidationError("La hora de fin debe ser posterior a la hora de inicio.")
        return value
