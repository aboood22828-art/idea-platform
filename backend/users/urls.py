from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # المصادقة
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # الملف الشخصي
    path('profile/', views.UserProfileView.as_view(), name='user_profile'),
    path('activities/', views.user_activities, name='user_activities'),
    
    # للاختبار
    path('create-demo-user/', views.create_demo_user, name='create_demo_user'),
]

