import os
import json
import tempfile
from django.contrib.auth.models import User
from django.urls import reverse
from django.test import TestCase, Client
from PIL import Image

from accounts.models import Profile
from services.models import ServiceCategory, Service, ServiceFeature, ServiceGallery
from requests.models import Request


class ServicesCMSTestCase(TestCase):

    def setUp(self):
        # Create client
        self.client = Client()
        
        # Create users
        self.admin_user = User.objects.create_user(username='admin_test', password='password123')
        self.client_user = User.objects.create_user(username='client_test', password='password123')
        
        # Ensure profiles exist and have correct roles
        Profile.objects.filter(user=self.admin_user).update(role='admin')
        Profile.objects.filter(user=self.client_user).update(role='client')
        
        # Create categories
        self.category = ServiceCategory.objects.create(name="Design", slug="design", icon="fa-image")
        
        # Create temporary images for file uploads
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

    def test_public_categories_list(self):
        url = reverse('public-category-list')
        res = self.client.get(url)
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.content)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['name'], "Design")

    def test_admin_category_management(self):
        headers = self.get_token_headers('admin_test', 'password123')
        
        # Create Category
        url = reverse('admin-service-category-list')
        data = {'name': 'Marketing', 'icon': 'fa-megaphone'}
        res = self.client.post(url, json.dumps(data), content_type='application/json', **headers)
        self.assertEqual(res.status_code, 201)
        self.assertEqual(ServiceCategory.objects.count(), 2)
        
        # Unauthorized client attempt
        client_headers = self.get_token_headers('client_test', 'password123')
        res = self.client.post(url, json.dumps(data), content_type='application/json', **client_headers)
        self.assertEqual(res.status_code, 403)

    def test_admin_service_creation_and_soft_delete(self):
        headers = self.get_token_headers('admin_test', 'password123')
        
        url = reverse('admin-service-list')
        
        # Create Service
        with open(self.temp_image, 'rb') as img:
            data = {
                'title': 'Logo Design',
                'category_id': self.category.id,
                'short_description': 'A clean minimal logo.',
                'full_description': 'Detailed logo description.',
                'base_price': '250.00',
                'discounted_price': '199.99',
                'delivery_time': '3 Days',
                'featured': 'true',
                'active': 'true',
                'thumbnail': img
            }
            res = self.client.post(url, data, **headers)
            
        self.assertEqual(res.status_code, 201)
        self.assertEqual(Service.objects.count(), 1)
        service = Service.objects.first()
        self.assertEqual(service.slug, 'logo-design')
        
        # Verify public visibility
        public_url = reverse('public-service-list')
        res = self.client.get(public_url)
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.content)
        if isinstance(data, list):
            results = data
        else:
            results = data.get('results', [])
        self.assertEqual(len(results), 1)
        
        # Soft delete service (admin DELETE)
        delete_url = reverse('admin-service-detail', args=[service.id])
        res = self.client.delete(delete_url, **headers)
        self.assertEqual(res.status_code, 204)
        
        # Verify it still exists in DB but active = False
        service.refresh_from_db()
        self.assertFalse(service.active)
        
        # Verify hidden from public list
        res = self.client.get(public_url)
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.content)
        if isinstance(data, list):
            results = data
        else:
            results = data.get('results', [])
        self.assertEqual(len(results), 0)

    def test_service_features_and_gallery(self):
        headers = self.get_token_headers('admin_test', 'password123')
        
        # Create Service
        service = Service.objects.create(
            title='Web Development',
            category=self.category,
            short_description='Clean code.',
            full_description='Modern responsive web app.',
            base_price=1000.00,
            delivery_time='7 Days',
            created_by=self.admin_user
        )
        
        # Add Feature
        feat_url = f"/api/v1/admin/services/{service.id}/features/"
        res = self.client.post(feat_url, json.dumps({'title': 'Responsive Layout'}), content_type='application/json', **headers)
        self.assertEqual(res.status_code, 201)
        self.assertEqual(ServiceFeature.objects.count(), 1)
        feat_data = json.loads(res.content)
        feature_id = feat_data['id']
        
        # Delete Feature
        del_feat_url = f"/api/v1/admin/services/{service.id}/features/{feature_id}/"
        res = self.client.delete(del_feat_url, **headers)
        self.assertEqual(res.status_code, 204)
        self.assertEqual(ServiceFeature.objects.count(), 0)
        
        # Add Gallery Image
        gal_url = f"/api/v1/admin/services/{service.id}/gallery/"
        with open(self.temp_image, 'rb') as img:
            res = self.client.post(gal_url, {'image': img}, **headers)
        self.assertEqual(res.status_code, 201)
        self.assertEqual(ServiceGallery.objects.count(), 1)
        gal_data = json.loads(res.content)
        gallery_id = gal_data['id']
        
        # Delete Gallery Image
        del_gal_url = f"/api/v1/admin/services/{service.id}/gallery/{gallery_id}/"
        res = self.client.delete(del_gal_url, **headers)
        self.assertEqual(res.status_code, 204)
        self.assertEqual(ServiceGallery.objects.count(), 0)

    def test_request_integration_with_dynamic_service(self):
        # Create active service
        service = Service.objects.create(
            title='Branding Pack',
            category=self.category,
            short_description='Complete brand identity.',
            full_description='Guidelines, typography, logos.',
            base_price=500.00,
            delivery_time='5 Days',
            active=True,
            created_by=self.admin_user
        )
        
        # Client creates request using dynamic service name
        client_headers = self.get_token_headers('client_test', 'password123')
        
        url = reverse('create-request') # API for client request submissions
        data = {
            'service': 'Branding Pack',
            'title': 'New Branding Project',
            'description': 'Need branding for my new online shop.',
            'budget': '450.00'
        }
        res = self.client.post(url, json.dumps(data), content_type='application/json', **client_headers)
        if res.status_code != 201:
            self.fail(f"FAILED integration request: {res.content}")
        self.assertEqual(res.status_code, 201)
        self.assertEqual(Request.objects.count(), 1)
        self.assertEqual(Request.objects.first().service, 'Branding Pack')
