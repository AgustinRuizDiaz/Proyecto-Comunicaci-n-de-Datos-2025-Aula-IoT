from django.urls import path
from . import views

urlpatterns = [
    path('', views.ClassroomListView.as_view(), name='classroom_list'),
    path('<str:classroom_id>/', views.ClassroomDetailView.as_view(), name='classroom_detail'),
    path('<str:classroom_id>/sensors/', views.ClassroomSensorsView.as_view(), name='classroom_sensors'),
    path('<str:classroom_id>/status/', views.ClassroomStatusView.as_view(), name='classroom_status'),
]
