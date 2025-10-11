from rest_framework import serializers
from .models import Report, ProjectPerformanceMetric, SalesMetric, ClientMetric


class ProjectPerformanceMetricSerializer(serializers.ModelSerializer):
    """Serializer لمقاييس أداء المشاريع"""
    
    project_name = serializers.CharField(source='project.title', read_only=True)
    
    class Meta:
        model = ProjectPerformanceMetric
        fields = [
            'id', 'project', 'project_name', 'completion_percentage', 
            'budget_used', 'tasks_completed', 'tasks_total', 
            'days_remaining', 'is_on_track', 'notes', 'recorded_at'
        ]
        read_only_fields = ['id', 'recorded_at']


class SalesMetricSerializer(serializers.ModelSerializer):
    """Serializer لمقاييس المبيعات"""
    
    client_name = serializers.CharField(source='client.company_name', read_only=True, allow_null=True)
    
    class Meta:
        model = SalesMetric
        fields = [
            'id', 'client', 'client_name', 'total_revenue', 
            'total_projects', 'completed_projects', 'active_projects',
            'average_project_value', 'period_start', 'period_end', 'recorded_at'
        ]
        read_only_fields = ['id', 'recorded_at']


class ClientMetricSerializer(serializers.ModelSerializer):
    """Serializer لمقاييس العملاء"""
    
    client_name = serializers.CharField(source='client.company_name', read_only=True)
    
    class Meta:
        model = ClientMetric
        fields = [
            'id', 'client', 'client_name', 'total_projects', 
            'active_projects', 'completed_projects', 'total_spent',
            'satisfaction_score', 'last_project_date', 'notes', 'recorded_at'
        ]
        read_only_fields = ['id', 'recorded_at']


class ReportSerializer(serializers.ModelSerializer):
    """Serializer للتقارير"""
    
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    project_metrics = ProjectPerformanceMetricSerializer(many=True, read_only=True)
    sales_metrics = SalesMetricSerializer(many=True, read_only=True)
    client_metrics = ClientMetricSerializer(many=True, read_only=True)
    
    class Meta:
        model = Report
        fields = [
            'id', 'title', 'report_type', 'description', 
            'created_by', 'created_by_name', 'created_at', 'updated_at',
            'start_date', 'end_date', 'data',
            'project_metrics', 'sales_metrics', 'client_metrics'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

