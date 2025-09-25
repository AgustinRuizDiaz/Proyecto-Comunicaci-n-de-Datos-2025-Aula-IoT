from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', views.UserProfileView.as_view(), name='user_profile'),
    path('register/', views.UserRegistrationView.as_view(), name='user_register'),
    path('', views.UserListView.as_view(), name='user_list'),
    path('<str:user_id>/', views.UserDetailView.as_view(), name='user_detail'),
]
