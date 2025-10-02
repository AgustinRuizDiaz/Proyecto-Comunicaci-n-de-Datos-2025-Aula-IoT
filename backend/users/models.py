from django.db import models
from django.contrib.auth.models import User as AuthUser


class User(models.Model):
    """
    Modelo de usuario personalizado para el sistema GestorAulas
    """
    ROL_CHOICES = [
        ('Admin', 'Administrador'),
        ('Operario', 'Operario'),
    ]

    # Relacionar con el usuario de Django auth
    auth_user = models.OneToOneField(AuthUser, on_delete=models.CASCADE, related_name='gestor_user')

    legajo = models.CharField(max_length=20, unique=True, verbose_name='Legajo')
    rol = models.CharField(max_length=10, choices=ROL_CHOICES, default='Operario', verbose_name='Rol')

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

    def __str__(self):
        return f'{self.legajo} - {self.rol}'
