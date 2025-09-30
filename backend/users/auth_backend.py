from django.contrib.auth.backends import ModelBackend
from django.db.models import Q
from .models import User


class CustomAuthBackend(ModelBackend):
    """
    Custom authentication backend that supports login with legajo field
    """

    def authenticate(self, request, legajo=None, password=None, **kwargs):
        if legajo is None or password is None:
            return None

        try:
            # Buscar usuario por legajo
            user = User.objects.get(legajo=legajo, is_active=True)
        except User.DoesNotExist:
            return None

        # Verificar contraseña
        if user.check_password(password):
            return user

        return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id, is_active=True)
        except User.DoesNotExist:
            return None
