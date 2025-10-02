from django.core.management.base import BaseCommand
from django.utils import timezone
from classrooms.models import Aula, ConfiguracionAula
from sensors.models import Sensor

class Command(BaseCommand):
    help = 'Crea datos de ejemplo para aulas, sensores y configuraciones'

    def handle(self, *args, **options):
        self.stdout.write('Creando datos de ejemplo...')

        # Crear aulas de ejemplo
        aulas_data = [
            {
                'nombre': 'Aula 101 - Laboratorio de Computación',
                'ip_esp32': '192.168.1.101',
                'timeout_inactividad': 30,
                'apagado_automatico': True,
            },
            {
                'nombre': 'Aula 201 - Sala de Conferencias',
                'ip_esp32': '192.168.1.201',
                'timeout_inactividad': 45,
                'apagado_automatico': True,
            },
            {
                'nombre': 'Aula 301 - Biblioteca',
                'ip_esp32': '192.168.1.301',
                'timeout_inactividad': 60,
                'apagado_automatico': False,
            },
            {
                'nombre': 'Aula 401 - Laboratorio de Electrónica',
                'ip_esp32': '192.168.1.401',
                'timeout_inactividad': 30,
                'apagado_automatico': True,
            },
        ]

        aulas_creadas = []
        for aula_data in aulas_data:
            aula, created = Aula.objects.get_or_create(
                ip_esp32=aula_data['ip_esp32'],
                defaults=aula_data
            )
            if created:
                aulas_creadas.append(aula)
                self.stdout.write(f'✓ Aula creada: {aula.nombre}')
            else:
                self.stdout.write(f'• Aula ya existe: {aula.nombre}')

        # Crear sensores para cada aula
        sensores_data = [
            # Aula 101
            {'aula_ip': '192.168.1.101', 'tipo': 'luz', 'descripcion': 'Luces principales aula 101', 'pin_esp32': 23, 'estado_actual': 'false'},
            {'aula_ip': '192.168.1.101', 'tipo': 'luz', 'descripcion': 'Luces pizarra aula 101', 'pin_esp32': 22, 'estado_actual': 'false'},
            {'aula_ip': '192.168.1.101', 'tipo': 'movimiento', 'descripcion': 'Sensor movimiento aula 101', 'pin_esp32': 21, 'estado_actual': 'false'},
            {'aula_ip': '192.168.1.101', 'tipo': 'ventana', 'descripcion': 'Sensor ventana aula 101', 'pin_esp32': 19, 'estado_actual': 'cerrada'},

            # Aula 201
            {'aula_ip': '192.168.1.201', 'tipo': 'luz', 'descripcion': 'Luces sala conferencias', 'pin_esp32': 23, 'estado_actual': 'true'},
            {'aula_ip': '192.168.1.201', 'tipo': 'movimiento', 'descripcion': 'Sensor movimiento sala 201', 'pin_esp32': 21, 'estado_actual': 'false'},
            {'aula_ip': '192.168.1.201', 'tipo': 'rele', 'descripcion': 'Proyector sala 201', 'pin_esp32': 18, 'estado_actual': 'false'},

            # Aula 301
            {'aula_ip': '192.168.1.301', 'tipo': 'luz', 'descripcion': 'Iluminación biblioteca', 'pin_esp32': 23, 'estado_actual': 'true'},
            {'aula_ip': '192.168.1.301', 'tipo': 'movimiento', 'descripcion': 'Sensor presencia biblioteca', 'pin_esp32': 21, 'estado_actual': 'true'},

            # Aula 401
            {'aula_ip': '192.168.1.401', 'tipo': 'luz', 'descripcion': 'Luces laboratorio electrónica', 'pin_esp32': 23, 'estado_actual': 'true'},
            {'aula_ip': '192.168.1.401', 'tipo': 'movimiento', 'descripcion': 'Sensor movimiento lab 401', 'pin_esp32': 21, 'estado_actual': 'true'},
            {'aula_ip': '192.168.1.401', 'tipo': 'rele', 'descripcion': 'Equipo laboratorio 401', 'pin_esp32': 18, 'estado_actual': 'true'},
        ]

        sensores_creados = 0
        for sensor_data in sensores_data:
            try:
                aula = Aula.objects.get(ip_esp32=sensor_data['aula_ip'])
                sensor, created = Sensor.objects.get_or_create(
                    aula=aula,
                    pin_esp32=sensor_data['pin_esp32'],
                    defaults={
                        'tipo': sensor_data['tipo'],
                        'descripcion': sensor_data['descripcion'],
                        'estado_actual': sensor_data['estado_actual'],
                    }
                )
                if created:
                    sensores_creados += 1
                    self.stdout.write(f'  ✓ Sensor creado: {sensor.descripcion}')
            except Aula.DoesNotExist:
                self.stdout.write(f'  ✗ Aula no encontrada: {sensor_data["aula_ip"]}')

        # Crear configuraciones para las aulas
        configuraciones_creadas = 0
        for aula in Aula.objects.all():
            try:
                config, created = ConfiguracionAula.objects.get_or_create(
                    aula=aula,
                    defaults={
                        'apagado_automatico_habilitado': aula.apagado_automatico,
                        'tiempo_inactividad_minutos': aula.timeout_inactividad,
                        'horario_laboral_solo': True,
                        'hora_inicio_laboral': '08:00',
                        'hora_fin_laboral': '18:00',
                        'lunes_habilitado': True,
                        'martes_habilitado': True,
                        'miercoles_habilitado': True,
                        'jueves_habilitado': True,
                        'viernes_habilitado': True,
                        'sabado_habilitado': False,
                        'domingo_habilitado': False,
                        'tiempo_gracia_minutos': 5,
                        'maximo_apagados_por_dia': 10,
                        'notificar_apagado': False,
                    }
                )
                if created:
                    configuraciones_creadas += 1
                    self.stdout.write(f'  ✓ Configuración creada: {aula.nombre}')
            except Exception as e:
                self.stdout.write(f'  ✗ Error creando configuración para {aula.nombre}: {e}')

        # Actualizar última señal para algunas aulas (simular actividad reciente)
        import random
        aulas_para_actualizar = Aula.objects.all()[:2]  # Actualizar primeras 2 aulas
        for aula in aulas_para_actualizar:
            # Simular que estuvo activa hace poco tiempo
            minutos_aleatorios = random.randint(5, 25)
            aula.ultima_señal = timezone.now() - timezone.timedelta(minutes=minutos_aleatorios)
            aula.save(update_fields=['ultima_señal'])
            self.stdout.write(f'  ✓ Actualizada última señal: {aula.nombre}')

        self.stdout.write('\n' + '='*50)
        self.stdout.write('RESUMEN DE DATOS CREADOS:')
        self.stdout.write(f'• Aulas: {len(aulas_creadas)} nuevas')
        self.stdout.write(f'• Sensores: {sensores_creados} nuevos')
        self.stdout.write(f'• Configuraciones: {configuraciones_creadas} nuevas')
        self.stdout.write(f'• Total aulas en BD: {Aula.objects.count()}')
        self.stdout.write(f'• Total sensores en BD: {Sensor.objects.count()}')
        self.stdout.write(f'• Total configuraciones en BD: {ConfiguracionAula.objects.count()}')
        self.stdout.write('='*50)
