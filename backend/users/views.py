from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from .models import User, UserActivity
from .serializers import (
    UserSerializer, 
    LoginSerializer, 
    TokenSerializer,
    UserRegistrationSerializer,
    UserActivitySerializer
)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # إنشاء التوكن
            refresh = RefreshToken.for_user(user)
            access = refresh.access_token
            
            # تسجيل نشاط المستخدم
            UserActivity.objects.create(
                user=user,
                activity_type='login',
                description='تسجيل دخول ناجح',
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            # تحديث آخر تسجيل دخول
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])
            
            return Response({
                'access': str(access),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            # تسجيل نشاط المستخدم
            UserActivity.objects.create(
                user=request.user,
                activity_type='logout',
                description='تسجيل خروج',
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            return Response({'message': 'تم تسجيل الخروج بنجاح'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': 'حدث خطأ أثناء تسجيل الخروج'}, status=status.HTTP_400_BAD_REQUEST)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # إنشاء التوكن
            refresh = RefreshToken.for_user(user)
            access = refresh.access_token
            
            # تسجيل نشاط المستخدم
            UserActivity.objects.create(
                user=user,
                activity_type='create',
                description='إنشاء حساب جديد',
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            return Response({
                'access': str(access),
                'refresh': str(refresh),
                'user': UserSerializer(user).data,
                'message': 'تم إنشاء الحساب بنجاح'
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            
            # تسجيل نشاط المستخدم
            UserActivity.objects.create(
                user=request.user,
                activity_type='update',
                description='تحديث الملف الشخصي',
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_activities(request):
    """جلب أنشطة المستخدم الحالي"""
    activities = UserActivity.objects.filter(user=request.user).order_by('-timestamp')[:20]
    serializer = UserActivitySerializer(activities, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def create_demo_user(request):
    """إنشاء مستخدم تجريبي للاختبار"""
    try:
        # التحقق من وجود المستخدم التجريبي
        user, created = User.objects.get_or_create(
            email='admin@ideateam.com',
            defaults={
                'first_name': 'مدير',
                'last_name': 'النظام',
                'role': 'admin',
                'is_active': True,
            }
        )
        
        if created:
            user.set_password('admin123')
            user.save()
            message = 'تم إنشاء المستخدم التجريبي بنجاح'
        else:
            message = 'المستخدم التجريبي موجود بالفعل'
        
        return Response({
            'message': message,
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'حدث خطأ: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
