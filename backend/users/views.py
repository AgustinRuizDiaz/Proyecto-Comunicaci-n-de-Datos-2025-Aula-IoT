from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import IntegrityError
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.pagination import PageNumberPagination
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
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    max_page_size = 100


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de usuarios con permisos basados en roles

    - Admin: CRUD completo
    - Operario: Solo lectura
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def change_password(self, request, pk=None):
        """
        Endpoint para cambiar contraseña de otro usuario (solo admins)
        """
        user = self.get_object()

        # Prevenir cambio de contraseña propia a través de este endpoint
        if user.id == request.user.id:
            return Response(
                {"error": "Usa el endpoint de cambio de contraseña personal."},
                status=status.HTTP_400_BAD_REQUEST
            )

        new_password = request.data.get('new_password')
        if not new_password:
            return Response(
                {"error": "Se requiere el campo 'new_password'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Validar la nueva contraseña
            validate_password(new_password, user=user)

            # Cambiar contraseña
            user.set_password(new_password)
            user.save()

            return Response(
                {"message": "Contraseña cambiada exitosamente."},
                status=status.HTTP_200_OK
            )

        except ValidationError as e:
            return Response(
                {"error": "Contraseña inválida.", "details": e.messages},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'], permission_classes=[IsAdmin])
    def stats(self, request):
        """
        Endpoint para obtener estadísticas de usuarios (solo admins)
        """
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        inactive_users = User.objects.filter(is_active=False).count()
        admin_users = User.objects.filter(rol='Admin').count()
        operator_users = User.objects.filter(rol='Operario').count()

        return Response({
            "total_users": total_users,
            "active_users": active_users,
            "inactive_users": inactive_users,
            "admin_users": admin_users,
            "operator_users": operator_users
        })
