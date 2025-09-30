from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import SensorViewSet

router = DefaultRouter()
router.register(r'', SensorViewSet)  # Register at root level to match /api/sensors/

urlpatterns = router.urls
