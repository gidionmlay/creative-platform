import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
from django.test.client import Client
from rest_framework.authtoken.models import Token
from accounts.models import Profile

admin_profile = Profile.objects.filter(role='admin').first()
if admin_profile:
    token, _ = Token.objects.get_or_create(user=admin_profile.user)
    try:
        from core.analytics_views import AdminRecentActivityView
        from django.test import RequestFactory
        factory = RequestFactory()
        request = factory.get('/api/v1/admin/analytics/recent-activity/')
        request.user = admin_profile.user
        view = AdminRecentActivityView.as_view()
        response = view(request)
        print("Status:", response.status_code)
    except Exception as e:
        import traceback
        traceback.print_exc()
