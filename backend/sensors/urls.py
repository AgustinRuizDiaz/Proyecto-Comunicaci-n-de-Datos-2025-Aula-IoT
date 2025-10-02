from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SensorViewSet, ESP32HeartbeatView, ESP32SensorUpdateView

router = DefaultRouter()
router.register(r'', SensorViewSet)  # Register at root level to match /api/sensors/

urlpatterns = [
    path('', include(router.urls)),
    path('esp32/heartbeat/', ESP32HeartbeatView.as_view(), name='esp32_heartbeat'),
    path('esp32/sensor-update/', ESP32SensorUpdateView.as_view(), name='esp32_sensor_update'),
]
