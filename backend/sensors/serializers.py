from rest_framework import serializers
from .models import Sensor


class SensorSerializer(serializers.ModelSerializer):
    aula_nombre = serializers.CharField(source='aula.nombre', read_only=True)

    class Meta:
        model = Sensor
        fields = ['id', 'aula', 'aula_nombre', 'tipo', 'descripcion', 'estado_actual', 'pin_esp32', 'ultima_actualizacion']
        read_only_fields = ['id', 'ultima_actualizacion']
