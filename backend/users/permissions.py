from rest_framework.permissions import BasePermission
from rest_framework.exceptions import PermissionDenied
from .models import User


class IsAuthenticated(BasePermission):
    """
    Permite acceso solo a usuarios autenticados
    """
    message = 'Debe estar autenticado para acceder a este recurso.'

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)


class IsAdmin(BasePermission):
    """
    Permite acceso solo a usuarios con rol Admin
    """
    message = 'Solo los administradores pueden acceder a este recurso.'

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        try:
            # Buscar el usuario personalizado relacionado
            gestor_user = User.objects.get(auth_user=request.user)
            return gestor_user.rol == 'Admin'
        except User.DoesNotExist:
            return False


class IsOperator(BasePermission):
    """
    Permite acceso solo a usuarios con rol Operario
    """
    message = 'Solo los operarios pueden acceder a este recurso.'

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        try:
            # Buscar el usuario personalizado relacionado
            gestor_user = User.objects.get(auth_user=request.user)
            return gestor_user.rol == 'Operario'
        except User.DoesNotExist:
            return False


class IsAdminOrReadOnly(BasePermission):
    """
    Permite acceso completo a Admins, solo lectura a otros usuarios autenticados
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        try:
            gestor_user = User.objects.get(auth_user=request.user)
            if gestor_user.rol == 'Admin':
                return True

            # Para usuarios autenticados que no son Admin, solo permitir métodos seguros
            if request.method in ['GET', 'HEAD', 'OPTIONS']:
                return True

            return False
        except User.DoesNotExist:
            return False


class IsOperatorOrReadOnly(BasePermission):
    """
    Permite acceso completo a Operarios, solo lectura a otros usuarios autenticados
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        try:
            gestor_user = User.objects.get(auth_user=request.user)
            if gestor_user.rol == 'Operario':
                return True

            # Para usuarios autenticados que no son Operario, solo permitir métodos seguros
            if request.method in ['GET', 'HEAD', 'OPTIONS']:
                return True

            return False
        except User.DoesNotExist:
            return False


class CanAccessUserData(BasePermission):
    """
    Permite acceso a datos de usuarios basado en el rol
    - Admin: acceso completo a todos los usuarios
    - Operario: solo lectura de usuarios activos
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        try:
            gestor_user = User.objects.get(auth_user=request.user)
            if gestor_user.rol == 'Admin':
                return True

            if gestor_user.rol == 'Operario':
                # Operarios pueden ver usuarios pero no modificarlos
                if request.method in ['GET', 'HEAD', 'OPTIONS']:
                    return True

            return False
        except User.DoesNotExist:
            return False

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        try:
            gestor_user = User.objects.get(auth_user=request.user)
            if gestor_user.rol == 'Admin':
                return True

            if gestor_user.rol == 'Operario':
                # Operarios solo pueden ver usuarios activos
                if request.method in ['GET', 'HEAD', 'OPTIONS']:
                    return obj.is_active

            return False
        except User.DoesNotExist:
            return False


class CanAccessClassroomData(BasePermission):
    """
    Permite acceso a datos de aulas basado en el rol
    - Admin: acceso completo a todas las aulas
    - Operario: solo lectura de aulas activas
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        try:
            gestor_user = User.objects.get(auth_user=request.user)
            if gestor_user.rol == 'Admin':
                return True

            if gestor_user.rol == 'Operario':
                # Operarios pueden ver aulas pero no modificarlas
                if request.method in ['GET', 'HEAD', 'OPTIONS']:
                    return True

            return False
        except User.DoesNotExist:
            return False


class CanAccessSensorData(BasePermission):
    """
    Permite acceso a datos de sensores basado en el rol
    - Admin: acceso completo a todos los sensores
    - Operario: acceso completo (ya que operarios manejan sensores)
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        try:
            gestor_user = User.objects.get(auth_user=request.user)
            # Tanto Admin como Operario pueden acceder a sensores
            return gestor_user.rol in ['Admin', 'Operario']
        except User.DoesNotExist:
            return False


class CanAccessHistoryData(BasePermission):
    """
    Permite acceso a datos históricos basado en el rol
    - Admin: acceso completo a todos los registros
    - Operario: acceso completo (ya que operarios generan registros)
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        try:
            gestor_user = User.objects.get(auth_user=request.user)
            # Tanto Admin como Operario pueden acceder al historial
            return gestor_user.rol in ['Admin', 'Operario']
        except User.DoesNotExist:
            return False


class IsAdminOrOperator(BasePermission):
    """
    Permiso personalizado para usuarios con rol 'Admin' o 'Operario'
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        try:
            gestor_user = User.objects.get(auth_user=request.user)
            return gestor_user.rol in ['Admin', 'Operario']
        except User.DoesNotExist:
            return False
