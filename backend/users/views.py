from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from .models import User
from .serializers import UserSerializer
from .role_serializers import (
    UserAdminSerializer,
    UserOperatorSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    get_user_serializer
)
from .permissions import (
    IsAdmin,
    IsOperator,
    CanAccessUserData,
    IsAdminOrReadOnly
)


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de usuarios con permisos basados en roles

    - Admin: CRUD completo
    - Operario: Solo lectura de usuarios activos
    """
    queryset = User.objects.all()
    permission_classes = [CanAccessUserData]

    def get_serializer_class(self):
        """
        Retorna el serializer apropiado basado en el rol del usuario
        """
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        else:
            # Para list y retrieve, usar serializer basado en rol
            request = self.request
            if request.user.rol == 'Admin':
                return UserAdminSerializer
            return UserOperatorSerializer

    def get_queryset(self):
        """
        Filtra el queryset basado en el rol del usuario
        """
        queryset = User.objects.all()

        if self.request.user.rol == 'Admin':
            # Admin ve todos los usuarios
            return queryset
        elif self.request.user.rol == 'Operario':
            # Operario solo ve usuarios activos
            return queryset.filter(is_active=True)
        else:
            # Otros usuarios autenticados no ven nada
            return User.objects.none()

    def perform_create(self, serializer):
        """
        Crea un usuario (solo admins)
        """
        if self.request.user.rol != 'Admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Solo los administradores pueden crear usuarios.")
        serializer.save()

    def perform_update(self, serializer):
        """
        Actualiza un usuario (solo admins)
        """
        if self.request.user.rol != 'Admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Solo los administradores pueden modificar usuarios.")
        serializer.save()

    def perform_destroy(self, instance):
        """
        Elimina un usuario (solo admins)
        """
        if self.request.user.rol != 'Admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Solo los administradores pueden eliminar usuarios.")
        instance.delete()
