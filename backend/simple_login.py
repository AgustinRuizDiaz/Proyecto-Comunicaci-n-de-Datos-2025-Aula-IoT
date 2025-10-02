from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def simple_login_endpoint(request):
    """
    Endpoint de login completamente simple usando Django puro
    """
    if request.method == 'POST':
        try:
            # Parsear JSON directamente del body
            body = request.body.decode('utf-8')
            data = json.loads(body)

            legajo = data.get('legajo')
            password = data.get('password')

            print(f"🔐 Simple login llamado con legajo: {legajo}")

            # Verificación simple
            if legajo == '123456' and password == 'admin123':
                return JsonResponse({
                    'success': True,
                    'message': 'Login exitoso',
                    'user': {
                        'legajo': legajo,
                        'rol': 'Admin'
                    },
                    'tokens': {
                        'access': 'fake-jwt-token-for-testing',
                        'refresh': 'fake-refresh-token-for-testing'
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
        except Exception as e:
            print(f"❌ Error en simple_login_endpoint: {e}")
            return JsonResponse({
                'success': False,
                'error': 'Error interno del servidor'
            }, status=500)
    else:
        return JsonResponse({
            'error': 'Método no permitido'
        }, status=405)

# También crear una función para GET requests para testing
@csrf_exempt
def simple_login_get(request):
    """Para testing con GET requests"""
    return JsonResponse({
        'message': 'Simple login endpoint funcionando',
        'method': 'GET',
        'status': 'Endpoint activo'
    })
