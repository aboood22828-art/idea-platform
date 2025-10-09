from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model

User = get_user_model()


class Project(models.Model):
    """
    نموذج المشروع
    """
    
    class ProjectStatus(models.TextChoices):
        DRAFT = 'draft', _('مسودة')
        ACTIVE = 'active', _('نشط')
        ON_HOLD = 'on_hold', _('معلق')
        COMPLETED = 'completed', _('مكتمل')
        CANCELLED = 'cancelled', _('ملغي')
    
    class ProjectType(models.TextChoices):
        MARKETING_STRATEGY = 'marketing_strategy', _('استراتيجية تسويقية')
        BRAND_IDENTITY = 'brand_identity', _('هوية تجارية')
        DIGITAL_MARKETING = 'digital_marketing', _('تسويق رقمي')
        SOCIAL_MEDIA = 'social_media', _('وسائل التواصل الاجتماعي')
        WEBSITE_DEVELOPMENT = 'website_development', _('تطوير موقع إلكتروني')
        CONTENT_CREATION = 'content_creation', _('إنتاج محتوى')
        CONSULTATION = 'consultation', _('استشارة')
        OTHER = 'other', _('أخرى')
    
    class Priority(models.TextChoices):
        LOW = 'low', _('منخفضة')
        MEDIUM = 'medium', _('متوسطة')
        HIGH = 'high', _('عالية')
        URGENT = 'urgent', _('عاجلة')
    
    # معلومات أساسية
    title = models.CharField(_('عنوان المشروع'), max_length=200)
    description = models.TextField(_('وصف المشروع'))
    project_type = models.CharField(_('نوع المشروع'), max_length=50, choices=ProjectType.choices)
    status = models.CharField(_('حالة المشروع'), max_length=20, choices=ProjectStatus.choices, default=ProjectStatus.DRAFT)
    priority = models.CharField(_('الأولوية'), max_length=20, choices=Priority.choices, default=Priority.MEDIUM)
    
    # العلاقات
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='client_projects', verbose_name=_('العميل'))
    project_manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_projects', verbose_name=_('مدير المشروع'))
    team_members = models.ManyToManyField(User, through='ProjectMember', related_name='team_projects', verbose_name=_('أعضاء الفريق'))
    
    # التواريخ والمواعيد
    start_date = models.DateField(_('تاريخ البداية'), null=True, blank=True)
    end_date = models.DateField(_('تاريخ النهاية'), null=True, blank=True)
    deadline = models.DateField(_('الموعد النهائي'), null=True, blank=True)
    
    # المعلومات المالية
    budget = models.DecimalField(_('الميزانية'), max_digits=12, decimal_places=2, null=True, blank=True)
    cost = models.DecimalField(_('التكلفة الفعلية'), max_digits=12, decimal_places=2, null=True, blank=True)
    
    # معلومات إضافية
    requirements = models.TextField(_('المتطلبات'), blank=True)
    deliverables = models.TextField(_('المخرجات المطلوبة'), blank=True)
    notes = models.TextField(_('ملاحظات'), blank=True)
    
    # الملفات والمرفقات
    project_folder = models.CharField(_('مجلد المشروع'), max_length=500, blank=True)
    
    # إعدادات المشروع
    is_confidential = models.BooleanField(_('سري'), default=False)
    client_can_view_progress = models.BooleanField(_('يمكن للعميل رؤية التقدم'), default=True)
    
    # تواريخ النظام
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)
    updated_at = models.DateTimeField(_('تاريخ التحديث'), auto_now=True)
    
    class Meta:
        verbose_name = _('مشروع')
        verbose_name_plural = _('المشاريع')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.client.get_full_name()}"
    
    def get_progress_percentage(self):
        """حساب نسبة التقدم في المشروع"""
        total_tasks = self.tasks.count()
        if total_tasks == 0:
            return 0
        completed_tasks = self.tasks.filter(status='completed').count()
        return round((completed_tasks / total_tasks) * 100, 2)
    
    def is_overdue(self):
        """التحقق من تأخر المشروع"""
        from django.utils import timezone
        return self.deadline and self.deadline < timezone.now().date() and self.status != self.ProjectStatus.COMPLETED


