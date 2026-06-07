from rest_framework import serializers
from .models import Project, ProjectMessage, ProjectFile, ProjectTimeline
from django.contrib.auth.models import User
import os

class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']

class ProjectMessageSerializer(serializers.ModelSerializer):
    sender_details = UserBasicSerializer(source='sender', read_only=True)

    class Meta:
        model = ProjectMessage
        fields = ['id', 'project', 'sender', 'sender_details', 'message', 'created_at']
        read_only_fields = ['sender', 'created_at']

class ProjectFileSerializer(serializers.ModelSerializer):
    uploaded_by_details = UserBasicSerializer(source='uploaded_by', read_only=True)
    filename = serializers.SerializerMethodField()

    class Meta:
        model = ProjectFile
        fields = ['id', 'project', 'uploaded_by', 'uploaded_by_details', 'file', 'filename', 'file_type', 'file_size', 'is_deliverable', 'created_at']
        read_only_fields = ['uploaded_by', 'file_size', 'created_at']
        
    def get_filename(self, obj):
        if obj.file:
            return os.path.basename(obj.file.name)
        return None
        
    def validate_file(self, value):
        allowed_extensions = ['.png', '.jpg', '.jpeg', '.svg', '.pdf', '.docx', '.pptx', '.zip', '.rar']
        ext = os.path.splitext(value.name)[1].lower()
        if ext not in allowed_extensions:
            raise serializers.ValidationError(f"File extension {ext} is not allowed. Allowed types: {', '.join(allowed_extensions)}")
        
        # Max size 50MB (adjust as needed, though requirement said validate size, didn't specify. Assuming 50MB)
        if value.size > 50 * 1024 * 1024:
            raise serializers.ValidationError("File size must be under 50MB.")
            
        return value

class ProjectTimelineSerializer(serializers.ModelSerializer):
    actor_details = UserBasicSerializer(source='actor', read_only=True)

    class Meta:
        model = ProjectTimeline
        fields = ['id', 'project', 'action', 'actor', 'actor_details', 'metadata', 'created_at']
        read_only_fields = ['created_at']

class ProjectListSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.get_full_name', read_only=True)
    service_title = serializers.CharField(source='service.title', read_only=True)
    
    class Meta:
        model = Project
        fields = ['id', 'title', 'client', 'client_name', 'service', 'service_title', 'status', 'progress', 'due_date', 'created_at']

class ProjectDetailSerializer(serializers.ModelSerializer):
    client_details = UserBasicSerializer(source='client', read_only=True)
    service_title = serializers.CharField(source='service.title', read_only=True)
    messages = ProjectMessageSerializer(many=True, read_only=True)
    files = ProjectFileSerializer(many=True, read_only=True)
    timeline = ProjectTimelineSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = [
            'id', 'request', 'client', 'client_details', 'service', 'service_title',
            'title', 'description', 'status', 'progress', 'due_date',
            'messages', 'files', 'timeline',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['request', 'client', 'service', 'title', 'description', 'created_at', 'updated_at']

class ProjectCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['request', 'client', 'service', 'title', 'description', 'due_date']
