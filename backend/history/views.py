from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.http import StreamingHttpResponse
from django.db.models import Count, Avg, Sum, Min, Max, Q
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
import csv
import json
from io import StringIO

from .models import Registro
from .serializers import RegistroSerializer
from .filters import RegistroFilter
from users.permissions import CanAccessHistoryData


class StandardResultsSetPagination(PageNumberPagination):
    """
    Paginación estándar para el historial con tamaño de página configurable
    """
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 1000


class RegistroViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de registros históricos con permisos basados en roles

    - Admin: CRUD completo
    - Operario: CRUD completo (generan registros)
    """
    queryset = Registro.objects.select_related('sensor__aula', 'usuario').all()
    serializer_class = RegistroSerializer
    permission_classes = [CanAccessHistoryData]
    pagination_class = StandardResultsSetPagination

    # Filtros y búsquedas
    filter_backends = [DjangoFilterBackend]
    filterset_class = RegistroFilter

    # Búsqueda en campos específicos
    search_fields = ['estado_nuevo', 'observaciones', 'sensor__tipo', 'sensor__aula__nombre']

    # Ordenamiento por campos relevantes
    ordering_fields = ['fecha', 'hora', 'sensor__aula__nombre', 'tipo_cambio']
    ordering = ['-fecha', '-hora']

    def get_queryset(self):
        """
        Optimizar queryset con select_related y prefetch_related
        """
        return Registro.objects.select_related(
            'sensor__aula',
            'usuario'
        ).prefetch_related(
            'sensor'
        ).all()

    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """
        Endpoint para obtener estadísticas agregadas del historial
        """
        # Obtener parámetros de filtro desde la request
        filters = Q()

        fecha_desde = request.query_params.get('fecha_desde')
        fecha_hasta = request.query_params.get('fecha_hasta')
        aula_id = request.query_params.get('aula_id')
        usuario_id = request.query_params.get('usuario_id')

        if fecha_desde and fecha_hasta:
            filters &= Q(fecha__range=[fecha_desde, fecha_hasta])
        elif fecha_desde:
            filters &= Q(fecha__gte=fecha_desde)
        elif fecha_hasta:
            filters &= Q(fecha__lte=fecha_hasta)

        if aula_id:
            filters &= Q(sensor__aula_id=aula_id)

        if usuario_id:
            filters &= Q(usuario_id=usuario_id)

        # Estadísticas generales
        registros = Registro.objects.filter(filters)

        estadisticas = {
            'total_registros': registros.count(),
            'registros_por_tipo': registros.values('tipo_cambio').annotate(count=Count('id')).order_by('-count'),
            'registros_por_fuente': registros.values('fuente').annotate(count=Count('id')).order_by('-count'),
            'registros_por_aula': registros.values('sensor__aula__nombre').annotate(count=Count('id')).order_by('-count'),
            'promedio_valores': registros.exclude(valor_numerico__isnull=True).aggregate(
                promedio=Avg('valor_numerico'),
                minimo=Min('valor_numerico'),
                maximo=Max('valor_numerico'),
                suma=Sum('valor_numerico')
            ) if registros.exists() else None,
            'periodo': {
                'fecha_desde': fecha_desde,
                'fecha_hasta': fecha_hasta,
                'aula': aula_id,
                'usuario': usuario_id
            }
        }

        return Response(estadisticas)

    @action(detail=False, methods=['get'])
    def exportar_csv(self, request):
        """
        Endpoint para exportar registros a CSV con StreamingHttpResponse para grandes datasets
        """
        # Obtener parámetros de filtro
        filters = Q()

        fecha_desde = request.query_params.get('fecha_desde')
        fecha_hasta = request.query_params.get('fecha_hasta')
        aula_id = request.query_params.get('aula_id')
        usuario_id = request.query_params.get('usuario_id')
        tipo_cambio = request.query_params.get('tipo_cambio')

        if fecha_desde and fecha_hasta:
            filters &= Q(fecha__range=[fecha_desde, fecha_hasta])
        elif fecha_desde:
            filters &= Q(fecha__gte=fecha_desde)
        elif fecha_hasta:
            filters &= Q(fecha__lte=fecha_hasta)

        if aula_id:
            filters &= Q(sensor__aula_id=aula_id)

        if usuario_id:
            filters &= Q(usuario_id=usuario_id)

        if tipo_cambio:
            filters &= Q(tipo_cambio=tipo_cambio)

        # Crear queryset filtrado y optimizado
        registros = Registro.objects.filter(filters).select_related(
            'sensor__aula', 'usuario'
        ).order_by('-fecha', '-hora')

        def generar_csv():
            # Crear buffer para escribir CSV
            output = StringIO()
            writer = csv.writer(output)

            # Escribir encabezados
            headers = [
                'Fecha', 'Hora', 'Aula', 'Sensor', 'Tipo Sensor',
                'Estado Anterior', 'Estado Nuevo', 'Tipo Cambio',
                'Valor Numérico', 'Unidad', 'Fuente', 'Usuario',
                'IP Origen', 'Observaciones'
            ]
            writer.writerow(headers)
            yield output.getvalue()
            output.close()

            # Procesar registros en lotes para evitar sobrecarga de memoria
            batch_size = 1000
            offset = 0

            while True:
                batch = registros[offset:offset + batch_size]
                if not batch:
                    break

                output = StringIO()
                writer = csv.writer(output)

                for registro in batch:
                    row = [
                        registro.fecha.strftime('%Y-%m-%d'),
                        registro.hora.strftime('%H:%M:%S'),
                        registro.sensor.aula.nombre if registro.sensor.aula else 'N/A',
                        registro.sensor.descripcion or registro.sensor.tipo,
                        registro.sensor.tipo,
                        registro.estado_anterior or '',
                        registro.estado_nuevo,
                        registro.tipo_cambio,
                        registro.valor_numerico if registro.valor_numerico else '',
                        registro.unidad or '',
                        registro.fuente,
                        registro.usuario.legajo if registro.usuario else '',
                        registro.ip_origen or '',
                        registro.observaciones or ''
                    ]
                    writer.writerow(row)

                yield output.getvalue()
                output.close()
                offset += batch_size

        # Crear response con streaming
        response = StreamingHttpResponse(
            generar_csv(),
            content_type='text/csv'
        )
        response['Content-Disposition'] = 'attachment; filename="registros_historial.csv"'

        return response
