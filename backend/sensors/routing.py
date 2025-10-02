from django.urls import path
from sensors.consumers import AulaConsumer

websocket_urlpatterns = [
    path('ws/aula/<int:aula_id>/', AulaConsumer.as_asgi()),
]