class ProjectMember(models.Model):
    """
    نموذج عضوية الفريق في المشروع
    """
    
    class Role(models.TextChoices):
        MANAGER = 'manager', _('مدير')
        DEVELOPER = 'developer', _('مطور')
        DESIGNER = 'designer', _('مصمم')
        CONTENT_CREATOR = 'content_creator', _('منشئ محتوى')
        ANALYST = 'analyst', _('محلل')
        COORDINATOR = 'coordinator', _('منسق')
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(_('الدور'), max_length=50, choices=Role.choices)
    
    # الصلاحيات
    can_edit_project = models.BooleanField(_('يمكن تعديل المشروع'), default=False)
    can_manage_tasks = models.BooleanField(_('يمكن إدارة المهام'), default=True)
    can_view_financials = models.BooleanField(_('يمكن رؤية المعلومات المالية'), default=False)
    
    joined_at = models.DateTimeField(_('تاريخ الانضمام'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('عضو فريق المشروع')
        verbose_name_plural = _('أعضاء فريق المشروع')
        unique_together = ['project', 'user']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.project.title}"


class Task(models.Model):
    """
    نموذج المهمة
    """
    
    class TaskStatus(models.TextChoices):
        TODO = 'todo', _('قائمة المهام')
        IN_PROGRESS = 'in_progress', _('قيد التنفيذ')
        REVIEW = 'review', _('قيد المراجعة')
        COMPLETED = 'completed', _('مكتملة')
        CANCELLED = 'cancelled', _('ملغية')
    
    class Priority(models.TextChoices):
        LOW = 'low', _('منخفضة')
        MEDIUM = 'medium', _('متوسطة')
        HIGH = 'high', _('عالية')
        URGENT = 'urgent', _('عاجلة')
    
    # معلومات أساسية
    title = models.CharField(_('عنوان المهمة'), max_length=200)
    description = models.TextField(_('وصف المهمة'), blank=True)
    status = models.CharField(_('حالة المهمة'), max_length=20, choices=TaskStatus.choices, default=TaskStatus.TODO)
    priority = models.CharField(_('الأولوية'), max_length=20, choices=Priority.choices, default=Priority.MEDIUM)
    
    # العلاقات
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks', verbose_name=_('المشروع'))
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks', verbose_name=_('مكلف بها'))
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tasks', verbose_name=_('منشئ المهمة'))
    
    # التواريخ
    due_date = models.DateTimeField(_('تاريخ الاستحقاق'), null=True, blank=True)
    started_at = models.DateTimeField(_('تاريخ البداية'), null=True, blank=True)
    completed_at = models.DateTimeField(_('تاريخ الإكمال'), null=True, blank=True)
    
    # تقدير الوقت
    estimated_hours = models.DecimalField(_('الساعات المقدرة'), max_digits=6, decimal_places=2, null=True, blank=True)
    actual_hours = models.DecimalField(_('الساعات الفعلية'), max_digits=6, decimal_places=2, null=True, blank=True)
    
    # معلومات إضافية
    notes = models.TextField(_('ملاحظات'), blank=True)
    
    # تواريخ النظام
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)
    updated_at = models.DateTimeField(_('تاريخ التحديث'), auto_now=True)
    
    class Meta:
        verbose_name = _('مهمة')
        verbose_name_plural = _('المهام')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.project.title}"
    
    def is_overdue(self):
        """التحقق من تأخر المهمة"""
        from django.utils import timezone
        return self.due_date and self.due_date < timezone.now() and self.status != self.TaskStatus.COMPLETED


class ProjectFile(models.Model):
    """
    نموذج ملفات المشروع
    """
    
    class FileType(models.TextChoices):
        DOCUMENT = 'document', _('مستند')
        IMAGE = 'image', _('صورة')
        VIDEO = 'video', _('فيديو')
        AUDIO = 'audio', _('صوت')
        ARCHIVE = 'archive', _('أرشيف')
        OTHER = 'other', _('أخرى')
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='files', verbose_name=_('المشروع'))
    task = models.ForeignKey(Task, on_delete=models.CASCADE, null=True, blank=True, related_name='files', verbose_name=_('المهمة'))
    
    name = models.CharField(_('اسم الملف'), max_length=255)
    file = models.FileField(_('الملف'), upload_to='projects/files/')
    file_type = models.CharField(_('نوع الملف'), max_length=20, choices=FileType.choices, default=FileType.DOCUMENT)
    file_size = models.PositiveIntegerField(_('حجم الملف'), help_text=_('بالبايت'))
    
    description = models.TextField(_('وصف الملف'), blank=True)
    
    # معلومات الرفع
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_('رفع بواسطة'))
    uploaded_at = models.DateTimeField(_('تاريخ الرفع'), auto_now_add=True)
    
    # إعدادات الوصول
    is_public = models.BooleanField(_('عام'), default=False, help_text=_('يمكن للعميل رؤيته'))
    
    class Meta:
        verbose_name = _('ملف مشروع')
        verbose_name_plural = _('ملفات المشاريع')
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.name} - {self.project.title}"


class ProjectComment(models.Model):
    """
    نموذج تعليقات المشروع
    """
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='comments', verbose_name=_('المشروع'))
    task = models.ForeignKey(Task, on_delete=models.CASCADE, null=True, blank=True, related_name='comments', verbose_name=_('المهمة'))
    
    author = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_('الكاتب'))
    content = models.TextField(_('المحتوى'))
    
    # إعدادات الرؤية
    is_internal = models.BooleanField(_('داخلي'), default=False, help_text=_('لا يراه العميل'))
    
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)
    updated_at = models.DateTimeField(_('تاريخ التحديث'), auto_now=True)
    
    class Meta:
        verbose_name = _('تعليق')
        verbose_name_plural = _('التعليقات')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"تعليق {self.author.get_full_name()} على {self.project.title}"
