from rest_framework import serializers
from django.core.exceptions import ValidationError
from .models import MediaAsset

class MediaAssetSerializer(serializers.ModelSerializer):
    uploaded_by_username = serializers.ReadOnlyField(source='uploaded_by.username')
    file_size_kb = serializers.SerializerMethodField()
    dimensions = serializers.SerializerMethodField()

    class Meta:
        model = MediaAsset
        fields = [
            'id', 'title', 'file', 'file_type', 'mime_type', 'file_size', 
            'file_size_kb', 'uploaded_by', 'uploaded_by_username', 'alt_text', 
            'folder', 'is_public', 'thumbnail', 'medium', 'dimensions',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'file_type', 'mime_type', 'file_size', 'uploaded_by', 
            'thumbnail', 'medium', 'created_at', 'updated_at'
        ]

    def validate(self, attrs):
        # Run model clean validation to catch errors before save
        instance = MediaAsset(**attrs)
        try:
            instance.clean()
        except ValidationError as e:
            raise serializers.ValidationError(
                e.message_dict if hasattr(e, 'message_dict') else {"file": e.messages}
            )
        return attrs

    def get_file_size_kb(self, obj):
        if obj.file_size:
            return round(obj.file_size / 1024, 2)
        return 0

    def get_dimensions(self, obj):
        if obj.file_type == 'image' and obj.file and obj.mime_type != 'image/svg+xml':
            try:
                from PIL import Image
                with Image.open(obj.file.path) as img:
                    return f"{img.width}x{img.height}"
            except Exception:
                return None
        return None
