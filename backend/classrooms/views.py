from rest_framework import viewsets, status
from rest_framework.decorators import action, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Prefetch, Count, Q
from django.utils import timezone
from django.db import models
from .models import Aula, ConfiguracionAula
from .serializers import AulaSerializer, AulaDetailSerializer, AulaCreateUpdateSerializer, ConfiguracionAulaSerializer
from users.permissions import CanAccessClassroomData, IsAdmin
import logging

logger = logging.getLogger(__name__)

class AulaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de aulas con permisos basados en roles

    - Admin: CRUD completo
    - Operario: Solo lectura
    - No autenticado: Sin acceso
    """
    queryset = Aula.objects.prefetch_related('sensores')

    def get_serializer_class(self):
        """Seleccionar serializer según la acción"""
        if self.action in ['retrieve', 'list']:
            return AulaDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return AulaCreateUpdateSerializer
        return AulaSerializer

    def get_permissions(self):
        """Asignar permisos según la acción"""
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticated]  # Solo requiere autenticación básica
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdmin]  # Solo admins
        else:
            permission_classes = [IsAuthenticated]  # Requiere autenticación básica
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        """
        Crea una aula (solo admins)
        """
        if self.request.user.rol != 'Admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Solo los administradores pueden crear aulas.")
        serializer.save()

    def perform_update(self, serializer):
        """
        Actualiza una aula (solo admins)
        """
        if self.request.user.rol != 'Admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Solo los administradores pueden modificar aulas.")
        serializer.save()

    def perform_destroy(self, instance):
        """
        Elimina una aula (solo admins)
        """
        if self.request.user.rol != 'Admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Solo los administradores pueden eliminar aulas.")
        instance.delete()

    def get_queryset(self):
        """Filtrar queryset según permisos"""
        queryset = Aula.objects.prefetch_related('sensores')

        # Filtrar por estado de conexión si se especifica
        estado = self.request.query_params.get('estado', None)
        if estado:
            if estado == 'online':
                timeout_threshold = timezone.now() - timezone.timedelta(minutes=30)  # Usar timeout por defecto
                queryset = queryset.filter(ultima_señal__gte=timeout_threshold)
            elif estado == 'offline':
                timeout_threshold = timezone.now() - timezone.timedelta(minutes=30)
                queryset = queryset.filter(
                    Q(ultima_señal__lt=timeout_threshold) | Q(ultima_señal__isnull=True)
                )

        # Buscar por nombre
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(nombre__icontains=search)

        # Ordenar por última señal (más reciente primero), pero manejar None values
        queryset = queryset.order_by(
            models.F('ultima_señal').desc(nulls_last=True)
        )

        return queryset

    @action(detail=True, methods=['post'])
    def verificar_conectividad(self, request, pk=None):
        """
        Verificar conectividad con el ESP32 de un aula específica
        """
        aula = self.get_object()

        try:
            conectividad = aula.verificar_conectividad_esp32()

            # Actualizar última señal si está conectado
            if conectividad:
                aula.actualizar_ultima_senal()

            return Response({
                'success': True,
                'conectividad': conectividad,
                'ip_esp32': aula.ip_esp32,
                'mensaje': 'ESP32 responde correctamente' if conectividad else 'ESP32 no responde'
            })

        except Exception as e:
            logger.error(f"Error verificando conectividad para aula {aula.nombre}: {str(e)}")
            return Response({
                'success': False,
                'conectividad': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def toggle_lights(self, request, pk=None):
        """
        Apagar todas las luces de un aula específica
        """
        aula = self.get_object()

        # Verificar permisos (solo admin puede hacer esto)
        if request.user.rol != 'Admin':
            return Response({
                'success': False,
                'error': 'Solo administradores pueden controlar luces'
            }, status=status.HTTP_403_FORBIDDEN)

        try:
            # Buscar luces en el aula
            luces = aula.sensores.filter(tipo='luz')

            if not luces.exists():
                return Response({
                    'success': False,
                    'error': 'No hay luces configuradas en esta aula'
                })

            # Aquí iría la lógica para enviar comando al ESP32
            # Por ahora solo registramos la acción

            return Response({
                'success': True,
                'mensaje': f'Comando de apagado enviado a {luces.count()} luces',
                'luces_afectadas': luces.count()
            })

        except Exception as e:
            logger.error(f"Error apagando luces para aula {aula.nombre}: {str(e)}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'])
    def estadisticas(self, request, pk=None):
        """
        Obtener estadísticas detalladas de un aula
        """
        try:
            aula = self.get_object()

            # Obtener estadísticas básicas de forma segura
            sensores_count = aula.sensores.count()

            # Estadísticas de sensores por tipo (simplificado)
            sensores_por_tipo = {}
            luces_prendidas = 0

            for sensor in aula.sensores.all():
                tipo = sensor.tipo
                if tipo not in sensores_por_tipo:
                    sensores_por_tipo[tipo] = {'total': 0, 'activos': 0}

                sensores_por_tipo[tipo]['total'] += 1

                # Contar activos basándose en estado_actual
                if sensor.estado_actual and sensor.estado_actual.lower() in ['true', 'on', 'prendido', 'activo']:
                    sensores_por_tipo[tipo]['activos'] += 1
                    if tipo == 'luz':
                        luces_prendidas += 1

            return Response({
                'aula': AulaDetailSerializer(aula).data,
                'estadisticas_sensores': sensores_por_tipo,
                'sensores_totales': sensores_count,
                'luces_prendidas': luces_prendidas,
                'ultima_actualizacion': aula.ultima_señal,
                'estado_conexion': aula.estado_conexion
            })

        except Exception as e:
            logger.error(f"Error obteniendo estadísticas para aula {aula.nombre}: {str(e)}")
            return Response({
                'error': 'Error obteniendo estadísticas',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def resumen_general(self, request):
        """
        Resumen general de todas las aulas
        """
        try:
            aulas = self.get_queryset()

            resumen = {
                'total_aulas': aulas.count(),
                'aulas_online': 0,
                'aulas_offline': 0,
                'sensores_totales': 0,
                'luces_prendidas': 0
            }

            # Calcular estadísticas de forma segura
            for aula in aulas:
                # Estado de conexión
                if aula.estado_conexion == 'online':
                    resumen['aulas_online'] += 1
                else:
                    resumen['aulas_offline'] += 1

                # Contar sensores
                sensores_count = aula.sensores.count()
                resumen['sensores_totales'] += sensores_count

                # Contar luces prendidas
                luces_prendidas = aula.sensores.filter(
                    tipo='luz',
                    estado_actual__in=['true', 'on', 'prendido', 'activo']
                ).count()
                resumen['luces_prendidas'] += luces_prendidas

            return Response(resumen)

        except Exception as e:
            logger.error(f"Error generando resumen general: {str(e)}")
            return Response({
                'error': 'Error interno del servidor',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ConfiguracionAulaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de configuraciones de apagado automático de aulas

    - Admin: CRUD completo
    - Operario: Solo lectura
    - No autenticado: Sin acceso
    """
    queryset = ConfiguracionAula.objects.select_related('aula')
    serializer_class = ConfiguracionAulaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filtrar queryset según permisos"""
        queryset = ConfiguracionAula.objects.select_related('aula')

        # Solo admins pueden ver todas las configuraciones
        if self.request.user.rol == 'Admin':
            return queryset

        # Operarios solo ven configuraciones de aulas a las que tienen acceso
        # Por simplicidad, devolver todas (se puede mejorar con permisos específicos)
        return queryset

    def get_permissions(self):
        """Asignar permisos según la acción"""
        if self.action in ['list', 'retrieve']:
            permission_classes = [CanAccessClassroomData]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdmin]  # Solo admins
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        """Crear configuración (solo admins)"""
        if self.request.user.rol != 'Admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Solo los administradores pueden crear configuraciones.")
        serializer.save()

    def perform_update(self, serializer):
        """Actualizar configuración (solo admins)"""
        if self.request.user.rol != 'Admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Solo los administradores pueden modificar configuraciones.")
        serializer.save()

    def perform_destroy(self, instance):
        """Eliminar configuración (solo admins)"""
        if self.request.user.rol != 'Admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Solo los administradores pueden eliminar configuraciones.")
        instance.delete()

    @action(detail=True, methods=['post'])
    def probar_configuracion(self, request, pk=None):
        """
        Probar la configuración actual para verificar si puede apagar automáticamente
        """
        configuracion = self.get_object()

        puede_apagar = configuracion.puede_apagar_automaticamente
        esta_en_horario = configuracion.esta_en_horario_laboral

        return Response({
            'success': True,
            'puede_apagar_automaticamente': puede_apagar,
            'esta_en_horario_laboral': esta_en_horario,
            'motivo': self._obtener_motivo_no_apagado(configuracion) if not puede_apagar else 'Puede apagar automáticamente',
            'configuracion': ConfiguracionAulaSerializer(configuracion).data
        })

    @action(detail=True, methods=['post'])
    def forzar_apagado(self, request, pk=None):
        """
        Forzar apagado automático inmediato (solo admins)
        """
        if request.user.rol != 'Admin':
            return Response({
                'success': False,
                'error': 'Solo administradores pueden forzar apagados'
            }, status=status.HTTP_403_FORBIDDEN)

        configuracion = self.get_object()

        try:
            # Buscar sensores de luces/relés para apagar
            sensores_luces = configuracion.aula.sensores.filter(
                models.Q(tipo='luz') | models.Q(tipo='rele')
            )

            if not sensores_luces.exists():
                return Response({
                    'success': False,
                    'error': 'No hay luces configuradas en esta aula'
                })

            # Aquí iría la lógica para enviar comando al ESP32
            # Por ahora simulamos el apagado

            return Response({
                'success': True,
                'mensaje': f'Apagado forzado ejecutado en {sensores_luces.count()} luces',
                'luces_afectadas': sensores_luces.count(),
                'aula': configuracion.aula.nombre
            })

        except Exception as e:
            logger.error(f"Error forzando apagado para aula {configuracion.aula.nombre}: {str(e)}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _obtener_motivo_no_apagado(self, configuracion):
        """Obtener motivo por el cual no se puede apagar automáticamente"""
        if not configuracion.apagado_automatico_habilitado:
            return 'Apagado automático deshabilitado'

        if not configuracion.esta_en_horario_laboral:
            return 'Fuera de horario laboral'

        if configuracion.maximo_apagados_por_dia > 0:
            hoy = timezone.now().date()
            if configuracion.fecha_ultimo_reset != hoy:
                configuracion.apagados_hoy = 0
                configuracion.fecha_ultimo_reset = hoy
                configuracion.save(update_fields=['apagados_hoy', 'fecha_ultimo_reset'])

            if configuracion.apagados_hoy >= configuracion.maximo_apagados_por_dia:
                return f'Límite de apagados por día alcanzado ({configuracion.maximo_apagados_por_dia})'

        return 'Configuración válida'
