from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from decimal import Decimal

User = get_user_model()


class Invoice(models.Model):
    """
    نموذج الفاتورة
    """
    
    class InvoiceStatus(models.TextChoices):
        DRAFT = 'draft', _('مسودة')
        SENT = 'sent', _('مرسلة')
        VIEWED = 'viewed', _('تم عرضها')
        PAID = 'paid', _('مدفوعة')
        OVERDUE = 'overdue', _('متأخرة')
        CANCELLED = 'cancelled', _('ملغية')
    
    # معلومات أساسية
    invoice_number = models.CharField(_('رقم الفاتورة'), max_length=50, unique=True)
    client = models.ForeignKey('crm.Client', on_delete=models.CASCADE, related_name='invoices', verbose_name=_('العميل'))
    project = models.ForeignKey('projects.Project', on_delete=models.SET_NULL, null=True, blank=True, related_name='invoices', verbose_name=_('المشروع'))
    
    # تواريخ مهمة
    issue_date = models.DateField(_('تاريخ الإصدار'))
    due_date = models.DateField(_('تاريخ الاستحقاق'))
    
    # المعلومات المالية
    subtotal = models.DecimalField(_('المجموع الفرعي'), max_digits=12, decimal_places=2, default=Decimal('0.00'))
    tax_rate = models.DecimalField(_('معدل الضريبة'), max_digits=5, decimal_places=2, default=Decimal('15.00'))
    tax_amount = models.DecimalField(_('مبلغ الضريبة'), max_digits=12, decimal_places=2, default=Decimal('0.00'))
    discount_amount = models.DecimalField(_('مبلغ الخصم'), max_digits=12, decimal_places=2, default=Decimal('0.00'))
    total_amount = models.DecimalField(_('المبلغ الإجمالي'), max_digits=12, decimal_places=2, default=Decimal('0.00'))
    
    # الحالة والملاحظات
    status = models.CharField(_('الحالة'), max_length=20, choices=InvoiceStatus.choices, default=InvoiceStatus.DRAFT)
    notes = models.TextField(_('ملاحظات'), blank=True)
    terms_and_conditions = models.TextField(_('الشروط والأحكام'), blank=True)
    
    # معلومات إضافية
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_invoices', verbose_name=_('أنشئت بواسطة'))
    sent_at = models.DateTimeField(_('تاريخ الإرسال'), null=True, blank=True)
    viewed_at = models.DateTimeField(_('تاريخ العرض'), null=True, blank=True)
    paid_at = models.DateTimeField(_('تاريخ الدفع'), null=True, blank=True)
    
    # تواريخ النظام
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)
    updated_at = models.DateTimeField(_('تاريخ التحديث'), auto_now=True)
    
    class Meta:
        verbose_name = _('فاتورة')
        verbose_name_plural = _('الفواتير')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"فاتورة {self.invoice_number} - {self.client.company_name}"
    
    def calculate_totals(self):
        """حساب إجماليات الفاتورة"""
        self.subtotal = sum(item.total_amount for item in self.items.all())
        self.tax_amount = (self.subtotal * self.tax_rate) / 100
        self.total_amount = self.subtotal + self.tax_amount - self.discount_amount
        self.save()
    
    def is_overdue(self):
        """التحقق من تأخر الفاتورة"""
        from django.utils import timezone
        return self.due_date < timezone.now().date() and self.status not in [self.InvoiceStatus.PAID, self.InvoiceStatus.CANCELLED]


class InvoiceItem(models.Model):
    """
    نموذج عنصر الفاتورة
    """
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items', verbose_name=_('الفاتورة'))
    
    description = models.CharField(_('الوصف'), max_length=500)
    quantity = models.DecimalField(_('الكمية'), max_digits=10, decimal_places=2, default=Decimal('1.00'))
    unit_price = models.DecimalField(_('سعر الوحدة'), max_digits=12, decimal_places=2)
    total_amount = models.DecimalField(_('المبلغ الإجمالي'), max_digits=12, decimal_places=2)
    
    # ترتيب العناصر
    order = models.PositiveIntegerField(_('الترتيب'), default=0)
    
    class Meta:
        verbose_name = _('عنصر فاتورة')
        verbose_name_plural = _('عناصر الفواتير')
        ordering = ['order']
    
    def save(self, *args, **kwargs):
        """حساب المبلغ الإجمالي تلقائياً"""
        self.total_amount = self.quantity * self.unit_price
        super().save(*args, **kwargs)
        # إعادة حساب إجماليات الفاتورة
        self.invoice.calculate_totals()
    
    def __str__(self):
        return f"{self.description} - {self.invoice.invoice_number}"


class Payment(models.Model):
    """
    نموذج الدفعة
    """
    
    class PaymentMethod(models.TextChoices):
        BANK_TRANSFER = 'bank_transfer', _('تحويل بنكي')
        CREDIT_CARD = 'credit_card', _('بطاقة ائتمان')
        CASH = 'cash', _('نقداً')
        CHECK = 'check', _('شيك')
        ONLINE_PAYMENT = 'online_payment', _('دفع إلكتروني')
        OTHER = 'other', _('أخرى')
    
    class PaymentStatus(models.TextChoices):
        PENDING = 'pending', _('معلقة')
        COMPLETED = 'completed', _('مكتملة')
        FAILED = 'failed', _('فاشلة')
        REFUNDED = 'refunded', _('مستردة')
        CANCELLED = 'cancelled', _('ملغية')
    
    # معلومات أساسية
    payment_number = models.CharField(_('رقم الدفعة'), max_length=50, unique=True)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments', verbose_name=_('الفاتورة'))
    client = models.ForeignKey('crm.Client', on_delete=models.CASCADE, related_name='payments', verbose_name=_('العميل'))
    
    # معلومات الدفع
    amount = models.DecimalField(_('المبلغ'), max_digits=12, decimal_places=2)
    payment_method = models.CharField(_('طريقة الدفع'), max_length=20, choices=PaymentMethod.choices)
    status = models.CharField(_('الحالة'), max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    
    # تواريخ
    payment_date = models.DateField(_('تاريخ الدفع'))
    processed_at = models.DateTimeField(_('تاريخ المعالجة'), null=True, blank=True)
    
    # معلومات إضافية
    reference_number = models.CharField(_('رقم المرجع'), max_length=100, blank=True)
    notes = models.TextField(_('ملاحظات'), blank=True)
    
    # معلومات المعالجة
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='processed_payments', verbose_name=_('معالج بواسطة'))
    
    # تواريخ النظام
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)
    updated_at = models.DateTimeField(_('تاريخ التحديث'), auto_now=True)
    
    class Meta:
        verbose_name = _('دفعة')
        verbose_name_plural = _('الدفعات')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"دفعة {self.payment_number} - {self.amount}"
