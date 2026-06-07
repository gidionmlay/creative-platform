from django.contrib import admin
from .models import ServiceCategory, Service, ServiceFeature, ServiceGallery

@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'created_at')
    prepopulated_fields = {'slug': ('name',)}

class ServiceFeatureInline(admin.TabularInline):
    model = ServiceFeature
    extra = 1

class ServiceGalleryInline(admin.TabularInline):
    model = ServiceGallery
    extra = 1

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'base_price', 'discounted_price', 'delivery_time', 'featured', 'active', 'created_at')
    list_filter = ('category', 'featured', 'active')
    search_fields = ('title', 'short_description', 'full_description')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [ServiceFeatureInline, ServiceGalleryInline]
