from rest_framework import serializers
from .models import Request, RequestAttachment, RequestActivity, RequestNote
from services.models import Service
import os


ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.svg', '.pdf', '.docx']
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


class RequestAttachmentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    filename = serializers.SerializerMethodField()
    file_type = serializers.SerializerMethodField()

    class Meta:
        model = RequestAttachment
        fields = ['id', 'file', 'file_url', 'filename', 'file_type', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None

    def get_filename(self, obj):
        if obj.file:
            return os.path.basename(obj.file.name)
        return None

    def get_file_type(self, obj):
        if obj.file:
            ext = os.path.splitext(obj.file.name)[1].lower()
            if ext in ['.png', '.jpg', '.jpeg', '.svg']:
                return 'image'
            elif ext == '.pdf':
                return 'pdf'
            elif ext == '.docx':
                return 'document'
        return 'unknown'


class RequestActivitySerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = RequestActivity
        fields = ['id', 'action', 'message', 'actor', 'actor_name', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_actor_name(self, obj):
        if obj.actor:
            return f"{obj.actor.first_name} {obj.actor.last_name}".strip() or obj.actor.username
        return "System"


class RequestNoteSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = RequestNote
        fields = ['id', 'note', 'internal', 'user', 'user_name', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_user_name(self, obj):
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username
        return "System"


class ServiceMiniSerializer(serializers.ModelSerializer):
    """Lightweight service serializer for request responses."""
    category_name = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = ['id', 'title', 'slug', 'base_price', 'discounted_price',
                  'delivery_time', 'thumbnail', 'category_name']

    def get_category_name(self, obj):
        return obj.category.name if obj.category else None


class RequestSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField(read_only=True)
    client_email = serializers.SerializerMethodField(read_only=True)
    service_details = ServiceMiniSerializer(source='service', read_only=True)
    service_title = serializers.SerializerMethodField(read_only=True)
    attachments = RequestAttachmentSerializer(many=True, read_only=True)
    attachment_count = serializers.SerializerMethodField(read_only=True)
    timeline = RequestActivitySerializer(many=True, read_only=True)
    notes = RequestNoteSerializer(many=True, read_only=True)

    class Meta:
        model = Request
        fields = [
            'id', 'client', 'client_name', 'client_email',
            'service', 'service_details', 'service_title',
            'title', 'description', 'budget', 'quantity', 'status',
            'delivery_date', 'admin_note',
            'attachments', 'attachment_count',
            'timeline', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'client', 'client_name', 'client_email',
            'service_details', 'service_title',
            'status', 'attachments', 'attachment_count',
            'timeline', 'notes',
            'created_at', 'updated_at'
        ]

    def get_client_name(self, obj):
        u = obj.client
        full = f"{u.first_name} {u.last_name}".strip()
        return full or u.username

    def get_client_email(self, obj):
        return obj.client.email

    def get_service_title(self, obj):
        return obj.service.title if obj.service else None

    def get_attachment_count(self, obj):
        return obj.attachments.count()

    def validate_service(self, value):
        if not value.active:
            raise serializers.ValidationError("This service is currently inactive and cannot be requested.")
        return value

    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")
        return value

    def validate_description(self, value):
        if not value.strip():
            raise serializers.ValidationError("Description cannot be empty.")
        return value


class RequestCreateSerializer(serializers.Serializer):
    """
    Handles multipart/form-data request creation with file attachments.
    """
    service = serializers.IntegerField()
    title = serializers.CharField(max_length=255)
    description = serializers.CharField()
    budget = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)
    quantity = serializers.IntegerField(min_value=1, default=1, required=False)

    def validate_service(self, value):
        try:
            service = Service.objects.get(id=value, active=True)
        except Service.DoesNotExist:
            raise serializers.ValidationError("Invalid or inactive service.")
        return service

    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")
        return value

    def validate_description(self, value):
        if not value.strip():
            raise serializers.ValidationError("Description cannot be empty.")
        return value

    def validate(self, attrs):
        # Validate uploaded files from context
        request = self.context.get('request')
        if request:
            files = request.FILES.getlist('attachments')
            for f in files:
                ext = os.path.splitext(f.name)[1].lower()
                if ext not in ALLOWED_EXTENSIONS:
                    raise serializers.ValidationError(
                        f"File '{f.name}' has an unsupported type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
                    )
                if f.size > MAX_FILE_SIZE:
                    raise serializers.ValidationError(
                        f"File '{f.name}' exceeds the 10MB size limit."
                    )
        return attrs
