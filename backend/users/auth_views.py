from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User as AuthUser
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import User


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    """
    Endpoint para login de usuarios
    """
    permission_classes = [AllowAny]
    authentication_classes = []  # Deshabilitar toda autenticación

    def post(self, request):
        print("🔐 LoginView.post called")
        print(f"📝 Headers: {dict(request.headers)}")
        print(f"📝 Method: {request.method}")
        print(f"📝 Content-Type: {request.content_type}")

        # Obtener datos del request
        if request.content_type == 'application/json':
            legajo = request.data.get('legajo')
            password = request.data.get('password')
        else:
            # Para datos de formulario
            legajo = request.POST.get('legajo')
            password = request.POST.get('password')

        print(f"📝 Datos recibidos: legajo={legajo}")

        if not legajo or not password:
            print("❌ Legajo o password faltantes")
            return Response(
                {'error': 'Legajo y contraseña son requeridos'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Buscar el usuario en el modelo personalizado
        try:
            gestor_user = User.objects.get(legajo=legajo)
            print(f"✅ Usuario encontrado: {gestor_user.legajo}")
        except User.DoesNotExist:
            print(f"❌ Usuario no encontrado: {legajo}")
            return Response(
                {'error': 'Credenciales inválidas'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Verificar contraseña directamente
        print(f"🔍 Verificando contraseña para usuario: {gestor_user.auth_user.username}")
        if gestor_user.auth_user.check_password(password):
            print(f"✅ Contraseña correcta para usuario: {gestor_user.auth_user.username}")

            # Generar tokens JWT usando el auth_user
            refresh = RefreshToken.for_user(gestor_user.auth_user)

            return Response({
                'message': 'Login exitoso',
                'user': {
                    'id': gestor_user.id,
                    'legajo': gestor_user.legajo,
                    'rol': gestor_user.rol,
                },
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_200_OK)
        else:
            print(f"❌ Contraseña incorrecta para usuario: {gestor_user.auth_user.username}")
            return Response(
                {'error': 'Credenciales inválidas'},
                status=status.HTTP_401_UNAUTHORIZED
            )


class LogoutView(APIView):
    """
    Endpoint para logout de usuarios
    """

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()

            return Response(
                {'message': 'Logout exitoso'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': 'Error durante logout'},
                status=status.HTTP_400_BAD_REQUEST
            )


class UserProfileView(APIView):
    """
    Endpoint para obtener perfil del usuario autenticado
    """

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
