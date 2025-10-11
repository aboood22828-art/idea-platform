from rest_framework import serializers
from .models import SocialMediaAccount, Post, PostAnalytics, Campaign


class SocialMediaAccountSerializer(serializers.ModelSerializer):
    """Serializer لحسابات وسائل التواصل"""
    
    posts_count = serializers.SerializerMethodField()
    
    class Meta:
        model = SocialMediaAccount
        fields = [
            'id', 'user', 'platform', 'account_name', 'account_id',
            'is_active', 'posts_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_posts_count(self, obj):
        return obj.posts.count()
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class PostAnalyticsSerializer(serializers.ModelSerializer):
    """Serializer لتحليلات المنشورات"""
    
    class Meta:
        model = PostAnalytics
        fields = [
            'id', 'post', 'likes_count', 'comments_count', 'shares_count',
            'views_count', 'reach', 'engagement_rate', 'recorded_at'
        ]
        read_only_fields = ['id', 'recorded_at']


class PostSerializer(serializers.ModelSerializer):
    """Serializer للمنشورات"""
    
    account_name = serializers.CharField(source='account.account_name', read_only=True)
    platform = serializers.CharField(source='account.get_platform_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    analytics = PostAnalyticsSerializer(many=True, read_only=True)
    
    class Meta:
        model = Post
        fields = [
            'id', 'account', 'account_name', 'platform', 'created_by',
            'created_by_name', 'content', 'media_urls', 'status',
            'scheduled_at', 'published_at', 'post_id', 'error_message',
            'analytics', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'post_id', 'published_at', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class CampaignSerializer(serializers.ModelSerializer):
    """Serializer للحملات"""
    
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    accounts_list = SocialMediaAccountSerializer(source='accounts', many=True, read_only=True)
    posts_list = PostSerializer(source='posts', many=True, read_only=True)
    posts_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Campaign
        fields = [
            'id', 'name', 'description', 'created_by', 'created_by_name',
            'accounts', 'accounts_list', 'posts', 'posts_list', 'posts_count',
            'status', 'start_date', 'end_date', 'budget',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
    
    def get_posts_count(self, obj):
        return obj.posts.count()
    
    def create(self, validated_data):
        accounts_data = validated_data.pop('accounts', [])
        posts_data = validated_data.pop('posts', [])
        validated_data['created_by'] = self.context['request'].user
        campaign = Campaign.objects.create(**validated_data)
        campaign.accounts.set(accounts_data)
        campaign.posts.set(posts_data)
        return campaign
    
    def update(self, instance, validated_data):
        accounts_data = validated_data.pop('accounts', None)
        posts_data = validated_data.pop('posts', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if accounts_data is not None:
            instance.accounts.set(accounts_data)
        if posts_data is not None:
            instance.posts.set(posts_data)
        
        return instance

