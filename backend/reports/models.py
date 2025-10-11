from django.db import models
from django.contrib.auth import get_user_model
from projects.models import Project
from crm.models import Client

User = get_user_model()


class Report(models.Model):
    """نموذج التقرير الأساسي"""
    
    class ReportType(models.TextChoices):
        PROJECT_PERFORMANCE = 'project_performance', 'تقرير أداء المشاريع'
        SALES = 'sales', 'تقرير المبيعات'
        CLIENT = 'client', 'تقرير العملاء'
        FINANCIAL = 'financial', 'تقرير مالي'
        CUSTOM = 'custom', 'تقرير مخصص'
    
    title = models.CharField('عنوان التقرير', max_length=200)
    report_type = models.CharField('نوع التقرير', max_length=30, choices=ReportType.choices)
    description = models.TextField('وصف التقرير', blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports', verbose_name='منشئ التقرير')
    created_at = models.DateTimeField('تاريخ الإنشاء', auto_now_add=True)
    updated_at = models.DateTimeField('تاريخ التحديث', auto_now=True)
    start_date = models.DateField('تاريخ البداية', null=True, blank=True)
    end_date = models.DateField('تاريخ النهاية', null=True, blank=True)
    data = models.JSONField('بيانات التقرير', default=dict, blank=True)
    
    class Meta:
        verbose_name = 'تقرير'
        verbose_name_plural = 'التقارير'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.get_report_type_display()}"


class ProjectPerformanceMetric(models.Model):
    """مقاييس أداء المشاريع"""
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='performance_metrics', verbose_name='المشروع')
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name='project_metrics', verbose_name='التقرير')
    completion_percentage = models.DecimalField('نسبة الإنجاز', max_digits=5, decimal_places=2, default=0)
    budget_used = models.DecimalField('الميزانية المستخدمة', max_digits=12, decimal_places=2, default=0)
    tasks_completed = models.IntegerField('المهام المكتملة', default=0)
    tasks_total = models.IntegerField('إجمالي المهام', default=0)
    days_remaining = models.IntegerField('الأيام المتبقية', default=0)
    is_on_track = models.BooleanField('على المسار الصحيح', default=True)
    notes = models.TextField('ملاحظات', blank=True)
    recorded_at = models.DateTimeField('تاريخ التسجيل', auto_now_add=True)
    
    class Meta:
        verbose_name = 'مقياس أداء المشروع'
        verbose_name_plural = 'مقاييس أداء المشاريع'
        ordering = ['-recorded_at']
    
    def __str__(self):
        return f"{self.project.title} - {self.completion_percentage}%"


class SalesMetric(models.Model):
    """مقاييس المبيعات"""
    
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name='sales_metrics', verbose_name='التقرير')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='sales_metrics', verbose_name='العميل', null=True, blank=True)
    total_revenue = models.DecimalField('إجمالي الإيرادات', max_digits=12, decimal_places=2, default=0)
    total_projects = models.IntegerField('إجمالي المشاريع', default=0)
    completed_projects = models.IntegerField('المشاريع المكتملة', default=0)
    active_projects = models.IntegerField('المشاريع النشطة', default=0)
    average_project_value = models.DecimalField('متوسط قيمة المشروع', max_digits=12, decimal_places=2, default=0)
    period_start = models.DateField('بداية الفترة')
    period_end = models.DateField('نهاية الفترة')
    recorded_at = models.DateTimeField('تاريخ التسجيل', auto_now_add=True)
    
    class Meta:
        verbose_name = 'مقياس المبيعات'
        verbose_name_plural = 'مقاييس المبيعات'
        ordering = ['-recorded_at']
    
    def __str__(self):
        return f"مبيعات {self.period_start} - {self.period_end}"


class ClientMetric(models.Model):
    """مقاييس العملاء"""
    
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name='client_metrics', verbose_name='التقرير')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='client_metrics', verbose_name='العميل')
    total_projects = models.IntegerField('إجمالي المشاريع', default=0)
    active_projects = models.IntegerField('المشاريع النشطة', default=0)
    completed_projects = models.IntegerField('المشاريع المكتملة', default=0)
    total_spent = models.DecimalField('إجمالي الإنفاق', max_digits=12, decimal_places=2, default=0)
    satisfaction_score = models.DecimalField('درجة الرضا', max_digits=3, decimal_places=1, default=0, help_text='من 0 إلى 10')
    last_project_date = models.DateField('تاريخ آخر مشروع', null=True, blank=True)
    notes = models.TextField('ملاحظات', blank=True)
    recorded_at = models.DateTimeField('تاريخ التسجيل', auto_now_add=True)
    
    class Meta:
        verbose_name = 'مقياس العميل'
        verbose_name_plural = 'مقاييس العملاء'
        ordering = ['-recorded_at']
    
    def __str__(self):
        return f"{self.client.company_name} - {self.total_projects} مشاريع"

