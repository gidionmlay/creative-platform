from rest_framework import serializers
from .models import ServiceCategory, Service, ServiceFeature, ServiceGallery
from media_library.serializers import MediaAssetSerializer

class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = '__all__'

class ServiceFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceFeature
        fields = ['id', 'title', 'created_at']

class ServiceGallerySerializer(serializers.ModelSerializer):
    image_asset_details = MediaAssetSerializer(source='image_asset', read_only=True)

    class Meta:
        model = ServiceGallery
        fields = ['id', 'image', 'image_asset', 'image_asset_details', 'created_at']

class ServiceSerializer(serializers.ModelSerializer):
    category = ServiceCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=ServiceCategory.objects.all(), source='category', write_only=True
    )
    features = ServiceFeatureSerializer(many=True, read_only=True)
    gallery = ServiceGallerySerializer(many=True, read_only=True)
    thumbnail_asset_details = MediaAssetSerializer(source='thumbnail_asset', read_only=True)

    class Meta:
        model = Service
        fields = [
            'id', 'title', 'slug', 'short_description', 'full_description',
            'thumbnail', 'thumbnail_asset', 'thumbnail_asset_details',
            'base_price', 'discounted_price', 'delivery_time',
            'featured', 'active', 'category', 'category_id', 'features', 'gallery',
            'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'slug']

