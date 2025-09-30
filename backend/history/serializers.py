from rest_framework import serializers
from .models import Registro


class RegistroSerializer(serializers.ModelSerializer):
    sensor_tipo = serializers.CharField(source='sensor.tipo', read_only=True)
    aula_nombre = serializers.CharField(source='sensor.aula.nombre', read_only=True)
    usuario_legajo = serializers.CharField(source='usuario.legajo', read_only=True)

    class Meta:
        model = Registro
        fields = ['id', 'sensor', 'sensor_tipo', 'aula_nombre', 'usuario', 'usuario_legajo',
                 'hora', 'fecha', 'estado', 'tipo_cambio']
        read_only_fields = ['id', 'hora', 'fecha']
