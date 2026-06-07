import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
from django.test.client import Client
from rest_framework.authtoken.models import Token
from accounts.models import Profile

admin_profile = Profile.objects.filter(role='admin').first()
if not admin_profile:
    print("No admin found")
else:
    token, _ = Token.objects.get_or_create(user=admin_profile.user)
    client = Client()
    response = client.get('/api/v1/admin/users/?page=1', HTTP_AUTHORIZATION=f'Token {token.key}')
    print("Status:", response.status_code)
    print("Response keys:", response.json().keys() if response.status_code == 200 else response.content)
