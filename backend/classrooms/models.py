from django.db import models


class Aula(models.Model):
    nombre = models.CharField(max_length=100, verbose_name='Nombre del Aula')
    ip_esp32 = models.GenericIPAddressField(unique=True, verbose_name='IP ESP32')
    ultima_señal = models.DateTimeField(auto_now=True, verbose_name='Última Señal')

    class Meta:
        verbose_name = 'Aula'
        verbose_name_plural = 'Aulas'
        indexes = [
            models.Index(fields=['ip_esp32']),
        ]

    def __str__(self):
        return self.nombre
