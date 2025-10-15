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




from rest_framework import viewsets, filters
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from .serializers import (
    UserManagementSerializer, UserCreateSerializer, UserUpdateSerializer,
    UserActivityDetailSerializer
)


class UserManagementViewSet(viewsets.ModelViewSet):
    """
    ViewSet لإدارة المستخدمين من قبل المديرين
    """
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['role', 'is_active', 'is_verified']
    search_fields = ['email', 'first_name', 'last_name', 'username', 'company_name']
    ordering_fields = ['created_at', 'last_login', 'email']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserManagementSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # السماح للمديرين فقط بعرض جميع المستخدمين
        if not self.request.user.can_manage_users():
            return queryset.filter(id=self.request.user.id)
        
        return queryset
    
    def perform_create(self, serializer):
        # التحقق من صلاحية إنشاء مستخدمين
        if not self.request.user.can_manage_users():
            raise permissions.PermissionDenied('ليس لديك صلاحية إنشاء مستخدمين')
        
        user = serializer.save()
        
        # تسجيل النشاط
        UserActivity.objects.create(
            user=self.request.user,
            activity_type=UserActivity.ActivityType.CREATE,
            description=f'إنشاء مستخدم جديد: {user.email}',
            ip_address=self.get_client_ip(self.request),
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
            metadata={'created_user_id': user.id, 'created_user_email': user.email}
        )
    
    def perform_update(self, serializer):
        # التحقق من صلاحية تحديث المستخدمين
        if not self.request.user.can_manage_users() and serializer.instance.id != self.request.user.id:
            raise permissions.PermissionDenied('ليس لديك صلاحية تحديث هذا المستخدم')
        
        user = serializer.save()
        
        # تسجيل النشاط
        UserActivity.objects.create(
            user=self.request.user,
            activity_type=UserActivity.ActivityType.UPDATE,
            description=f'تحديث بيانات المستخدم: {user.email}',
            ip_address=self.get_client_ip(self.request),
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
            metadata={'updated_user_id': user.id, 'updated_user_email': user.email}
        )
    
    def perform_destroy(self, instance):
        # التحقق من صلاحية حذف المستخدمين
        if not self.request.user.can_manage_users():
            raise permissions.PermissionDenied('ليس لديك صلاحية حذف مستخدمين')
        
        # منع حذف المستخدم الحالي
        if instance.id == self.request.user.id:
            raise permissions.PermissionDenied('لا يمكنك حذف حسابك الخاص')
        
        # تسجيل النشاط قبل الحذف
        UserActivity.objects.create(
            user=self.request.user,
            activity_type=UserActivity.ActivityType.DELETE,
            description=f'حذف المستخدم: {instance.email}',
            ip_address=self.get_client_ip(self.request),
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
            metadata={'deleted_user_id': instance.id, 'deleted_user_email': instance.email}
        )
        
        instance.delete()
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """تفعيل المستخدم"""
        if not request.user.can_manage_users():
            raise permissions.PermissionDenied('ليس لديك صلاحية تفعيل مستخدمين')
        
        user = self.get_object()
        user.is_active = True
        user.save()
        
        # تسجيل النشاط
        UserActivity.objects.create(
            user=request.user,
            activity_type=UserActivity.ActivityType.UPDATE,
            description=f'تفعيل المستخدم: {user.email}',
            ip_address=self.get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            metadata={'activated_user_id': user.id}
        )
        
        return Response({
            'message': 'تم تفعيل المستخدم بنجاح',
            'user': UserManagementSerializer(user).data
        })
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """تعطيل المستخدم"""
        if not request.user.can_manage_users():
            raise permissions.PermissionDenied('ليس لديك صلاحية تعطيل مستخدمين')
        
        user = self.get_object()
        
        # منع تعطيل المستخدم الحالي
        if user.id == request.user.id:
            return Response({
                'error': 'لا يمكنك تعطيل حسابك الخاص'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user.is_active = False
        user.save()
        
        # تسجيل النشاط
        UserActivity.objects.create(
            user=request.user,
            activity_type=UserActivity.ActivityType.UPDATE,
            description=f'تعطيل المستخدم: {user.email}',
            ip_address=self.get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            metadata={'deactivated_user_id': user.id}
        )
        
        return Response({
            'message': 'تم تعطيل المستخدم بنجاح',
            'user': UserManagementSerializer(user).data
        })
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """إحصائيات المستخدمين"""
        if not request.user.can_manage_users():
            raise permissions.PermissionDenied('ليس لديك صلاحية عرض الإحصائيات')
        
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        inactive_users = User.objects.filter(is_active=False).count()
        
        users_by_role = {}
        for role_value, role_label in User.UserRole.choices:
            users_by_role[role_value] = User.objects.filter(role=role_value).count()
        
        return Response({
            'total_users': total_users,
            'active_users': active_users,
            'inactive_users': inactive_users,
            'users_by_role': users_by_role,
        })
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class UserActivityViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet لعرض أنشطة المستخدمين (للقراءة فقط)
    """
    queryset = UserActivity.objects.select_related('user').all()
    serializer_class = UserActivityDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['user', 'activity_type']
    search_fields = ['description', 'user__email', 'user__first_name', 'user__last_name']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # السماح للمديرين بعرض جميع الأنشطة، والمستخدمين العاديين بعرض أنشطتهم فقط
        if not self.request.user.can_manage_users():
            return queryset.filter(user=self.request.user)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def my_activities(self, request):
        """عرض أنشطة المستخدم الحالي"""
        activities = UserActivity.objects.filter(user=request.user).order_by('-created_at')[:50]
        serializer = self.get_serializer(activities, many=True)
        return Response(serializer.data)

