from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User
from .serializers import UserSerializer


class LoginView(APIView):
    """
    Endpoint para login de usuarios
    """
    permission_classes = [AllowAny]

    def post(self, request):
        legajo = request.data.get('legajo')
        password = request.data.get('password')

        if not legajo or not password:
            return Response(
                {'error': 'Legajo y contraseña son requeridos'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Autenticar usuario
        user = authenticate(legajo=legajo, password=password)

        if user:
            if not user.is_active:
                return Response(
                    {'error': 'Usuario inactivo'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Generar tokens JWT
            refresh = RefreshToken.for_user(user)

            return Response({
                'message': 'Login exitoso',
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_200_OK)
        else:
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
