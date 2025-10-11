"""
URL configuration for idea_platform project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def api_root(request):
    """الصفحة الرئيسية للـ API"""
    return JsonResponse({
        'message': 'مرحباً بك في منصة أيديا المتكاملة',
        'version': '1.0.0',
        'endpoints': {
            'auth': '/api/auth/',
            'projects': '/api/projects/',
            'clients': '/api/clients/',
            'billing': '/api/billing/',
            'reports': '/api/reports/',
            'cms': '/api/cms/',
            'social-media': '/api/social-media/',
            'admin': '/admin/',
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', api_root, name='api_root'),
    path('api/auth/', include('users.urls')),
    # path('api/projects/', include('projects.urls')),
    # path('api/clients/', include('crm.urls')),
    # path('api/billing/', include('billing.urls')),
    path('api/reports/', include('reports.urls')),
    path('api/cms/', include('cms.urls')),
    path('api/social-media/', include('social_media.urls')),
]

# إضافة ملفات الوسائط في بيئة التطوير
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
