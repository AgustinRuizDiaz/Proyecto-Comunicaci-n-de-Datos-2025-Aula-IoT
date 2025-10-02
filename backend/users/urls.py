from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import UserViewSet
from .auth_views import LoginView, LogoutView, UserProfileView
from .simple_auth import simple_login

router = DefaultRouter()
router.register(r'', UserViewSet)  # Sin prefijo 'users'

urlpatterns = [
    *router.urls,
    path('login/', LoginView.as_view(), name='login'),
    path('simple-login/', simple_login, name='simple_login'),  # ← Nuevo endpoint de prueba
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
