#!/usr/bin/env python
"""
Script para poblar la base de datos SQLite con datos de ejemplo
"""
import os
import sys
import django
from datetime import datetime, timedelta
import random

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gestor_aulas.settings_simple')
django.setup()

from users.models import User
from classrooms.models import Aula
from sensors.models import Sensor
from history.models import Registro

def crear_datos_ejemplo():
    print("🚀 Creando datos de ejemplo...")

    # Crear usuarios de ejemplo
    print("📝 Creando usuarios...")
    usuarios_data = [
        {'legajo': 'OP001', 'password': 'operario123', 'rol': 'Operario'},
        {'legajo': 'OP002', 'password': 'operario123', 'rol': 'Operario'},
        {'legajo': 'ADMIN001', 'password': 'admin123', 'rol': 'Admin'},
    ]

    usuarios = []
    for user_data in usuarios_data:
        usuario, created = User.objects.get_or_create(
            legajo=user_data['legajo'],
            defaults=user_data
        )
        if created:
            print(f"  ✓ Usuario {usuario.legajo} creado")
        usuarios.append(usuario)

    # Crear aulas de ejemplo
    print("🏫 Creando aulas...")
    aulas_data = [
        {'nombre': 'Aula 101', 'ip_esp32': '192.168.1.101'},
        {'nombre': 'Aula 102', 'ip_esp32': '192.168.1.102'},
        {'nombre': 'Aula 103', 'ip_esp32': '192.168.1.103'},
        {'nombre': 'Laboratorio 1', 'ip_esp32': '192.168.1.201'},
        {'nombre': 'Laboratorio 2', 'ip_esp32': '192.168.1.202'},
    ]

    aulas = []
    for aula_data in aulas_data:
        aula, created = Aula.objects.get_or_create(
            ip_esp32=aula_data['ip_esp32'],
            defaults=aula_data
        )
        if created:
            print(f"  ✓ Aula {aula.nombre} creada")
        aulas.append(aula)

    # Crear sensores para cada aula
    print("📡 Creando sensores...")
    tipos_sensores = ['luz', 'movimiento', 'ventana', 'rele', 'temperatura', 'humedad']

    sensores = []
    for aula in aulas:
        # Crear 2-4 sensores por aula
        num_sensores = random.randint(2, 4)
        sensores_aula = random.sample(tipos_sensores, num_sensores)

        for tipo in sensores_aula:
            descripcion = f"Sensor de {tipo} en {aula.nombre}"
            pin_gpio = random.randint(1, 40)

            sensor, created = Sensor.objects.get_or_create(
                aula=aula,
                tipo=tipo,
                defaults={
                    'descripcion': descripcion,
                    'pin_gpio': pin_gpio,
                    'activo': True
                }
            )
            if created:
                print(f"  ✓ Sensor {tipo} creado en {aula.nombre}")
            sensores.append(sensor)

    # Crear registros históricos
    print("📊 Creando registros históricos...")
    estados_posibles = {
        'luz': ['True', 'False'],
        'movimiento': ['True', 'False'],
        'ventana': ['Abierta', 'Cerrada'],
        'rele': ['Activado', 'Desactivado'],
        'temperatura': ['22.5', '23.1', '24.2', '21.8', '25.0'],
        'humedad': ['45.2', '48.7', '52.1', '43.9', '50.5'],
    }

    # Crear registros para los últimos 30 días
    fecha_actual = datetime.now().date()
    registros_creados = 0

    for i in range(30):
        fecha = fecha_actual - timedelta(days=i)

        # Crear 5-15 registros por día
        num_registros_dia = random.randint(5, 15)

        for j in range(num_registros_dia):
            sensor = random.choice(sensores)
            usuario = random.choice(usuarios) if random.random() > 0.7 else None

            # Generar estado según el tipo de sensor
            if sensor.es_sensor_estado():
                estado = random.choice(estados_posibles[sensor.tipo])
                valor_numerico = None
            else:
                estado = random.choice(estados_posibles[sensor.tipo])
                try:
                    valor_numerico = float(estado)
                except ValueError:
                    valor_numerico = None

            # Hora aleatoria del día
            hora = datetime.strptime(f"{random.randint(8, 18):02d}:{random.randint(0, 59):02d}", "%H:%M").time()

            tipo_cambio = random.choice(['automatico', 'manual', 'sistema'])

            registro = Registro.objects.create(
                sensor=sensor,
                usuario=usuario,
                fecha=fecha,
                hora=hora,
                estado=estado,
                tipo_cambio=tipo_cambio,
                valor_numerico=valor_numerico,
                descripcion=f'Registro automático del sensor {sensor.tipo}'
            )

            registros_creados += 1

    print("\n✅ Datos de ejemplo creados exitosamente!")
    print(f"   📊 Total de registros creados: {registros_creados}")
    print(f"   👥 Usuarios: {len(usuarios)}")
    print(f"   🏫 Aulas: {len(aulas)}")
    print(f"   📡 Sensores: {len(sensores)}")

    print("\n🔐 Credenciales de acceso:")
    print("   👤 Admin: admin / admin123")
    print("   👤 Operario: OP001 / operario123")
    print("   👤 Operario: OP002 / operario123")

    print("\n🌐 URLs disponibles:")
    print("   🔗 Frontend: http://localhost:3000")
    print("   🔗 Backend: http://localhost:8000")
    print("   🔗 Admin: http://localhost:8000/admin/")

if __name__ == '__main__':
    crear_datos_ejemplo()
