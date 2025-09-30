from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Aula
from .serializers import AulaSerializer
from users.permissions import CanAccessClassroomData, IsAdmin


class AulaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de aulas con permisos basados en roles

    - Admin: CRUD completo
    - Operario: Solo lectura
    """
    queryset = Aula.objects.all()
    serializer_class = AulaSerializer
    permission_classes = [CanAccessClassroomData]

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
