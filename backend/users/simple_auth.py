from django.urls import path
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from .models import User
from rest_framework_simplejwt.tokens import RefreshToken

@csrf_exempt
@require_http_methods(["POST"])
def simple_login(request):
    """
    Endpoint de login simplificado sin autenticación DRF
    """
    try:
        data = json.loads(request.body)
        legajo = data.get('legajo')
        password = data.get('password')

        print(f"🔐 Simple login llamado con legajo: {legajo}")

        if not legajo or not password:
            return JsonResponse(
                {'error': 'Legajo y contraseña son requeridos'},
                status=400
            )

        # Buscar usuario
        try:
            gestor_user = User.objects.get(legajo=legajo)
            print(f"✅ Usuario encontrado: {gestor_user.legajo}")
        except User.DoesNotExist:
            print(f"❌ Usuario no encontrado: {legajo}")
            return JsonResponse(
                {'error': 'Credenciales inválidas'},
                status=401
            )

        # Verificar contraseña
        if gestor_user.auth_user.check_password(password):
            print(f"✅ Contraseña correcta")

            # Generar tokens
            refresh = RefreshToken.for_user(gestor_user.auth_user)

            return JsonResponse({
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
            })
        else:
            print(f"❌ Contraseña incorrecta")
            return JsonResponse(
                {'error': 'Credenciales inválidas'},
                status=401
            )

    except json.JSONDecodeError:
        return JsonResponse(
            {'error': 'JSON inválido'},
            status=400
        )
    except Exception as e:
        print(f"❌ Error en simple_login: {e}")
        return JsonResponse(
            {'error': 'Error interno del servidor'},
            status=500
        )
