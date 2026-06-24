from rest_framework import serializers
from .models import HomepageSection, HomepageMedia, TeamMember, ServiceBentoCard, ContactMessage


class HomepageMediaSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = HomepageMedia
        fields = [
            'id', 'section', 'image', 'image_url',
            'alt_text', 'sort_order', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class HomepageSectionSerializer(serializers.ModelSerializer):
    media = HomepageMediaSerializer(many=True, read_only=True)
    media_count = serializers.SerializerMethodField()

    class Meta:
        model = HomepageSection
        fields = [
            'id', 'section_key', 'section_name', 'description',
            'media', 'media_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_media_count(self, obj):
        return obj.media.filter(is_active=True).count()


class HomepageSectionListSerializer(serializers.ModelSerializer):
    media_count = serializers.SerializerMethodField()
    latest_image = serializers.SerializerMethodField()

    class Meta:
        model = HomepageSection
        fields = [
            'id', 'section_key', 'section_name', 'description',
            'media_count', 'latest_image', 'updated_at'
        ]

    def get_media_count(self, obj):
        return obj.media.filter(is_active=True).count()

    def get_latest_image(self, obj):
        media = obj.media.filter(is_active=True).order_by('-updated_at').first()
        if media and media.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(media.image.url)
            return media.image.url
        return None


class TeamMemberSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = TeamMember
        fields = [
            'id', 'name', 'role', 'photo', 'photo_url',
            'facebook_url', 'twitter_url', 'instagram_url', 'linkedin_url',
            'sort_order', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_photo_url(self, obj):
        if obj.photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.photo.url)
            return obj.photo.url
        return None


class TeamMemberListSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = [
            'id', 'name', 'role', 'photo_url',
            'facebook_url', 'twitter_url', 'instagram_url', 'linkedin_url',
            'sort_order', 'is_active', 'created_at', 'updated_at'
        ]

    photo_url = serializers.SerializerMethodField()

    def get_photo_url(self, obj):
        if obj.photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.photo.url)
            return obj.photo.url
        return None


class ServiceBentoCardSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ServiceBentoCard
        fields = [
            'id', 'title', 'image', 'image_url',
            'description', 'link_anchor',
            'sort_order', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = [
            'id', 'name', 'phone', 'email', 'message',
            'is_read', 'created_at'
        ]
        read_only_fields = ['is_read', 'created_at']
