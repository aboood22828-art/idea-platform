from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone

from .models import Category, Tag, Content, Comment, Media
from .serializers import (
    CategorySerializer, TagSerializer, ContentListSerializer,
    ContentDetailSerializer, CommentSerializer, MediaSerializer
)


class CategoryViewSet(viewsets.ModelViewSet):
    """ViewSet لإدارة التصنيفات"""
    
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']


class TagViewSet(viewsets.ModelViewSet):
    """ViewSet لإدارة العلامات"""
    
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


class ContentViewSet(viewsets.ModelViewSet):
    """ViewSet لإدارة المحتوى"""
    
    queryset = Content.objects.all()
    permission_classes = [IsAuthenticated]
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'excerpt', 'body']
    ordering_fields = ['created_at', 'published_at', 'views_count']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ContentListSerializer
        return ContentDetailSerializer
    
    def get_queryset(self):
        """تخصيص الاستعلام حسب المعاملات"""
        queryset = Content.objects.all()
        
        # فلترة حسب نوع المحتوى
        content_type = self.request.query_params.get('type', None)
        if content_type:
            queryset = queryset.filter(content_type=content_type)
        
        # فلترة حسب الحالة
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        # فلترة حسب التصنيف
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category__slug=category)
        
        # فلترة حسب العلامة
        tag = self.request.query_params.get('tag', None)
        if tag:
            queryset = queryset.filter(tags__slug=tag)
        
        return queryset
    
    def retrieve(self, request, *args, **kwargs):
        """زيادة عدد المشاهدات عند عرض المحتوى"""
        instance = self.get_object()
        instance.views_count += 1
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def publish(self, request, slug=None):
        """نشر المحتوى"""
        content = self.get_object()
        content.status = Content.Status.PUBLISHED
        content.published_at = timezone.now()
        content.save()
        serializer = self.get_serializer(content)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def archive(self, request, slug=None):
        """أرشفة المحتوى"""
        content = self.get_object()
        content.status = Content.Status.ARCHIVED
        content.save()
        serializer = self.get_serializer(content)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def published(self, request):
        """الحصول على المحتوى المنشور فقط"""
        queryset = self.get_queryset().filter(status=Content.Status.PUBLISHED)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class CommentViewSet(viewsets.ModelViewSet):
    """ViewSet لإدارة التعليقات"""
    
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at']
    
    def get_queryset(self):
        """تخصيص الاستعلام حسب المحتوى"""
        queryset = Comment.objects.all()
        content_slug = self.request.query_params.get('content', None)
        if content_slug:
            queryset = queryset.filter(content__slug=content_slug)
        return queryset
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """الموافقة على التعليق"""
        comment = self.get_object()
        comment.is_approved = True
        comment.save()
        serializer = self.get_serializer(comment)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """رفض التعليق"""
        comment = self.get_object()
        comment.is_approved = False
        comment.save()
        serializer = self.get_serializer(comment)
        return Response(serializer.data)


class MediaViewSet(viewsets.ModelViewSet):
    """ViewSet لإدارة الوسائط"""
    
    queryset = Media.objects.all()
    serializer_class = MediaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title']
    ordering_fields = ['created_at', 'file_size']
    
    def get_queryset(self):
        """تخصيص الاستعلام حسب نوع الوسائط"""
        queryset = Media.objects.all()
        media_type = self.request.query_params.get('type', None)
        if media_type:
            queryset = queryset.filter(media_type=media_type)
        return queryset
