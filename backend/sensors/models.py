from django.db import models
from classrooms.models import Aula


class Sensor(models.Model):
    TIPO_CHOICES = [
        ('luz', 'Sensor de Luz'),
        ('movimiento', 'Sensor de Movimiento'),
        ('ventana', 'Sensor de Ventana'),
        ('rele', 'Relé'),
    ]

    aula = models.ForeignKey(Aula, on_delete=models.CASCADE, related_name='sensores', verbose_name='Aula')
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, verbose_name='Tipo de Sensor')
    descripcion = models.TextField(blank=True, verbose_name='Descripción')
    estado_actual = models.CharField(max_length=50, blank=True, verbose_name='Estado Actual')

    class Meta:
        verbose_name = 'Sensor'
        verbose_name_plural = 'Sensores'

    def __str__(self):
        return f'{self.tipo} - {self.aula.nombre}'
