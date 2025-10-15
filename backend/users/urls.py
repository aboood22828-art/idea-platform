from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'management', views.UserManagementViewSet, basename='user-management')
router.register(r'activities', views.UserActivityViewSet, basename='user-activity')

urlpatterns = [
    # المصادقة
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # الملف الشخصي
    path('profile/', views.UserProfileView.as_view(), name='user_profile'),
    
    # للاختبار
    path('create-demo-user/', views.create_demo_user, name='create_demo_user'),
    
    # مسارات Router
    path('', include(router.urls)),
]

