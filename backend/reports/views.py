from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Avg, Q, F, Max, Case, When, Value, IntegerField, DecimalField, Prefetch
from django.utils import timezone
from datetime import timedelta

from .models import Report, ProjectPerformanceMetric, SalesMetric, ClientMetric
from .serializers import (
    ReportSerializer, ProjectPerformanceMetricSerializer,
    SalesMetricSerializer, ClientMetricSerializer
)
from projects.models import Project
from crm.models import Client


class ReportViewSet(viewsets.ModelViewSet):
    """ViewSet لإدارة التقارير"""
    
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """تخصيص الاستعلام حسب دور المستخدم"""
        user = self.request.user
        if user.role == 'admin' or user.role == 'employee':
            return Report.objects.all()
        return Report.objects.filter(created_by=user)
    
    @action(detail=False, methods=['post'])
    def generate_project_performance(self, request):
        """توليد تقرير أداء المشاريع مع تحسين الأداء"""
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        
        # إنشاء التقرير
        report = Report.objects.create(
            title=f"تقرير أداء المشاريع - {timezone.now().strftime('%Y-%m-%d')}",
            report_type=Report.ReportType.PROJECT_PERFORMANCE,
            created_by=request.user,
            start_date=start_date,
            end_date=end_date
        )
        
        # جمع بيانات المشاريع مع التصفية الصحيحة
        projects = Project.objects.all()
        if start_date:
            projects = projects.filter(start_date__gte=start_date)
        if end_date:
            projects = projects.filter(start_date__lte=end_date)
        
        # إنشاء مقاييس لكل مشروع باستخدام bulk_create لتحسين الأداء
        metrics_to_create = []
        current_date = timezone.now().date()
        
        for project in projects:
            # حساب الأيام المتبقية
            if project.end_date:
                days_remaining = (project.end_date - current_date).days
            else:
                days_remaining = 0
            
            # حساب نسبة الإنجاز (يمكن تحسينها بناءً على المهام الفعلية)
            # في المستقبل، يمكن استبدال هذا بمنطق حقيقي
            completion = 50  # قيمة افتراضية
            
            metrics_to_create.append(
                ProjectPerformanceMetric(
                    project=project,
                    report=report,
                    completion_percentage=completion,
                    budget_used=project.budget * 0.5,  # قيمة افتراضية
                    tasks_completed=0,
                    tasks_total=0,
                    days_remaining=days_remaining,
                    is_on_track=days_remaining > 0
                )
            )
        
        # إنشاء جميع المقاييس دفعة واحدة
        ProjectPerformanceMetric.objects.bulk_create(metrics_to_create, batch_size=100)
        
        serializer = self.get_serializer(report)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def generate_sales_report(self, request):
        """توليد تقرير المبيعات مع تحسين الأداء"""
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        
        # إنشاء التقرير
        report = Report.objects.create(
            title=f"تقرير المبيعات - {timezone.now().strftime('%Y-%m-%d')}",
            report_type=Report.ReportType.SALES,
            created_by=request.user,
            start_date=start_date,
            end_date=end_date
        )
        
        # جمع بيانات المبيعات مع التصفية الصحيحة
        projects = Project.objects.all()
        if start_date:
            projects = projects.filter(start_date__gte=start_date)
        if end_date:
            projects = projects.filter(start_date__lte=end_date)
        
        # حساب المقاييس الإجمالية باستخدام aggregate واحد
        stats = projects.aggregate(
            total_revenue=Sum('budget'),
            total_projects=Count('id'),
            completed_projects=Count(
                'id',
                filter=Q(status='completed')
            ),
            active_projects=Count(
                'id',
                filter=Q(status='in_progress')
            ),
            avg_project_value=Avg('budget')
        )
        
        SalesMetric.objects.create(
            report=report,
            total_revenue=stats['total_revenue'] or 0,
            total_projects=stats['total_projects'] or 0,
            completed_projects=stats['completed_projects'] or 0,
            active_projects=stats['active_projects'] or 0,
            average_project_value=stats['avg_project_value'] or 0,
            period_start=start_date or timezone.now().date(),
            period_end=end_date or timezone.now().date()
        )
        
        serializer = self.get_serializer(report)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def generate_client_report(self, request):
        """توليد تقرير العملاء مع تحسين الأداء"""
        # إنشاء التقرير
        report = Report.objects.create(
            title=f"تقرير العملاء - {timezone.now().strftime('%Y-%m-%d')}",
            report_type=Report.ReportType.CLIENT,
            created_by=request.user
        )
        
        # جمع بيانات العملاء باستخدام annotate لتجنب مشكلة N+1
        clients = Client.objects.annotate(
            total_projects=Count('project', distinct=True),
            active_projects=Count(
                'project',
                filter=Q(project__status='in_progress'),
                distinct=True
            ),
            completed_projects=Count(
                'project',
                filter=Q(project__status='completed'),
                distinct=True
            ),
            total_spent=Sum('project__budget'),
            last_project_date=Max('project__start_date')
        )
        
        # إنشاء مقاييس العملاء باستخدام البيانات المجمعة
        metrics_to_create = []
        for client in clients:
            metrics_to_create.append(
                ClientMetric(
                    report=report,
                    client=client,
                    total_projects=client.total_projects or 0,
                    active_projects=client.active_projects or 0,
                    completed_projects=client.completed_projects or 0,
                    total_spent=client.total_spent or 0,
                    satisfaction_score=8.0,  # يمكن تحسينها لاحقًا
                    last_project_date=client.last_project_date
                )
            )
        
        # إنشاء جميع المقاييس دفعة واحدة لتحسين الأداء
        ClientMetric.objects.bulk_create(metrics_to_create, batch_size=100)
        
        serializer = self.get_serializer(report)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """إحصائيات لوحة التحكم مع تحسين الأداء"""
        # إحصائيات مجمعة في استعلام واحد
        current_month_start = timezone.now().replace(day=1)
        
        stats = Project.objects.aggregate(
            total_projects=Count('id'),
            active_projects=Count(
                'id',
                filter=Q(status='in_progress')
            ),
            completed_projects=Count(
                'id',
                filter=Q(status='completed')
            ),
            total_revenue=Sum('budget'),
            monthly_projects=Count(
                'id',
                filter=Q(start_date__gte=current_month_start)
            )
        )
        
        total_clients = Client.objects.count()
        
        return Response({
            'total_projects': stats['total_projects'] or 0,
            'active_projects': stats['active_projects'] or 0,
            'completed_projects': stats['completed_projects'] or 0,
            'total_clients': total_clients,
            'total_revenue': stats['total_revenue'] or 0,
            'monthly_projects': stats['monthly_projects'] or 0
        })


class ProjectPerformanceMetricViewSet(viewsets.ModelViewSet):
    """ViewSet لمقاييس أداء المشاريع"""
    
    queryset = ProjectPerformanceMetric.objects.all()
    serializer_class = ProjectPerformanceMetricSerializer
    permission_classes = [IsAuthenticated]


class SalesMetricViewSet(viewsets.ModelViewSet):
    """ViewSet لمقاييس المبيعات"""
    
    queryset = SalesMetric.objects.all()
    serializer_class = SalesMetricSerializer
    permission_classes = [IsAuthenticated]


class ClientMetricViewSet(viewsets.ModelViewSet):
    """ViewSet لمقاييس العملاء"""
    
    queryset = ClientMetric.objects.all()
    serializer_class = ClientMetricSerializer
    permission_classes = [IsAuthenticated]
