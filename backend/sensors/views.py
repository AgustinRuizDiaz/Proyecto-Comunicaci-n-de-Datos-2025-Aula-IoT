from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Sensor
from .serializers import SensorSerializer
from users.permissions import CanAccessSensorData


class SensorViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de sensores con permisos basados en roles

    - Admin: CRUD completo
    - Operario: CRUD completo (manejan sensores)
    """
    queryset = Sensor.objects.all()
    serializer_class = SensorSerializer
    permission_classes = [CanAccessSensorData]
