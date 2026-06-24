"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
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
from .auth_views import CustomLoginView, register_user, get_user_profile

urlpatterns = [
    path('admin/', admin.site.urls),

    # Authentication
    path('api/v1/auth/login/', CustomLoginView.as_view(), name='api-login'),
    path('api/v1/auth/register/', register_user, name='api-register'),
    path('api/v1/auth/me/', get_user_profile, name='api-me'),

    path('api/v1/requests/', include('requests.urls')),
    path('api/v1/admin/requests/', include('requests.admin_urls')),
    path('api/v1/projects/', include('projects.urls')),
    path('api/v1/admin/projects/', include('projects.admin_urls')),
    path('api/v1/notifications/', include('notifications.urls')),
    
    # Courses
    path('api/v1/courses/', include('courses.urls')),
    path('api/v1/student/', include('courses.student_urls')),
    path('api/v1/admin/courses/', include('courses.admin_urls')),
    
    # Analytics
    path('api/v1/admin/analytics/', include('core.analytics_urls')),
    
    # Users
    path('api/v1/admin/users/', include('accounts.urls')),

    # Services
    path('api/v1/services/', include('services.urls')),
    path('api/v1/admin/services/', include('services.admin_urls')),

    # Media Library
    path('api/v1/admin/media/', include('media_library.admin_urls')),

    # Content CMS
    path('api/v1/content/homepage/', include('cms.urls')),
    path('api/v1/admin/content/homepage/', include('cms.admin_urls')),

    # Contact Messages
    path('api/v1/content/contact-messages/', include('cms.contact_urls')),
    path('api/v1/admin/content/contact-messages/', include('cms.admin_contact_urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
