from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Registro
from .serializers import RegistroSerializer
from users.permissions import CanAccessHistoryData


class RegistroViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de registros históricos con permisos basados en roles

    - Admin: CRUD completo
    - Operario: CRUD completo (generan registros)
    """
    queryset = Registro.objects.all()
    serializer_class = RegistroSerializer
    permission_classes = [CanAccessHistoryData]
