from rest_framework import serializers
from .models import Registro

class RegistroSerializer(serializers.ModelSerializer):
    sensor_tipo = serializers.CharField(source='sensor.tipo', read_only=True)
    aula_nombre = serializers.CharField(source='sensor.aula.nombre', read_only=True)
    usuario_legajo = serializers.CharField(source='usuario.legajo', read_only=True)
    usuario_rol = serializers.CharField(source='usuario.rol', read_only=True)

    class Meta:
        model = Registro
        fields = [
            'id', 'sensor', 'sensor_tipo', 'aula_nombre', 'usuario', 'usuario_legajo', 'usuario_rol',
            'fecha', 'hora', 'estado_anterior', 'estado_nuevo', 'tipo_cambio',
            'valor_numerico', 'unidad', 'fuente', 'ip_origen', 'observaciones'
        ]
        read_only_fields = ['id', 'fecha', 'hora']
