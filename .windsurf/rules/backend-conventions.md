---
trigger: always_on
---

# Convenciones Backend (Django)

## Modelos y Base de Datos
- Usar modelos Django ORM estándar, NO djongo ni MongoDB
- Primary keys: AutoField (default)
- Foreign keys: on_delete=CASCADE para relaciones dependientes
- Índices en campos de búsqueda frecuente: legajo, ip_esp32, fecha
- Usar select_related() y prefetch_related() para optimizar queries

## ViewSets y Serializers
```python
# Estructura estándar de ViewSet
class AulaViewSet(viewsets.ModelViewSet):
    queryset = Aula.objects.select_related('user').prefetch_related('sensores')
    serializer_class = AulaSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['nombre', 'estado']
    search_fields = ['nombre', 'ip_esp32']
    ordering_fields = ['nombre', 'ultima_señal']
    ordering = ['-ultima_señal']
Optimizaciones Obligatorias

SIEMPRE usar transacciones atómicas para operaciones múltiples
bulk_create() y bulk_update() para operaciones masivas
F() expressions para evitar race conditions
Paginación en listados (PageNumberPagination)

Autenticación y Permisos

Token Authentication para API REST
Custom User model con campo 'legajo'
Permissions: IsAdmin, IsOperator, IsAuthenticated
Roles: Admin (todo), Operario (lectura + crear registros)

WebSockets (Django Channels)
python# Consumer estándar
class SensorConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'aula_{self.room_name}'
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )