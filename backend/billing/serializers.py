from rest_framework import serializers
from .models import Invoice, InvoiceItem, Payment
from crm.models import Client
from projects.models import Project


class InvoiceItemSerializer(serializers.ModelSerializer):
    """
    Serializer لعناصر الفاتورة
    """
    class Meta:
        model = InvoiceItem
        fields = ['id', 'description', 'quantity', 'unit_price', 'total_amount', 'order']
        read_only_fields = ['total_amount']


class InvoiceSerializer(serializers.ModelSerializer):
    """
    Serializer للفواتير
    """
    items = InvoiceItemSerializer(many=True, read_only=True)
    client_name = serializers.CharField(source='client.company_name', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True, allow_null=True)
    created_by_name = serializers.SerializerMethodField()
    is_overdue = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'client', 'client_name', 'project', 'project_name',
            'issue_date', 'due_date', 'subtotal', 'tax_rate', 'tax_amount',
            'discount_amount', 'total_amount', 'status', 'notes', 'terms_and_conditions',
            'created_by', 'created_by_name', 'sent_at', 'viewed_at', 'paid_at',
            'created_at', 'updated_at', 'items', 'is_overdue'
        ]
        read_only_fields = ['invoice_number', 'created_by', 'created_at', 'updated_at', 
                           'sent_at', 'viewed_at', 'paid_at', 'subtotal', 'tax_amount', 
                           'total_amount']
    
    def get_created_by_name(self, obj):
        return f"{obj.created_by.first_name} {obj.created_by.last_name}"
    
    def create(self, validated_data):
        # توليد رقم فاتورة تلقائي
        from django.utils import timezone
        year = timezone.now().year
        last_invoice = Invoice.objects.filter(invoice_number__startswith=f'INV-{year}').order_by('-invoice_number').first()
        
        if last_invoice:
            last_number = int(last_invoice.invoice_number.split('-')[-1])
            new_number = last_number + 1
        else:
            new_number = 1
        
        validated_data['invoice_number'] = f'INV-{year}-{new_number:05d}'
        validated_data['created_by'] = self.context['request'].user
        
        return super().create(validated_data)


class InvoiceCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer لإنشاء وتحديث الفواتير مع العناصر
    """
    items = InvoiceItemSerializer(many=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'client', 'project', 'issue_date', 'due_date', 'tax_rate',
            'discount_amount', 'status', 'notes', 'terms_and_conditions', 'items'
        ]
    
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        
        # توليد رقم فاتورة تلقائي
        from django.utils import timezone
        year = timezone.now().year
        last_invoice = Invoice.objects.filter(invoice_number__startswith=f'INV-{year}').order_by('-invoice_number').first()
        
        if last_invoice:
            last_number = int(last_invoice.invoice_number.split('-')[-1])
            new_number = last_number + 1
        else:
            new_number = 1
        
        validated_data['invoice_number'] = f'INV-{year}-{new_number:05d}'
        validated_data['created_by'] = self.context['request'].user
        
        invoice = Invoice.objects.create(**validated_data)
        
        # إنشاء عناصر الفاتورة
        for item_data in items_data:
            InvoiceItem.objects.create(invoice=invoice, **item_data)
        
        invoice.calculate_totals()
        return invoice
    
    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        
        # تحديث الفاتورة
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # تحديث العناصر إذا تم توفيرها
        if items_data is not None:
            # حذف العناصر القديمة
            instance.items.all().delete()
            
            # إنشاء العناصر الجديدة
            for item_data in items_data:
                InvoiceItem.objects.create(invoice=instance, **item_data)
        
        instance.calculate_totals()
        return instance


class PaymentSerializer(serializers.ModelSerializer):
    """
    Serializer للمدفوعات
    """
    invoice_number = serializers.CharField(source='invoice.invoice_number', read_only=True)
    client_name = serializers.CharField(source='client.company_name', read_only=True)
    processed_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = [
            'id', 'payment_number', 'invoice', 'invoice_number', 'client', 'client_name',
            'amount', 'payment_method', 'status', 'payment_date', 'processed_at',
            'reference_number', 'notes', 'processed_by', 'processed_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['payment_number', 'processed_by', 'processed_at', 
                           'created_at', 'updated_at']
    
    def get_processed_by_name(self, obj):
        if obj.processed_by:
            return f"{obj.processed_by.first_name} {obj.processed_by.last_name}"
        return None
    
    def create(self, validated_data):
        # توليد رقم دفعة تلقائي
        from django.utils import timezone
        year = timezone.now().year
        last_payment = Payment.objects.filter(payment_number__startswith=f'PAY-{year}').order_by('-payment_number').first()
        
        if last_payment:
            last_number = int(last_payment.payment_number.split('-')[-1])
            new_number = last_number + 1
        else:
            new_number = 1
        
        validated_data['payment_number'] = f'PAY-{year}-{new_number:05d}'
        
        # تعيين العميل من الفاتورة إذا لم يتم توفيره
        if 'client' not in validated_data:
            validated_data['client'] = validated_data['invoice'].client
        
        return super().create(validated_data)

