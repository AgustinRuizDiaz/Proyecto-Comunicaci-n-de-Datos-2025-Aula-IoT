from celery import shared_task
from django.utils import timezone
from django.db import transaction
from django.db.models import Q

from .models import Aula, ConfiguracionAula
from sensors.models import Sensor
from history.models import Registro


@shared_task
def verificar_y_apagar_luces_automaticamente():
    """
    Tarea programada que verifica todas las aulas y apaga luces automáticamente
    cuando detecta inactividad según la configuración
    """
    ahora = timezone.now()
    aulas_procesadas = 0
    luces_apagadas = 0

    # Obtener todas las aulas con configuración habilitada
    aulas_con_configuracion = Aula.objects.filter(
        configuracion__apagado_automatico_habilitado=True
    ).select_related('configuracion').prefetch_related('sensores')

    for aula in aulas_con_configuracion:
        try:
            configuracion = aula.configuracion
            aulas_procesadas += 1

            # Verificar si puede apagar automáticamente según configuración
            if not configuracion.puede_apagar_automaticamente:
                continue

            # Buscar sensores de movimiento en esta aula
            sensores_movimiento = aula.sensores.filter(tipo='movimiento')

            if not sensores_movimiento.exists():
                continue

            # Verificar si hay movimiento reciente
            tiempo_limite = ahora - timezone.timedelta(
                minutes=configuracion.tiempo_inactividad_minutos
            )

            # Verificar si el último movimiento fue hace más tiempo del configurado
            ultimo_movimiento = sensores_movimiento.aggregate(
                ultima_fecha=models.Max('ultima_actualizacion')
            )['ultima_fecha']

            if ultimo_movimiento and ultimo_movimiento < tiempo_limite:
                # No hay movimiento reciente, proceder con apagado

                # Buscar sensores de luces/relés para apagar
                sensores_luces = aula.sensores.filter(
                    Q(tipo='luz') | Q(tipo='rele')
                )

                if sensores_luces.exists():
                    # Ejecutar apagado automático con transacción
                    with transaction.atomic():
                        # Cambiar estado de sensores de luces a False (apagado)
                        sensores_actualizados = sensores_luces.update(
                            estado_actual='False',
                            ultima_actualizacion=ahora
                        )

                        if sensores_actualizados > 0:
                            luces_apagadas += sensores_actualizados

                            # Registrar el apagado automático en el historial
                            for sensor in sensores_luces:
                                Registro.objects.create(
                                    sensor=sensor,
                                    estado_anterior='True',
                                    estado_nuevo='False',
                                    tipo_cambio='automatico',
                                    fuente='automatico',
                                    observaciones=f'Apagado automático por inactividad ({configuracion.tiempo_inactividad_minutos} minutos)'
                                )

                            # Actualizar configuración del aula
                            configuracion.registrar_apagado()

        except Exception as e:
            # Log del error pero continuar con otras aulas
            print(f"Error procesando aula {aula.nombre}: {str(e)}")
            continue

    return {
        'aulas_procesadas': aulas_procesadas,
        'luces_apagadas': luces_apagadas,
        'timestamp': ahora.isoformat()
    }


@shared_task
def verificar_conectividad_esp32():
    """
    Tarea programada para verificar la conectividad de todos los ESP32
    """
    aulas = Aula.objects.all()
    resultados = {
        'total': aulas.count(),
        'online': 0,
        'offline': 0,
        'errores': 0
    }

    for aula in aulas:
        try:
            if aula.verificar_conectividad_esp32():
                aula.actualizar_ultima_senal()
                resultados['online'] += 1
            else:
                resultados['offline'] += 1
        except Exception:
            resultados['errores'] += 1

    return resultados


@shared_task
def limpiar_registros_antiguos(dias_a_conservar=90):
    """
    Tarea programada para limpiar registros antiguos y mantener la base de datos optimizada
    """
    fecha_limite = timezone.now() - timezone.timedelta(days=dias_a_conservar)

    registros_eliminados = Registro.objects.filter(
        fecha__lt=fecha_limite.date()
    ).delete()[0]

    return {
        'registros_eliminados': registros_eliminados,
        'dias_conservados': dias_a_conservar
    }
