from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SocialMediaAccountViewSet, PostViewSet,
    PostAnalyticsViewSet, CampaignViewSet
)

router = DefaultRouter()
router.register(r'accounts', SocialMediaAccountViewSet, basename='social-account')
router.register(r'posts', PostViewSet, basename='social-post')
router.register(r'analytics', PostAnalyticsViewSet, basename='post-analytics')
router.register(r'campaigns', CampaignViewSet, basename='campaign')

urlpatterns = [
    path('', include(router.urls)),
]

