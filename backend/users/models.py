from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """
    نموذج المستخدم المخصص لمنصة أيديا
    """
    
    class UserRole(models.TextChoices):
        ADMIN = 'admin', _('مدير النظام')
        MANAGER = 'manager', _('مدير')
        EMPLOYEE = 'employee', _('موظف')
        CLIENT = 'client', _('عميل')
    
    # معلومات إضافية
    email = models.EmailField(_('البريد الإلكتروني'), unique=True)
    phone = models.CharField(_('رقم الهاتف'), max_length=20, blank=True)
    role = models.CharField(
        _('الدور'),
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.CLIENT
    )
    
    # معلومات الملف الشخصي
    avatar = models.ImageField(_('الصورة الشخصية'), upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(_('نبذة تعريفية'), blank=True)
    
    # معلومات الشركة (للعملاء)
    company_name = models.CharField(_('اسم الشركة'), max_length=200, blank=True)
    company_website = models.URLField(_('موقع الشركة'), blank=True)
    company_address = models.TextField(_('عنوان الشركة'), blank=True)
    
    # إعدادات الحساب
    is_verified = models.BooleanField(_('محقق'), default=False)
    is_active = models.BooleanField(_('نشط'), default=True)
    
    # تواريخ مهمة
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)
    updated_at = models.DateTimeField(_('تاريخ التحديث'), auto_now=True)
    last_login_ip = models.GenericIPAddressField(_('آخر IP تسجيل دخول'), blank=True, null=True)
    
    # إعدادات الإشعارات
    email_notifications = models.BooleanField(_('إشعارات البريد الإلكتروني'), default=True)
    sms_notifications = models.BooleanField(_('إشعارات الرسائل النصية'), default=False)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        verbose_name = _('مستخدم')
        verbose_name_plural = _('المستخدمون')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
    
    def get_full_name(self):
        """إرجاع الاسم الكامل للمستخدم"""
        return f"{self.first_name} {self.last_name}".strip() or self.username
    
    def is_team_member(self):
        """التحقق من كون المستخدم عضو في الفريق"""
        return self.role in [self.UserRole.ADMIN, self.UserRole.MANAGER, self.UserRole.EMPLOYEE]
    
    def is_client_user(self):
        """التحقق من كون المستخدم عميل"""
        return self.role == self.UserRole.CLIENT
    
    def can_manage_users(self):
        """التحقق من صلاحية إدارة المستخدمين"""
        return self.role in [self.UserRole.ADMIN, self.UserRole.MANAGER]
    
    def can_manage_projects(self):
        """التحقق من صلاحية إدارة المشاريع"""
        return self.role in [self.UserRole.ADMIN, self.UserRole.MANAGER, self.UserRole.EMPLOYEE]


class UserProfile(models.Model):
    """
    ملف تعريفي إضافي للمستخدم
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # معلومات شخصية إضافية
    date_of_birth = models.DateField(_('تاريخ الميلاد'), blank=True, null=True)
    gender = models.CharField(
        _('الجنس'),
        max_length=10,
        choices=[('male', _('ذكر')), ('female', _('أنثى'))],
        blank=True
    )
    nationality = models.CharField(_('الجنسية'), max_length=50, blank=True)
    
    # معلومات الاتصال
    emergency_contact_name = models.CharField(_('اسم جهة الاتصال الطارئة'), max_length=100, blank=True)
    emergency_contact_phone = models.CharField(_('هاتف جهة الاتصال الطارئة'), max_length=20, blank=True)
    
    # معلومات مهنية (للموظفين)
    job_title = models.CharField(_('المسمى الوظيفي'), max_length=100, blank=True)
    department = models.CharField(_('القسم'), max_length=100, blank=True)
    hire_date = models.DateField(_('تاريخ التوظيف'), blank=True, null=True)
    salary = models.DecimalField(_('الراتب'), max_digits=10, decimal_places=2, blank=True, null=True)
    
    # إعدادات الواجهة
    language = models.CharField(
        _('اللغة'),
        max_length=10,
        choices=[('ar', _('العربية')), ('en', _('الإنجليزية'))],
        default='ar'
    )
    timezone = models.CharField(_('المنطقة الزمنية'), max_length=50, default='Asia/Riyadh')
    theme = models.CharField(
        _('المظهر'),
        max_length=10,
        choices=[('light', _('فاتح')), ('dark', _('داكن'))],
        default='light'
    )
    
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)
    updated_at = models.DateTimeField(_('تاريخ التحديث'), auto_now=True)
    
    class Meta:
        verbose_name = _('ملف تعريفي')
        verbose_name_plural = _('الملفات التعريفية')
    
    def __str__(self):
        return f"ملف {self.user.get_full_name()}"


class UserActivity(models.Model):
    """
    سجل أنشطة المستخدم
    """
    
    class ActivityType(models.TextChoices):
        LOGIN = 'login', _('تسجيل دخول')
        LOGOUT = 'logout', _('تسجيل خروج')
        CREATE = 'create', _('إنشاء')
        UPDATE = 'update', _('تحديث')
        DELETE = 'delete', _('حذف')
        VIEW = 'view', _('عرض')
        DOWNLOAD = 'download', _('تحميل')
        UPLOAD = 'upload', _('رفع')
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(_('نوع النشاط'), max_length=20, choices=ActivityType.choices)
    description = models.TextField(_('وصف النشاط'))
    ip_address = models.GenericIPAddressField(_('عنوان IP'), blank=True, null=True)
    user_agent = models.TextField(_('معلومات المتصفح'), blank=True)
    
    # معلومات إضافية (JSON)
    metadata = models.JSONField(_('بيانات إضافية'), default=dict, blank=True)
    
    created_at = models.DateTimeField(_('تاريخ النشاط'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('نشاط مستخدم')
        verbose_name_plural = _('أنشطة المستخدمين')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.get_activity_type_display()}"
