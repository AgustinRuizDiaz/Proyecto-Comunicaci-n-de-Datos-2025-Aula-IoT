import django_filters
from django_filters import DateFromToRangeFilter, ModelChoiceFilter, ChoiceFilter, CharFilter
from .models import Registro
from users.models import User
from classrooms.models import Aula


class RegistroFilter(django_filters.FilterSet):
    """
    Filtros avanzados para el modelo Registro según los requerimientos
    """
    # Filtro de rango de fechas usando DateFromToRangeFilter
    fecha = DateFromToRangeFilter(field_name='fecha')

    # Filtro por usuario usando ModelChoiceFilter
    usuario = ModelChoiceFilter(
        queryset=User.objects.all(),
        field_name='usuario',
        empty_label="Todos los usuarios"
    )

    # Filtro por aula a través de sensor__aula usando ModelChoiceFilter
    aula = ModelChoiceFilter(
        queryset=Aula.objects.all(),
        field_name='sensor__aula',
        empty_label="Todas las aulas"
    )

    # Filtro por tipo de cambio usando ChoiceFilter
    tipo_cambio = ChoiceFilter(
        choices=[
            ('estado', 'Estado'),
            ('lectura', 'Lectura'),
            ('accion', 'Acción'),
            ('alarma', 'Alarma'),
        ],
        empty_label="Todos los tipos"
    )

    # Filtro por fuente usando ChoiceFilter
    fuente = ChoiceFilter(
        choices=Registro.FUENTE_CHOICES,
        empty_label="Todas las fuentes"
    )

    # Filtros de texto para búsquedas
    sensor_tipo = CharFilter(
        field_name='sensor__tipo',
        lookup_expr='icontains',
        label='Tipo de sensor'
    )

    estado_nuevo = CharFilter(
        field_name='estado_nuevo',
        lookup_expr='icontains',
        label='Estado nuevo'
    )

    # Filtro por valor numérico (rango)
    valor_min = django_filters.NumberFilter(
        field_name='valor_numerico',
        lookup_expr='gte',
        label='Valor mínimo'
    )

    valor_max = django_filters.NumberFilter(
        field_name='valor_numerico',
        lookup_expr='lte',
        label='Valor máximo'
    )

    class Meta:
        model = Registro
        fields = [
            'fecha', 'usuario', 'aula', 'tipo_cambio', 'fuente',
            'sensor_tipo', 'estado_nuevo', 'valor_min', 'valor_max'
        ]
