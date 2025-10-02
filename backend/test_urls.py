from django.urls import path
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def basic_login(request):
    """
    Endpoint básico de login para testing
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            legajo = data.get('legajo')
            password = data.get('password')

            print(f"🔐 Basic login llamado con legajo: {legajo}")

            # Verificación simple
            if legajo == '123456' and password == 'admin123':
                return JsonResponse({
                    'success': True,
                    'message': 'Login exitoso',
                    'user': {
                        'legajo': legajo,
                        'rol': 'Admin'
                    }
                })
            else:
                return JsonResponse({
                    'success': False,
                    'error': 'Credenciales inválidas'
                }, status=401)

        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'JSON inválido'
            }, status=400)
    else:
        return JsonResponse({
            'error': 'Método no permitido'
        }, status=405)

urlpatterns = [
    path('basic-login/', basic_login),
]
