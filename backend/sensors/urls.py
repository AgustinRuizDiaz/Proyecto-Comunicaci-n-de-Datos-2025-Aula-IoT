from django.urls import path
from . import views

urlpatterns = [
    path('', views.SensorListView.as_view(), name='sensor_list'),
    path('<str:sensor_id>/', views.SensorDetailView.as_view(), name='sensor_detail'),
    path('<str:sensor_id>/data/', views.SensorDataView.as_view(), name='sensor_data'),
    path('<str:sensor_id>/history/', views.SensorHistoryView.as_view(), name='sensor_history'),
    path('register/', views.SensorRegistrationView.as_view(), name='sensor_register'),
]
