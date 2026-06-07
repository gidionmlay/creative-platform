from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify

class ServiceCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Service(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    short_description = models.CharField(max_length=255)
    full_description = models.TextField()
    thumbnail = models.ImageField(upload_to='services/thumbnails/', null=True, blank=True)
    thumbnail_asset = models.ForeignKey('media_library.MediaAsset', on_delete=models.SET_NULL, null=True, blank=True, related_name='services_thumbnails')
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    discounted_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    delivery_time = models.CharField(max_length=100)
    featured = models.BooleanField(default=False)
    active = models.BooleanField(default=True)
    category = models.ForeignKey(ServiceCategory, on_delete=models.CASCADE, related_name='services')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_services')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class ServiceFeature(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='features')
    title = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class ServiceGallery(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='gallery')
    image = models.ImageField(upload_to='services/gallery/', null=True, blank=True)
    image_asset = models.ForeignKey('media_library.MediaAsset', on_delete=models.SET_NULL, null=True, blank=True, related_name='services_galleries')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Gallery image for {self.service.title}"

