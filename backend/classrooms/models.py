from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError


class Aula(models.Model):
    nombre = models.CharField(max_length=100, verbose_name='Nombre del Aula')
    ip_esp32 = models.GenericIPAddressField(unique=True, verbose_name='IP ESP32')
    ultima_señal = models.DateTimeField(null=True, blank=True, verbose_name='Última Señal')
    timeout_inactividad = models.IntegerField(default=30, verbose_name='Timeout Inactividad (minutos)')
    apagado_automatico = models.BooleanField(default=True, verbose_name='Apagado Automático')

    class Meta:
        verbose_name = 'Aula'
        verbose_name_plural = 'Aulas'
        indexes = [
            models.Index(fields=['ip_esp32']),
            models.Index(fields=['ultima_señal']),
        ]
        constraints = [
            models.UniqueConstraint(fields=['ip_esp32'], name='unique_ip_esp32')
        ]

    def __str__(self):
        return self.nombre

    @property
    def estado_conexion(self):
        """
        Retorna el estado de conexión basado en la última señal
        """
        if not self.ultima_señal:
            return 'desconocido'

        tiempo_desde_ultima_senal = timezone.now() - self.ultima_señal
        minutos_desde_ultima_senal = tiempo_desde_ultima_senal.total_seconds() / 60

        if minutos_desde_ultima_senal <= self.timeout_inactividad:
            return 'online'
        else:
            return 'offline'

    @property
    def tiempo_desde_ultima_senal(self):
        """
        Retorna el tiempo transcurrido desde la última señal
        """
        if not self.ultima_señal:
            return None
        return timezone.now() - self.ultima_señal

    def actualizar_ultima_senal(self):
        """
        Actualiza la última señal al momento actual
        """
        self.ultima_señal = timezone.now()
        self.save(update_fields=['ultima_señal'])

    def verificar_conectividad_esp32(self):
        """
        Verifica la conectividad con el ESP32 mediante ping
        """
        import subprocess
        try:
            # Ping simple (solo IPv4)
            result = subprocess.run(
                ['ping', '-c', '1', '-W', '2', str(self.ip_esp32)],
                capture_output=True,
                text=True,
                timeout=5
            )
            return result.returncode == 0
        except (subprocess.TimeoutExpired, FileNotFoundError):
            return False

    def clean(self):
        """
        Validación personalizada antes de guardar
        """
        super().clean()
        if self.ip_esp32:
            # Verificar que la IP sea válida
            try:
                from ipaddress import ip_address
                ip_address(self.ip_esp32)
            except ValueError:
                raise ValidationError({'ip_esp32': 'IP no válida'})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def obtener_o_crear_configuracion(self):
        """
        Obtiene la configuración existente o crea una nueva con valores por defecto
        """
        try:
            return self.configuracion
        except ConfiguracionAula.DoesNotExist:
            # Crear configuración por defecto
            configuracion = ConfiguracionAula.objects.create(
                aula=self,
                apagado_automatico_habilitado=self.apagado_automatico,
                tiempo_inactividad_minutos=self.timeout_inactividad
            )
            return configuracion

    def obtener_estado_sensores(self):
        """
        Retorna un resumen del estado de los sensores del aula
        """
        sensores = self.sensores.all()
        estado = {
            'total': sensores.count(),
            'por_tipo': {},
            'luces_prendidas': 0,
            'sensores_activos': 0
        }

        for sensor in sensores:
            tipo = sensor.tipo
            if tipo not in estado['por_tipo']:
                estado['por_tipo'][tipo] = {
                    'total': 0,
                    'activos': 0,
                    'sensores': []
                }

            estado['por_tipo'][tipo]['total'] += 1
            estado['por_tipo'][tipo]['sensores'].append(sensor)

            # Contar sensores activos (movimiento detectado o luces prendidas)
            if tipo == 'movimiento' and sensor.estado_actual == 'True':
                estado['sensores_activos'] += 1
            elif tipo in ['luz', 'rele'] and sensor.estado_actual == 'True':
                estado['luces_prendidas'] += 1
                estado['sensores_activos'] += 1

        return estado


