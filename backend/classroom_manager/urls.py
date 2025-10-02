"""
URL configuration for classroom_manager project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt


def api_status(request):
    """Vista simple para verificar que la API está funcionando"""
    return JsonResponse({
        'status': 'success',
        'message': '¡Gestor de Aulas API funcionando correctamente!',
        'version': '1.0.0',
        'endpoints': {
            'admin': '/admin/',
            'api_users': '/api/users/',
            'api_classrooms': '/api/classrooms/',
            'api_sensors': '/api/sensors/',
            'api_history': '/api/history/',
            'test_endpoint': '/test-endpoint/',  # ← Endpoint de prueba
        }
    })


def home(request):
    """Página principal del proyecto"""
    return JsonResponse({
        'message': '¡Bienvenido al Gestor de Aulas Universitarias!',
        'description': 'Sistema de gestión de aulas con integración IoT',
        'status': 'API funcionando correctamente',
        'version': '1.0.0',
        'documentation': 'Consulta la documentación en README.md',
        'endpoints': {
            'api_status': '/api/status/',
            'admin_panel': '/admin/',
            'api_users': '/api/users/',
            'api_classrooms': '/api/classrooms/',
            'api_sensors': '/api/sensors/',
            'api_history': '/api/history/',
            'test_endpoint': '/test-endpoint/',  # ← Endpoint de prueba
        },
        'frontend': {
            'url': 'http://localhost:5188',
            'login': 'http://localhost:5188/login',
            'dashboard': 'http://localhost:5188/',
        }
    })


@csrf_exempt
def test_endpoint(request):
    """Endpoint de prueba completamente simple"""
    if request.method == 'POST':
        try:
            import json
            body = request.body.decode('utf-8')
            data = json.loads(body)

            legajo = data.get('legajo')
            password = data.get('password')

            print(f"🔐 Test endpoint llamado con legajo: {legajo}")

            if legajo == '123456' and password == 'admin123':
                return JsonResponse({
                    'success': True,
                    'message': 'Login exitoso - Test endpoint funcionando',
                    'user': {
                        'legajo': legajo,
                        'rol': 'Admin'
                    },
                    'tokens': {
                        'access': 'test-access-token',
                        'refresh': 'test-refresh-token'
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
            print(f"❌ Error en test_endpoint: {e}")
            return JsonResponse({
                'success': False,
                'error': 'Error interno del servidor'
            }, status=500)
    else:
        return JsonResponse({
            'message': 'Test endpoint funcionando',
            'method': request.method,
            'status': 'Endpoint activo'
        })


urlpatterns = [
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    path('api/status/', api_status, name='api_status'),
    path('api/users/', include('users.urls')),
    path('api/classrooms/', include('classrooms.urls')),
    path('api/sensors/', include('sensors.urls')),
    path('api/history/', include('history.urls')),
    path('test-endpoint/', test_endpoint, name='test_endpoint'),  # ← Endpoint de prueba directo
]
