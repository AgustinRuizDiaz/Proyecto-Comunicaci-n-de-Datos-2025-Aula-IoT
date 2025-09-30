from rest_framework import serializers
from .models import Aula


class AulaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aula
        fields = ['id', 'nombre', 'ip_esp32', 'ultima_señal']
        read_only_fields = ['id', 'ultima_señal']
