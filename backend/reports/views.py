from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Avg, Q
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
        """توليد تقرير أداء المشاريع"""
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
        
        # جمع بيانات المشاريع
        projects = Project.objects.all()
        if start_date:
            projects = projects.filter(start_date__gte=start_date)
        if end_date:
            projects = projects.filter(start_date__lte=end_date)
        
        # إنشاء مقاييس لكل مشروع
        for project in projects:
            # حساب نسبة الإنجاز (يمكن تحسينها بناءً على المهام الفعلية)
            completion = 50  # قيمة افتراضية
            
            # حساب الأيام المتبقية
            if project.end_date:
                days_remaining = (project.end_date - timezone.now().date()).days
            else:
                days_remaining = 0
            
            ProjectPerformanceMetric.objects.create(
                project=project,
                report=report,
                completion_percentage=completion,
                budget_used=project.budget * 0.5,  # قيمة افتراضية
                tasks_completed=0,
                tasks_total=0,
                days_remaining=days_remaining,
                is_on_track=days_remaining > 0
            )
        
        serializer = self.get_serializer(report)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def generate_sales_report(self, request):
        """توليد تقرير المبيعات"""
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
        
        # جمع بيانات المبيعات
        projects = Project.objects.all()
        if start_date:
            projects = projects.filter(start_date__gte=start_date)
        if end_date:
            projects = projects.filter(start_date__lte=end_date)
        
        # حساب المقاييس الإجمالية
        total_revenue = projects.aggregate(Sum('budget'))['budget__sum'] or 0
        total_projects = projects.count()
        completed_projects = projects.filter(status='completed').count()
        active_projects = projects.filter(status='in_progress').count()
        avg_project_value = projects.aggregate(Avg('budget'))['budget__avg'] or 0
        
        SalesMetric.objects.create(
            report=report,
            total_revenue=total_revenue,
            total_projects=total_projects,
            completed_projects=completed_projects,
            active_projects=active_projects,
            average_project_value=avg_project_value,
            period_start=start_date or timezone.now().date(),
            period_end=end_date or timezone.now().date()
        )
        
        serializer = self.get_serializer(report)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def generate_client_report(self, request):
        """توليد تقرير العملاء"""
        # إنشاء التقرير
        report = Report.objects.create(
            title=f"تقرير العملاء - {timezone.now().strftime('%Y-%m-%d')}",
            report_type=Report.ReportType.CLIENT,
            created_by=request.user
        )
        
        # جمع بيانات العملاء
        clients = Client.objects.all()
        
        for client in clients:
            projects = Project.objects.filter(client=client)
            total_projects = projects.count()
            active_projects = projects.filter(status='in_progress').count()
            completed_projects = projects.filter(status='completed').count()
            total_spent = projects.aggregate(Sum('budget'))['budget__sum'] or 0
            
            # الحصول على تاريخ آخر مشروع
            last_project = projects.order_by('-start_date').first()
            last_project_date = last_project.start_date if last_project else None
            
            ClientMetric.objects.create(
                report=report,
                client=client,
                total_projects=total_projects,
                active_projects=active_projects,
                completed_projects=completed_projects,
                total_spent=total_spent,
                satisfaction_score=8.0,  # قيمة افتراضية
                last_project_date=last_project_date
            )
        
        serializer = self.get_serializer(report)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """إحصائيات لوحة التحكم"""
        # إحصائيات المشاريع
        total_projects = Project.objects.count()
        active_projects = Project.objects.filter(status='in_progress').count()
        completed_projects = Project.objects.filter(status='completed').count()
        
        # إحصائيات العملاء
        total_clients = Client.objects.count()
        
        # إحصائيات مالية
        total_revenue = Project.objects.aggregate(Sum('budget'))['budget__sum'] or 0
        
        # مشاريع الشهر الحالي
        current_month_start = timezone.now().replace(day=1)
        monthly_projects = Project.objects.filter(
            start_date__gte=current_month_start
        ).count()
        
        return Response({
            'total_projects': total_projects,
            'active_projects': active_projects,
            'completed_projects': completed_projects,
            'total_clients': total_clients,
            'total_revenue': total_revenue,
            'monthly_projects': monthly_projects
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
