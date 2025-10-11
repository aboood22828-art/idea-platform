from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ReportViewSet, ProjectPerformanceMetricViewSet,
    SalesMetricViewSet, ClientMetricViewSet
)

router = DefaultRouter()
router.register(r'reports', ReportViewSet, basename='report')
router.register(r'project-metrics', ProjectPerformanceMetricViewSet, basename='project-metric')
router.register(r'sales-metrics', SalesMetricViewSet, basename='sales-metric')
router.register(r'client-metrics', ClientMetricViewSet, basename='client-metric')

urlpatterns = [
    path('', include(router.urls)),
]

