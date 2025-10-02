---
trigger: always_on
---

```markdown
# Esquema de Base de Datos SQLite

## Modelos y Relaciones
```python
# Usuario personalizado
class User(AbstractBaseUser):
    legajo = models.CharField(max_length=20, unique=True)
    rol = models.CharField(choices=['Admin', 'Operario'])
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['legajo']),
        ]

# Aula
class Aula(models.Model):
    nombre = models.CharField(max_length=100)
    ip_esp32 = models.GenericIPAddressField(unique=True)
    ultima_señal = models.DateTimeField(null=True)
    timeout_inactividad = models.IntegerField(default=30)  # minutos
    apagado_automatico = models.BooleanField(default=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['ip_esp32']),
        ]

# Sensor
class Sensor(models.Model):
    TIPO_CHOICES = [
        ('luz', 'Luz'),
        ('movimiento', 'Sensor de Movimiento'),
        ('ventana', 'Ventana'),
        ('rele', 'Relé'),
    ]
    
    aula = models.ForeignKey(Aula, on_delete=models.CASCADE, related_name='sensores')
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    descripcion = models.TextField()
    estado_actual = models.CharField(max_length=50)
    pin_esp32 = models.IntegerField()
    ultima_actualizacion = models.DateTimeField(auto_now=True)

# Registro/Historial
class Registro(models.Model):
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE)
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    fecha = models.DateField(auto_now_add=True)
    hora = models.TimeField(auto_now_add=True)
    estado_anterior = models.CharField(max_length=50)
    estado_nuevo = models.CharField(max_length=50)
    tipo_cambio = models.CharField(max_length=50)  # manual/automatico/sensor
    
    class Meta:
        indexes = [
            models.Index(fields=['fecha', '-hora']),
            models.Index(fields=['sensor', 'fecha']),
        ]
        ordering = ['-fecha', '-hora']
Queries Optimizadas Comunes
python# Aulas con sensores
Aula.objects.prefetch_related('sensores').all()

# Historial de un día
Registro.objects.select_related('sensor__aula', 'usuario').filter(
    fecha=date.today()
)

# Sensores de movimiento inactivos
Sensor.objects.filter(
    tipo='movimiento',
    ultima_actualizacion__lt=timezone.now() - timedelta(minutes=30)
)