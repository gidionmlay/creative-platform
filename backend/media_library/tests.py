import os
import json
import tempfile
from django.contrib.auth.models import User
from django.urls import reverse
from django.test import TestCase, Client
from PIL import Image

from accounts.models import Profile
from services.models import ServiceCategory, Service
from media_library.models import MediaAsset


class MediaLibraryTestCase(TestCase):

    def setUp(self):
        self.client = Client()
        
        # Create users
        self.admin_user = User.objects.create_user(username='admin_test', password='password123')
        self.client_user = User.objects.create_user(username='client_test', password='password123')
        
        # Set roles
        Profile.objects.filter(user=self.admin_user).update(role='admin')
        Profile.objects.filter(user=self.client_user).update(role='client')
        
        self.temp_image = self.create_test_image()

    def tearDown(self):
        if os.path.exists(self.temp_image):
            os.remove(self.temp_image)

    def create_test_image(self):
        image = Image.new('RGB', (100, 100))
        tmp_file = tempfile.NamedTemporaryFile(suffix='.jpg', delete=False)
        image.save(tmp_file, 'JPEG')
        tmp_file.close()
        return tmp_file.name

    def get_token_headers(self, username, password):
        url = reverse('api-login')
        res = self.client.post(url, json.dumps({'identifier': username, 'password': password}), content_type='application/json')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.content)
        return {'HTTP_AUTHORIZATION': 'Bearer ' + data['key']}

    def test_unauthorized_upload(self):
        url = reverse('admin-media-list')
        with open(self.temp_image, 'rb') as img:
            res = self.client.post(url, {'file': img, 'folder': 'services'})
        # Should fail as unauthenticated/client
        self.assertEqual(res.status_code, 401)

        client_headers = self.get_token_headers('client_test', 'password123')
        with open(self.temp_image, 'rb') as img:
            res = self.client.post(url, {'file': img, 'folder': 'services'}, **client_headers)
        # Should fail as 403 Forbidden for clients
        self.assertEqual(res.status_code, 403)

    def test_admin_upload_and_validation(self):
        headers = self.get_token_headers('admin_test', 'password123')
        url = reverse('admin-media-list')
        
        # Valid Upload
        with open(self.temp_image, 'rb') as img:
            res = self.client.post(url, {'file': img, 'folder': 'services'}, **headers)
        self.assertEqual(res.status_code, 201)
        data = json.loads(res.content)
        self.assertEqual(data['file_type'], 'image')
        self.assertEqual(data['folder'], 'services')
        self.assertIsNotNone(data['thumbnail'])
        self.assertIsNotNone(data['medium'])
        
        asset_id = data['id']
        
        # Invalid Extension Upload
        bad_file = tempfile.NamedTemporaryFile(suffix='.exe', delete=False)
        bad_file.write(b"fake executable code")
        bad_file.close()
        
        try:
            with open(bad_file.name, 'rb') as f:
                res = self.client.post(url, {'file': f, 'folder': 'general'}, **headers)
            # Should fail validation
            self.assertEqual(res.status_code, 400)
        finally:
            os.remove(bad_file.name)

    def test_safe_deletion_checks(self):
        headers = self.get_token_headers('admin_test', 'password123')
        
        # Create MediaAsset
        with open(self.temp_image, 'rb') as img:
            res = self.client.post(reverse('admin-media-list'), {'file': img, 'folder': 'services'}, **headers)
        self.assertEqual(res.status_code, 201)
        asset_data = json.loads(res.content)
        asset = MediaAsset.objects.get(id=asset_data['id'])
        
        # Create category and service linked to this asset
        cat = ServiceCategory.objects.create(name="Design", slug="design")
        service = Service.objects.create(
            title="Premium Branding",
            category=cat,
            short_description="Logo design",
            full_description="Brand book design",
            base_price=300,
            delivery_time="3 Days",
            thumbnail_asset=asset,
            created_by=self.admin_user
        )
        
        # Try to delete asset
        delete_url = reverse('admin-media-detail', args=[asset.id])
        res = self.client.delete(delete_url, **headers)
        self.assertEqual(res.status_code, 400)
        self.assertIn("Cannot delete this asset. It is currently used", json.loads(res.content)['detail'])
        
        # Remove reference
        service.thumbnail_asset = None
        service.save()
        
        # Delete should now succeed
        res = self.client.delete(delete_url, **headers)
        self.assertEqual(res.status_code, 204)
        self.assertFalse(MediaAsset.objects.filter(id=asset.id).exists())
