from django.db import models
from sensors.models import Sensor
from users.models import User


class Registro(models.Model):
    SENSOR = 'sensor'
    MANUAL = 'manual'
    AUTOMATICO = 'automatico'

    FUENTE_CHOICES = [
        (SENSOR, 'Sensor'),
        (MANUAL, 'Manual'),
        (AUTOMATICO, 'Automático'),
    ]
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE, related_name='registros', verbose_name='Sensor')
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='registros', verbose_name='Usuario')
    fecha = models.DateField(auto_now_add=True, verbose_name='Fecha')
    hora = models.TimeField(auto_now_add=True, verbose_name='Hora')
    estado_anterior = models.CharField(max_length=100, blank=True, null=True, verbose_name='Estado Anterior')
    estado_nuevo = models.CharField(max_length=100, verbose_name='Estado Nuevo')
    tipo_cambio = models.CharField(max_length=50, verbose_name='Tipo de Cambio')
    valor_numerico = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, verbose_name='Valor Numérico')
    unidad = models.CharField(max_length=20, blank=True, null=True, verbose_name='Unidad')
    fuente = models.CharField(max_length=20, default='sensor', choices=[('sensor', 'Sensor'), ('manual', 'Manual'), ('automatico', 'Automático')], verbose_name='Fuente')
    ip_origen = models.GenericIPAddressField(blank=True, null=True, verbose_name='IP de Origen')
    observaciones = models.TextField(blank=True, null=True, verbose_name='Observaciones')

    class Meta:
        verbose_name = 'Registro'
        verbose_name_plural = 'Registros'
        # Índices compuestos para queries eficientes según los requerimientos
        indexes = [
            models.Index(fields=['fecha']),
            models.Index(fields=['-fecha', '-hora']),  # Para ordenamiento más reciente primero
            models.Index(fields=['sensor', 'fecha']),
            models.Index(fields=['usuario', 'fecha']),
            models.Index(fields=['tipo_cambio', 'fecha']),
            # Índice compuesto para estadísticas por período
            models.Index(fields=['fecha', 'tipo_cambio']),
        ]
        ordering = ['-fecha', '-hora']

    def __str__(self):
        return f'{self.fecha} {self.hora} - {self.sensor.tipo} - {self.estado_nuevo}'
