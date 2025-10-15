from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, UserProfile, UserActivity


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['bio', 'avatar', 'phone', 'address', 'company', 'position', 'website']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'role', 
            'is_active', 'date_joined', 'last_login', 'profile'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'password', 'password_confirm']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("كلمات المرور غير متطابقة")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(email=email, password=password)
            if not user:
                raise serializers.ValidationError('بيانات الدخول غير صحيحة')
            if not user.is_active:
                raise serializers.ValidationError('الحساب غير مفعل')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('يجب إدخال البريد الإلكتروني وكلمة المرور')
        
        return attrs


class TokenSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserSerializer()


class UserActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserActivity
        fields = ['id', 'action', 'description', 'ip_address', 'user_agent', 'timestamp']
        read_only_fields = ['id', 'timestamp']




class UserManagementSerializer(serializers.ModelSerializer):
    """
    Serializer لإدارة المستخدمين من قبل المديرين
    """
    full_name = serializers.SerializerMethodField()
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'full_name',
            'phone', 'role', 'role_display', 'avatar', 'bio', 'company_name',
            'is_active', 'is_verified', 'email_notifications', 'sms_notifications',
            'created_at', 'updated_at', 'last_login', 'last_login_ip'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_login', 'last_login_ip']
    
    def get_full_name(self, obj):
        return obj.get_full_name()


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer لإنشاء مستخدم جديد من قبل المديرين
    """
    password = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = [
            'email', 'username', 'first_name', 'last_name', 'password',
            'phone', 'role', 'company_name', 'is_active', 'is_verified'
        ]
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer لتحديث بيانات المستخدم من قبل المديرين
    """
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone', 'role', 'avatar', 'bio',
            'company_name', 'is_active', 'is_verified', 'email_notifications',
            'sms_notifications'
        ]


class UserActivityDetailSerializer(serializers.ModelSerializer):
    """
    Serializer مفصل لأنشطة المستخدمين
    """
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    activity_type_display = serializers.CharField(source='get_activity_type_display', read_only=True)
    
    class Meta:
        model = UserActivity
        fields = [
            'id', 'user', 'user_name', 'user_email', 'activity_type',
            'activity_type_display', 'description', 'ip_address', 'user_agent',
            'metadata', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

