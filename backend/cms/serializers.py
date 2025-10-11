from rest_framework import serializers
from .models import Category, Tag, Content, Comment, Media


class CategorySerializer(serializers.ModelSerializer):
    """Serializer للتصنيفات"""
    
    contents_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'contents_count', 'created_at']
        read_only_fields = ['id', 'slug', 'created_at']
    
    def get_contents_count(self, obj):
        return obj.contents.count()


class TagSerializer(serializers.ModelSerializer):
    """Serializer للعلامات"""
    
    contents_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'contents_count', 'created_at']
        read_only_fields = ['id', 'slug', 'created_at']
    
    def get_contents_count(self, obj):
        return obj.contents.count()


class CommentSerializer(serializers.ModelSerializer):
    """Serializer للتعليقات"""
    
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'content', 'author', 'author_name', 'body', 'is_approved', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class ContentListSerializer(serializers.ModelSerializer):
    """Serializer لقائمة المحتوى (عرض مختصر)"""
    
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True, allow_null=True)
    tags_list = TagSerializer(source='tags', many=True, read_only=True)
    comments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Content
        fields = [
            'id', 'title', 'slug', 'content_type', 'excerpt', 
            'featured_image', 'status', 'author', 'author_name',
            'category', 'category_name', 'tags_list', 'views_count',
            'comments_count', 'published_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'author', 'views_count', 'created_at', 'updated_at']
    
    def get_comments_count(self, obj):
        return obj.comments.filter(is_approved=True).count()


class ContentDetailSerializer(serializers.ModelSerializer):
    """Serializer لتفاصيل المحتوى الكاملة"""
    
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True, allow_null=True)
    tags_list = TagSerializer(source='tags', many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Content
        fields = [
            'id', 'title', 'slug', 'content_type', 'excerpt', 'body',
            'featured_image', 'status', 'author', 'author_name',
            'category', 'category_name', 'tags', 'tags_list',
            'views_count', 'published_at', 'created_at', 'updated_at',
            'meta_title', 'meta_description', 'comments'
        ]
        read_only_fields = ['id', 'slug', 'author', 'views_count', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        validated_data['author'] = self.context['request'].user
        content = Content.objects.create(**validated_data)
        content.tags.set(tags_data)
        return content
    
    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if tags_data is not None:
            instance.tags.set(tags_data)
        
        return instance


class MediaSerializer(serializers.ModelSerializer):
    """Serializer للوسائط"""
    
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    
    class Meta:
        model = Media
        fields = ['id', 'title', 'file_url', 'media_type', 'file_size', 'uploaded_by', 'uploaded_by_name', 'created_at']
        read_only_fields = ['id', 'uploaded_by', 'created_at']
    
    def create(self, validated_data):
        validated_data['uploaded_by'] = self.context['request'].user
        return super().create(validated_data)

