from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from .models import SocialMediaAccount, Post, PostAnalytics, Campaign
from .serializers import (
    SocialMediaAccountSerializer, PostSerializer,
    PostAnalyticsSerializer, CampaignSerializer
)


class SocialMediaAccountViewSet(viewsets.ModelViewSet):
    """ViewSet لإدارة حسابات وسائل التواصل"""
    
    queryset = SocialMediaAccount.objects.all()
    serializer_class = SocialMediaAccountSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """عرض حسابات المستخدم الحالي فقط"""
        return SocialMediaAccount.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """تفعيل الحساب"""
        account = self.get_object()
        account.is_active = True
        account.save()
        serializer = self.get_serializer(account)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """تعطيل الحساب"""
        account = self.get_object()
        account.is_active = False
        account.save()
        serializer = self.get_serializer(account)
        return Response(serializer.data)


class PostViewSet(viewsets.ModelViewSet):
    """ViewSet لإدارة المنشورات"""
    
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """تخصيص الاستعلام"""
        queryset = Post.objects.filter(created_by=self.request.user)
        
        # فلترة حسب الحساب
        account_id = self.request.query_params.get('account', None)
        if account_id:
            queryset = queryset.filter(account_id=account_id)
        
        # فلترة حسب الحالة
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """نشر المنشور فورًا"""
        post = self.get_object()
        
        # هنا يمكن إضافة منطق النشر الفعلي إلى المنصة
        # حاليًا سنقوم بتحديث الحالة فقط
        
        post.status = Post.Status.PUBLISHED
        post.published_at = timezone.now()
        post.post_id = f"post_{post.id}_{timezone.now().timestamp()}"
        post.save()
        
        serializer = self.get_serializer(post)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def schedule(self, request, pk=None):
        """جدولة المنشور"""
        post = self.get_object()
        scheduled_at = request.data.get('scheduled_at')
        
        if not scheduled_at:
            return Response(
                {'error': 'يجب تحديد موعد النشر'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        post.status = Post.Status.SCHEDULED
        post.scheduled_at = scheduled_at
        post.save()
        
        serializer = self.get_serializer(post)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def scheduled(self, request):
        """الحصول على المنشورات المجدولة"""
        queryset = self.get_queryset().filter(status=Post.Status.SCHEDULED)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class PostAnalyticsViewSet(viewsets.ModelViewSet):
    """ViewSet لإدارة تحليلات المنشورات"""
    
    queryset = PostAnalytics.objects.all()
    serializer_class = PostAnalyticsSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """تخصيص الاستعلام"""
        queryset = PostAnalytics.objects.filter(post__created_by=self.request.user)
        
        # فلترة حسب المنشور
        post_id = self.request.query_params.get('post', None)
        if post_id:
            queryset = queryset.filter(post_id=post_id)
        
        return queryset


class CampaignViewSet(viewsets.ModelViewSet):
    """ViewSet لإدارة الحملات"""
    
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """عرض حملات المستخدم الحالي فقط"""
        return Campaign.objects.filter(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """تفعيل الحملة"""
        campaign = self.get_object()
        campaign.status = Campaign.Status.ACTIVE
        campaign.save()
        serializer = self.get_serializer(campaign)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def pause(self, request, pk=None):
        """إيقاف الحملة مؤقتًا"""
        campaign = self.get_object()
        campaign.status = Campaign.Status.PAUSED
        campaign.save()
        serializer = self.get_serializer(campaign)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """إكمال الحملة"""
        campaign = self.get_object()
        campaign.status = Campaign.Status.COMPLETED
        campaign.save()
        serializer = self.get_serializer(campaign)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_post(self, request, pk=None):
        """إضافة منشور إلى الحملة"""
        campaign = self.get_object()
        post_id = request.data.get('post_id')
        
        if not post_id:
            return Response(
                {'error': 'يجب تحديد معرف المنشور'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            post = Post.objects.get(id=post_id, created_by=request.user)
            campaign.posts.add(post)
            serializer = self.get_serializer(campaign)
            return Response(serializer.data)
        except Post.DoesNotExist:
            return Response(
                {'error': 'المنشور غير موجود'},
                status=status.HTTP_404_NOT_FOUND
            )
