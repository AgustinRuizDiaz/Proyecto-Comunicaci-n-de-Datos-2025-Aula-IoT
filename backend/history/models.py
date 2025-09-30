from django.db import models
from sensors.models import Sensor
from users.models import User


class Registro(models.Model):
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE, related_name='registros', verbose_name='Sensor')
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='registros', verbose_name='Usuario')
    hora = models.TimeField(auto_now_add=True, verbose_name='Hora')
    fecha = models.DateField(auto_now_add=True, verbose_name='Fecha')
    estado = models.CharField(max_length=50, verbose_name='Estado')
    tipo_cambio = models.CharField(max_length=50, verbose_name='Tipo de Cambio')

    class Meta:
        verbose_name = 'Registro'
        verbose_name_plural = 'Registros'
        indexes = [
            models.Index(fields=['fecha']),
            models.Index(fields=['sensor', 'fecha']),
            models.Index(fields=['usuario', 'fecha']),
        ]

    def __str__(self):
        return f'{self.fecha} {self.hora} - {self.sensor.tipo} - {self.estado}'
