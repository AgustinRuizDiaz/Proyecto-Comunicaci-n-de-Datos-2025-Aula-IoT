from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import AulaViewSet

router = DefaultRouter()
router.register(r'', AulaViewSet)  # Register at root level to match /api/classrooms/

urlpatterns = router.urls
