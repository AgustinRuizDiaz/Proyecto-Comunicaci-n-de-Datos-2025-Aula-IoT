from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import RegistroViewSet

router = DefaultRouter()
router.register(r'', RegistroViewSet)  # Register at root level to match /api/history/

urlpatterns = router.urls
