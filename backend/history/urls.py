from django.urls import path
from . import views

urlpatterns = [
    path('', views.HistoryListView.as_view(), name='history_list'),
    path('<str:history_id>/', views.HistoryDetailView.as_view(), name='history_detail'),
    path('sensor/<str:sensor_id>/', views.SensorHistoryView.as_view(), name='sensor_history'),
    path('classroom/<str:classroom_id>/', views.ClassroomHistoryView.as_view(), name='classroom_history'),
    path('export/', views.ExportHistoryView.as_view(), name='export_history'),
]
