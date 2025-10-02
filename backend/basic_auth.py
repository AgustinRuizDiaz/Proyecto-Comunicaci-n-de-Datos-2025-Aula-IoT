from django.urls import path
from django.http import HttpResponse
import json

def basic_login_view(request):
    """
    Endpoint de login completamente básico sin DRF ni autenticación
    """
    if request.method == 'POST':
        try:
            # Leer datos del body
            body = request.body.decode('utf-8')
            data = json.loads(body)

            legajo = data.get('legajo')
            password = data.get('password')

            print(f"🔐 Basic login llamado con legajo: {legajo}")

            # Verificación simple
            if legajo == '123456' and password == 'admin123':
                response_data = {
                    'success': True,
                    'message': 'Login exitoso',
                    'user': {
                        'legajo': legajo,
                        'rol': 'Admin'
                    },
                    'tokens': {
                        'access': 'fake-jwt-token',
                        'refresh': 'fake-refresh-token'
                    }
                }
                return HttpResponse(
                    json.dumps(response_data),
                    content_type='application/json',
                    status=200
                )
            else:
                response_data = {
                    'success': False,
                    'error': 'Credenciales inválidas'
                }
                return HttpResponse(
                    json.dumps(response_data),
                    content_type='application/json',
                    status=401
                )

        except json.JSONDecodeError:
            response_data = {
                'success': False,
                'error': 'JSON inválido'
            }
            return HttpResponse(
                json.dumps(response_data),
                content_type='application/json',
                status=400
            )
    else:
        response_data = {
            'error': 'Método no permitido'
        }
        return HttpResponse(
            json.dumps(response_data),
            content_type='application/json',
            status=405
        )

urlpatterns = [
    path('basic-login/', basic_login_view),
]
