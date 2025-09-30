from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class CustomUserManager(BaseUserManager):
    def create_user(self, legajo, password=None, **extra_fields):
        if not legajo:
            raise ValueError('El legajo es obligatorio')
        user = self.model(legajo=legajo, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, legajo, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('rol', 'Admin')
        return self.create_user(legajo, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROL_CHOICES = [
        ('Admin', 'Administrador'),
        ('Operario', 'Operario'),
    ]

    legajo = models.CharField(max_length=20, unique=True, verbose_name='Legajo')
    rol = models.CharField(max_length=10, choices=ROL_CHOICES, default='Operario', verbose_name='Rol')
    is_active = models.BooleanField(default=True, verbose_name='Activo')
    is_staff = models.BooleanField(default=False, verbose_name='Staff')
    date_joined = models.DateTimeField(default=timezone.now, verbose_name='Fecha de creación')

    # Agregar related_name para evitar conflictos con auth.User
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_groups',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    objects = CustomUserManager()

    USERNAME_FIELD = 'legajo'
    REQUIRED_FIELDS = ['rol']

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        indexes = [
            models.Index(fields=['legajo']),
        ]

    def __str__(self):
        return f'{self.legajo} - {self.rol}'
