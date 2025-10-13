from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Sum, Q
from .models import Invoice, InvoiceItem, Payment
from .serializers import (
    InvoiceSerializer, InvoiceCreateUpdateSerializer,
    InvoiceItemSerializer, PaymentSerializer
)


class InvoiceViewSet(viewsets.ModelViewSet):
    """
    ViewSet لإدارة الفواتير
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Invoice.objects.select_related('client', 'project', 'created_by').prefetch_related('items', 'payments')
        
        # فلترة حسب الحالة
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # فلترة حسب العميل
        client_id = self.request.query_params.get('client', None)
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        
        # فلترة حسب المشروع
        project_id = self.request.query_params.get('project', None)
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        # فلترة حسب التاريخ
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        if start_date:
            queryset = queryset.filter(issue_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(issue_date__lte=end_date)
        
        return queryset
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return InvoiceCreateUpdateSerializer
        return InvoiceSerializer
    
    @action(detail=True, methods=['post'])
    def send(self, request, pk=None):
        """إرسال الفاتورة للعميل"""
        invoice = self.get_object()
        
        if invoice.status == Invoice.InvoiceStatus.DRAFT:
            invoice.status = Invoice.InvoiceStatus.SENT
            invoice.sent_at = timezone.now()
            invoice.save()
            
            # هنا يمكن إضافة منطق إرسال البريد الإلكتروني
            
            return Response({
                'message': 'تم إرسال الفاتورة بنجاح',
                'invoice': InvoiceSerializer(invoice).data
            })
        
        return Response({
            'error': 'لا يمكن إرسال الفاتورة في هذه الحالة'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def mark_as_paid(self, request, pk=None):
        """تحديد الفاتورة كمدفوعة"""
        invoice = self.get_object()
        
        if invoice.status != Invoice.InvoiceStatus.PAID:
            invoice.status = Invoice.InvoiceStatus.PAID
            invoice.paid_at = timezone.now()
            invoice.save()
            
            return Response({
                'message': 'تم تحديد الفاتورة كمدفوعة',
                'invoice': InvoiceSerializer(invoice).data
            })
        
        return Response({
            'error': 'الفاتورة مدفوعة بالفعل'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """إلغاء الفاتورة"""
        invoice = self.get_object()
        
        if invoice.status not in [Invoice.InvoiceStatus.PAID, Invoice.InvoiceStatus.CANCELLED]:
            invoice.status = Invoice.InvoiceStatus.CANCELLED
            invoice.save()
            
            return Response({
                'message': 'تم إلغاء الفاتورة',
                'invoice': InvoiceSerializer(invoice).data
            })
        
        return Response({
            'error': 'لا يمكن إلغاء الفاتورة في هذه الحالة'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """إحصائيات الفواتير"""
        queryset = self.get_queryset()
        
        total_invoices = queryset.count()
        total_amount = queryset.aggregate(total=Sum('total_amount'))['total'] or 0
        
        paid_invoices = queryset.filter(status=Invoice.InvoiceStatus.PAID)
        paid_amount = paid_invoices.aggregate(total=Sum('total_amount'))['total'] or 0
        
        pending_invoices = queryset.filter(
            status__in=[Invoice.InvoiceStatus.SENT, Invoice.InvoiceStatus.VIEWED]
        )
        pending_amount = pending_invoices.aggregate(total=Sum('total_amount'))['total'] or 0
        
        overdue_invoices = queryset.filter(
            due_date__lt=timezone.now().date(),
            status__in=[Invoice.InvoiceStatus.SENT, Invoice.InvoiceStatus.VIEWED]
        )
        overdue_amount = overdue_invoices.aggregate(total=Sum('total_amount'))['total'] or 0
        
        return Response({
            'total_invoices': total_invoices,
            'total_amount': float(total_amount),
            'paid_invoices': paid_invoices.count(),
            'paid_amount': float(paid_amount),
            'pending_invoices': pending_invoices.count(),
            'pending_amount': float(pending_amount),
            'overdue_invoices': overdue_invoices.count(),
            'overdue_amount': float(overdue_amount),
        })


class PaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet لإدارة المدفوعات
    """
    queryset = Payment.objects.select_related('invoice', 'client', 'processed_by').all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # فلترة حسب الحالة
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # فلترة حسب الفاتورة
        invoice_id = self.request.query_params.get('invoice', None)
        if invoice_id:
            queryset = queryset.filter(invoice_id=invoice_id)
        
        # فلترة حسب العميل
        client_id = self.request.query_params.get('client', None)
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        
        # فلترة حسب التاريخ
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        if start_date:
            queryset = queryset.filter(payment_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(payment_date__lte=end_date)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        """معالجة الدفعة"""
        payment = self.get_object()
        
        if payment.status == Payment.PaymentStatus.PENDING:
            payment.status = Payment.PaymentStatus.COMPLETED
            payment.processed_at = timezone.now()
            payment.processed_by = request.user
            payment.save()
            
            # التحقق من دفع الفاتورة بالكامل
            invoice = payment.invoice
            total_payments = invoice.payments.filter(
                status=Payment.PaymentStatus.COMPLETED
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            if total_payments >= invoice.total_amount:
                invoice.status = Invoice.InvoiceStatus.PAID
                invoice.paid_at = timezone.now()
                invoice.save()
            
            return Response({
                'message': 'تمت معالجة الدفعة بنجاح',
                'payment': PaymentSerializer(payment).data
            })
        
        return Response({
            'error': 'لا يمكن معالجة الدفعة في هذه الحالة'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def refund(self, request, pk=None):
        """استرداد الدفعة"""
        payment = self.get_object()
        
        if payment.status == Payment.PaymentStatus.COMPLETED:
            payment.status = Payment.PaymentStatus.REFUNDED
            payment.save()
            
            # تحديث حالة الفاتورة
            invoice = payment.invoice
            if invoice.status == Invoice.InvoiceStatus.PAID:
                invoice.status = Invoice.InvoiceStatus.SENT
                invoice.paid_at = None
                invoice.save()
            
            return Response({
                'message': 'تم استرداد الدفعة بنجاح',
                'payment': PaymentSerializer(payment).data
            })
        
        return Response({
            'error': 'لا يمكن استرداد الدفعة في هذه الحالة'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """إحصائيات المدفوعات"""
        queryset = self.get_queryset()
        
        total_payments = queryset.count()
        total_amount = queryset.aggregate(total=Sum('amount'))['total'] or 0
        
        completed_payments = queryset.filter(status=Payment.PaymentStatus.COMPLETED)
        completed_amount = completed_payments.aggregate(total=Sum('amount'))['total'] or 0
        
        pending_payments = queryset.filter(status=Payment.PaymentStatus.PENDING)
        pending_amount = pending_payments.aggregate(total=Sum('amount'))['total'] or 0
        
        return Response({
            'total_payments': total_payments,
            'total_amount': float(total_amount),
            'completed_payments': completed_payments.count(),
            'completed_amount': float(completed_amount),
            'pending_payments': pending_payments.count(),
            'pending_amount': float(pending_amount),
        })

