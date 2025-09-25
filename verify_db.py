#!/usr/bin/env python
"""
Script de prueba para verificar la configuración de SQLite
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gestor_aulas.settings_simple')
django.setup()

from users.models import User
from classrooms.models import Aula
from sensors.models import Sensor
from history.models import Registro

def verificar_datos():
    print("🔍 Verificando datos en la base de datos SQLite...")

    # Verificar usuarios
    usuarios = User.objects.all()
    print(f"\n👥 Usuarios ({usuarios.count()}):")
    for usuario in usuarios:
        print(f"   • {usuario.legajo} - {usuario.rol} - {'Activo' if usuario.is_active else 'Inactivo'}")

    # Verificar aulas
    aulas = Aula.objects.all()
    print(f"\n🏫 Aulas ({aulas.count()}):")
    for aula in aulas:
        print(f"   • {aula.nombre} - IP: {aula.ip_esp32} - Estado: {aula.estado_conexion}")

    # Verificar sensores
    sensores = Sensor.objects.all()
    print(f"\n📡 Sensores ({sensores.count()}):")
    for sensor in sensores:
        print(f"   • {sensor.aula.nombre} - {sensor.get_tipo_display()} - Estado: {sensor.estado_actual}")

    # Verificar registros
    registros = Registro.objects.all()
    print(f"\n📊 Registros ({registros.count()}):")
    print(f"   • Primer registro: {registros.first().fecha if registros else 'Ninguno'}")
    print(f"   • Último registro: {registros.last().fecha if registros else 'Ninguno'}")

    # Verificar índices
    from django.db import connection
    cursor = connection.cursor()

    print("\n🔍 Verificando índices:")
    tablas_indices = {
        'users_user': ['legajo', 'rol', 'is_active'],
        'classrooms_aula': ['ip_esp32', 'ultima_senal'],
        'sensors_sensor': ['aula_id', 'tipo', 'activo'],
        'history_registro': ['fecha', 'sensor_id', 'usuario_id', 'tipo_cambio']
    }

    for tabla, indices_esperados in tablas_indices.items():
        cursor.execute(f"SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='{tabla}' AND name LIKE '%{tabla[:10]}%_idx'")
        indices_actuales = [row[0] for row in cursor.fetchall()]
        print(f"   • {tabla}: {len(indices_actuales)} índices creados")

    print("\n✅ Verificación completada!")
    print("🚀 El sistema está listo para usar.")

if __name__ == '__main__':
    verificar_datos()
