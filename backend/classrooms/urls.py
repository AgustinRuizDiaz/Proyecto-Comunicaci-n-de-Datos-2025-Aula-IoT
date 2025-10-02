from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import AulaViewSet, ConfiguracionAulaViewSet

router = DefaultRouter()
router.register(r'', AulaViewSet)  # Register at root level to match /api/classrooms/
router.register(r'configuraciones', ConfiguracionAulaViewSet)  # Register configurations at /api/classrooms/configuraciones/

urlpatterns = router.urls
