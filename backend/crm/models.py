from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model

User = get_user_model()


class Lead(models.Model):
    """
    نموذج العميل المحتمل
    """
    
    class LeadStatus(models.TextChoices):
        NEW = 'new', _('جديد')
        CONTACTED = 'contacted', _('تم التواصل')
        QUALIFIED = 'qualified', _('مؤهل')
        PROPOSAL_SENT = 'proposal_sent', _('تم إرسال العرض')
        NEGOTIATION = 'negotiation', _('تفاوض')
        WON = 'won', _('تم الفوز')
        LOST = 'lost', _('خسارة')
        CANCELLED = 'cancelled', _('ملغي')
    
    class LeadSource(models.TextChoices):
        WEBSITE = 'website', _('الموقع الإلكتروني')
        SOCIAL_MEDIA = 'social_media', _('وسائل التواصل الاجتماعي')
        REFERRAL = 'referral', _('إحالة')
        COLD_CALL = 'cold_call', _('اتصال بارد')
        EMAIL_CAMPAIGN = 'email_campaign', _('حملة بريد إلكتروني')
        EVENT = 'event', _('فعالية')
        ADVERTISEMENT = 'advertisement', _('إعلان')
        OTHER = 'other', _('أخرى')
    
    # معلومات أساسية
    first_name = models.CharField(_('الاسم الأول'), max_length=100)
    last_name = models.CharField(_('الاسم الأخير'), max_length=100)
    email = models.EmailField(_('البريد الإلكتروني'))
    phone = models.CharField(_('رقم الهاتف'), max_length=20, blank=True)
    
    # معلومات الشركة
    company_name = models.CharField(_('اسم الشركة'), max_length=200, blank=True)
    job_title = models.CharField(_('المسمى الوظيفي'), max_length=100, blank=True)
    company_website = models.URLField(_('موقع الشركة'), blank=True)
    company_size = models.CharField(_('حجم الشركة'), max_length=50, blank=True)
    industry = models.CharField(_('الصناعة'), max_length=100, blank=True)
    
    # معلومات العميل المحتمل
    status = models.CharField(_('الحالة'), max_length=20, choices=LeadStatus.choices, default=LeadStatus.NEW)
    source = models.CharField(_('المصدر'), max_length=20, choices=LeadSource.choices)
    
    # تفاصيل الاهتمام
    interested_services = models.TextField(_('الخدمات المهتم بها'), blank=True)
    budget_range = models.CharField(_('نطاق الميزانية'), max_length=100, blank=True)
    timeline = models.CharField(_('الجدول الزمني'), max_length=100, blank=True)
    
    # المعلومات الإضافية
    notes = models.TextField(_('ملاحظات'), blank=True)
    
    # التعيين
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_leads', verbose_name=_('مكلف بالمتابعة'))
    
    # تواريخ مهمة
    last_contact_date = models.DateTimeField(_('تاريخ آخر تواصل'), null=True, blank=True)
    next_follow_up = models.DateTimeField(_('موعد المتابعة التالية'), null=True, blank=True)
    
    # تواريخ النظام
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)
    updated_at = models.DateTimeField(_('تاريخ التحديث'), auto_now=True)
    
    class Meta:
        verbose_name = _('عميل محتمل')
        verbose_name_plural = _('العملاء المحتملون')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.company_name}"
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"


class Client(models.Model):
    """
    نموذج العميل (تحويل من Lead أو إنشاء مباشر)
    """
    
    class ClientStatus(models.TextChoices):
        ACTIVE = 'active', _('نشط')
        INACTIVE = 'inactive', _('غير نشط')
        SUSPENDED = 'suspended', _('معلق')
        TERMINATED = 'terminated', _('منتهي')
    
    # ربط بالمستخدم (إذا كان له حساب)
    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='client_profile')
    
    # معلومات أساسية
    first_name = models.CharField(_('الاسم الأول'), max_length=100)
    last_name = models.CharField(_('الاسم الأخير'), max_length=100)
    email = models.EmailField(_('البريد الإلكتروني'))
    phone = models.CharField(_('رقم الهاتف'), max_length=20, blank=True)
    
    # معلومات الشركة
    company_name = models.CharField(_('اسم الشركة'), max_length=200)
    company_registration = models.CharField(_('رقم السجل التجاري'), max_length=100, blank=True)
    tax_number = models.CharField(_('الرقم الضريبي'), max_length=100, blank=True)
    company_website = models.URLField(_('موقع الشركة'), blank=True)
    industry = models.CharField(_('الصناعة'), max_length=100, blank=True)
    
    # معلومات الاتصال
    address = models.TextField(_('العنوان'), blank=True)
    city = models.CharField(_('المدينة'), max_length=100, blank=True)
    country = models.CharField(_('الدولة'), max_length=100, blank=True)
    postal_code = models.CharField(_('الرمز البريدي'), max_length=20, blank=True)
    
    # معلومات العميل
    status = models.CharField(_('الحالة'), max_length=20, choices=ClientStatus.choices, default=ClientStatus.ACTIVE)
    client_since = models.DateField(_('عميل منذ'), auto_now_add=True)
    
    # معلومات مالية
    credit_limit = models.DecimalField(_('الحد الائتماني'), max_digits=12, decimal_places=2, null=True, blank=True)
    payment_terms = models.CharField(_('شروط الدفع'), max_length=100, blank=True)
    
    # معلومات إضافية
    notes = models.TextField(_('ملاحظات'), blank=True)
    
    # التعيين
    account_manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_clients', verbose_name=_('مدير الحساب'))
    
    # تواريخ النظام
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)
    updated_at = models.DateTimeField(_('تاريخ التحديث'), auto_now=True)
    
    class Meta:
        verbose_name = _('عميل')
        verbose_name_plural = _('العملاء')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.company_name} - {self.get_full_name()}"
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"
