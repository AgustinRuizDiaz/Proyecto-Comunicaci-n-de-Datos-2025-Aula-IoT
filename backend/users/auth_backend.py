from django.contrib.auth.backends import ModelBackend
from django.db.models import Q
from .models import User


class CustomAuthBackend(ModelBackend):
    """
    Custom authentication backend that supports login with legajo field
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        print(f"🔐 CustomAuthBackend.authenticate called with username={username}")
        if username is None or password is None:
            print("❌ Username or password is None")
            return None

        try:
            # Buscar usuario por legajo en el modelo personalizado
            gestor_user = User.objects.get(legajo=username)
            print(f"✅ Found gestor_user: {gestor_user.legajo}")
        except User.DoesNotExist:
            print(f"❌ User with legajo {username} not found")
            return None

        # Verificar contraseña con el usuario de Django auth
        print(f"🔍 Checking password for auth_user: {gestor_user.auth_user.username}")
        if gestor_user.auth_user.check_password(password):
            print(f"✅ Password correct for user: {gestor_user.auth_user.username}")
            return gestor_user.auth_user
        else:
            print(f"❌ Password incorrect for user: {gestor_user.auth_user.username}")

        return None

    def get_user(self, user_id):
        try:
            # El user_id es del AuthUser, no del modelo personalizado
            from django.contrib.auth.models import User as AuthUser
            return AuthUser.objects.get(pk=user_id)
        except AuthUser.DoesNotExist:
            return None