class ConfiguracionAula(models.Model):
    """
    Configuración avanzada para el apagado automático de luces por aula
    """
    aula = models.OneToOneField(
        Aula,
        on_delete=models.CASCADE,
        related_name='configuracion',
        verbose_name='Aula'
    )

    # Configuración básica de apagado automático
    apagado_automatico_habilitado = models.BooleanField(
        default=True,
        verbose_name='Apagado Automático Habilitado'
    )
    tiempo_inactividad_minutos = models.IntegerField(
        default=30,
        verbose_name='Tiempo de Inactividad (minutos)',
        help_text='Tiempo sin movimiento antes de apagar luces'
    )

    # Configuración de horario laboral
    horario_laboral_solo = models.BooleanField(
        default=True,
        verbose_name='Solo en Horario Laboral',
        help_text='Solo apagar automáticamente durante horario laboral'
    )
    hora_inicio_laboral = models.TimeField(
        default='08:00',
        verbose_name='Hora Inicio Laboral'
    )
    hora_fin_laboral = models.TimeField(
        default='18:00',
        verbose_name='Hora Fin Laboral'
    )

    # Configuración de días de la semana
    lunes_habilitado = models.BooleanField(default=True, verbose_name='Lunes')
    martes_habilitado = models.BooleanField(default=True, verbose_name='Martes')
    miercoles_habilitado = models.BooleanField(default=True, verbose_name='Miércoles')
    jueves_habilitado = models.BooleanField(default=True, verbose_name='Jueves')
    viernes_habilitado = models.BooleanField(default=True, verbose_name='Viernes')
    sabado_habilitado = models.BooleanField(default=False, verbose_name='Sábado')
    domingo_habilitado = models.BooleanField(default=False, verbose_name='Domingo')

    # Configuración avanzada
    tiempo_gracia_minutos = models.IntegerField(
        default=5,
        verbose_name='Tiempo de Gracia (minutos)',
        help_text='Tiempo adicional antes de apagar luces después de detectar movimiento'
    )
    maximo_apagados_por_dia = models.IntegerField(
        default=10,
        verbose_name='Máximo Apagados por Día',
        help_text='Límite de apagados automáticos por día (0 = sin límite)'
    )

    # Estado y monitoreo
    ultimo_apagado = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Último Apagado Automático'
    )
    apagados_hoy = models.IntegerField(
        default=0,
        verbose_name='Apagados Hoy'
    )
    fecha_ultimo_reset = models.DateField(
        auto_now_add=True,
        verbose_name='Fecha Último Reset de Contador'
    )

    # Configuración de notificaciones
    notificar_apagado = models.BooleanField(
        default=False,
        verbose_name='Notificar Apagado',
        help_text='Enviar notificación cuando se ejecute apagado automático'
    )

    class Meta:
        verbose_name = 'Configuración de Aula'
        verbose_name_plural = 'Configuraciones de Aulas'

    def __str__(self):
        return f'Configuración de {self.aula.nombre}'

    @property
    def esta_en_horario_laboral(self):
        """
        Verifica si actualmente está en horario laboral
        """
        if not self.horario_laboral_solo:
            return True

        ahora = timezone.now()
        hora_actual = ahora.time()
        dia_semana = ahora.weekday()  # 0 = lunes, 6 = domingo

        # Verificar día de la semana
        dias_habilitados = [
            (0, self.lunes_habilitado),
            (1, self.martes_habilitado),
            (2, self.miercoles_habilitado),
            (3, self.jueves_habilitado),
            (4, self.viernes_habilitado),
            (5, self.sabado_habilitado),
            (6, self.domingo_habilitado),
        ]

        dia_habilitado = dias_habilitados[dia_semana][1]
        if not dia_habilitado:
            return False

        # Verificar horario
        if self.hora_inicio_laboral <= hora_actual <= self.hora_fin_laboral:
            return True

        return False

    @property
    def puede_apagar_automaticamente(self):
        """
        Verifica si puede ejecutar apagado automático según configuración
        """
        if not self.apagado_automatico_habilitado:
            return False

        if not self.esta_en_horario_laboral:
            return False

        # Verificar límite de apagados por día
        if self.maximo_apagados_por_dia > 0:
            hoy = timezone.now().date()
            if self.fecha_ultimo_reset != hoy:
                # Reset del contador si es un día nuevo
                self.apagados_hoy = 0
                self.fecha_ultimo_reset = hoy
                self.save(update_fields=['apagados_hoy', 'fecha_ultimo_reset'])

            if self.apagados_hoy >= self.maximo_apagados_por_dia:
                return False

        return True

    def registrar_apagado(self):
        """
        Registra un apagado automático ejecutado
        """
        self.ultimo_apagado = timezone.now()
        self.apagados_hoy += 1
        self.save(update_fields=['ultimo_apagado', 'apagados_hoy'])

    def clean(self):
        """
        Validaciones personalizadas
        """
        super().clean()

        if self.hora_inicio_laboral >= self.hora_fin_laboral:
            raise ValidationError({
                'hora_fin_laboral': 'La hora de fin debe ser posterior a la hora de inicio'
            })

        if self.tiempo_inactividad_minutos < 1:
            raise ValidationError({
                'tiempo_inactividad_minutos': 'El tiempo de inactividad debe ser al menos 1 minuto'
            })

        if self.tiempo_gracia_minutos < 0:
            raise ValidationError({
                'tiempo_gracia_minutos': 'El tiempo de gracia no puede ser negativo'
            })

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
