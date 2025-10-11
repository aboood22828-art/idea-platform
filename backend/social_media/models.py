from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class SocialMediaAccount(models.Model):
    """حسابات وسائل التواصل الاجتماعي"""
    
    class Platform(models.TextChoices):
        TWITTER = 'twitter', 'تويتر'
        FACEBOOK = 'facebook', 'فيسبوك'
        INSTAGRAM = 'instagram', 'إنستغرام'
        LINKEDIN = 'linkedin', 'لينكد إن'
        YOUTUBE = 'youtube', 'يوتيوب'
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='social_accounts', verbose_name='المستخدم')
    platform = models.CharField('المنصة', max_length=20, choices=Platform.choices)
    account_name = models.CharField('اسم الحساب', max_length=100)
    account_id = models.CharField('معرف الحساب', max_length=100)
    access_token = models.TextField('رمز الوصول', blank=True)
    refresh_token = models.TextField('رمز التحديث', blank=True)
    token_expires_at = models.DateTimeField('تاريخ انتهاء الرمز', null=True, blank=True)
    is_active = models.BooleanField('نشط', default=True)
    created_at = models.DateTimeField('تاريخ الإضافة', auto_now_add=True)
    updated_at = models.DateTimeField('تاريخ التحديث', auto_now=True)
    
    class Meta:
        verbose_name = 'حساب وسائل التواصل'
        verbose_name_plural = 'حسابات وسائل التواصل'
        unique_together = ['user', 'platform', 'account_id']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_platform_display()} - {self.account_name}"


class Post(models.Model):
    """منشورات وسائل التواصل الاجتماعي"""
    
    class Status(models.TextChoices):
        DRAFT = 'draft', 'مسودة'
        SCHEDULED = 'scheduled', 'مجدول'
        PUBLISHED = 'published', 'منشور'
        FAILED = 'failed', 'فشل'
    
    account = models.ForeignKey(SocialMediaAccount, on_delete=models.CASCADE, related_name='posts', verbose_name='الحساب')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='social_posts', verbose_name='منشئ المنشور')
    content = models.TextField('المحتوى')
    media_urls = models.JSONField('روابط الوسائط', default=list, blank=True)
    status = models.CharField('الحالة', max_length=20, choices=Status.choices, default=Status.DRAFT)
    scheduled_at = models.DateTimeField('موعد النشر', null=True, blank=True)
    published_at = models.DateTimeField('تاريخ النشر الفعلي', null=True, blank=True)
    post_id = models.CharField('معرف المنشور', max_length=100, blank=True)
    error_message = models.TextField('رسالة الخطأ', blank=True)
    created_at = models.DateTimeField('تاريخ الإنشاء', auto_now_add=True)
    updated_at = models.DateTimeField('تاريخ التحديث', auto_now=True)
    
    class Meta:
        verbose_name = 'منشور'
        verbose_name_plural = 'المنشورات'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.account.platform} - {self.content[:50]}"


class PostAnalytics(models.Model):
    """تحليلات المنشورات"""
    
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='analytics', verbose_name='المنشور')
    likes_count = models.IntegerField('عدد الإعجابات', default=0)
    comments_count = models.IntegerField('عدد التعليقات', default=0)
    shares_count = models.IntegerField('عدد المشاركات', default=0)
    views_count = models.IntegerField('عدد المشاهدات', default=0)
    reach = models.IntegerField('الوصول', default=0)
    engagement_rate = models.DecimalField('معدل التفاعل', max_digits=5, decimal_places=2, default=0)
    recorded_at = models.DateTimeField('تاريخ التسجيل', auto_now_add=True)
    
    class Meta:
        verbose_name = 'تحليلات المنشور'
        verbose_name_plural = 'تحليلات المنشورات'
        ordering = ['-recorded_at']
    
    def __str__(self):
        return f"تحليلات {self.post.post_id} - {self.recorded_at}"


class Campaign(models.Model):
    """حملات التسويق عبر وسائل التواصل"""
    
    class Status(models.TextChoices):
        DRAFT = 'draft', 'مسودة'
        ACTIVE = 'active', 'نشطة'
        PAUSED = 'paused', 'متوقفة'
        COMPLETED = 'completed', 'مكتملة'
    
    name = models.CharField('اسم الحملة', max_length=200)
    description = models.TextField('الوصف', blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='campaigns', verbose_name='منشئ الحملة')
    accounts = models.ManyToManyField(SocialMediaAccount, related_name='campaigns', verbose_name='الحسابات')
    posts = models.ManyToManyField(Post, related_name='campaigns', blank=True, verbose_name='المنشورات')
    status = models.CharField('الحالة', max_length=20, choices=Status.choices, default=Status.DRAFT)
    start_date = models.DateTimeField('تاريخ البداية')
    end_date = models.DateTimeField('تاريخ النهاية', null=True, blank=True)
    budget = models.DecimalField('الميزانية', max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField('تاريخ الإنشاء', auto_now_add=True)
    updated_at = models.DateTimeField('تاريخ التحديث', auto_now=True)
    
    class Meta:
        verbose_name = 'حملة'
        verbose_name_plural = 'الحملات'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
