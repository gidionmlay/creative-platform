from rest_framework import serializers
from .models import Course, Enrollment, Module, Lesson, LessonProgress

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'thumbnail', 'price', 'status', 'created_at']


class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), source='course', write_only=True
    )
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'course_id', 'status', 'progress', 'enrolled_at', 'user_id', 'user_name']
        read_only_fields = ['id', 'status', 'progress', 'enrolled_at', 'user_id', 'user_name']

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username


class LessonSerializer(serializers.ModelSerializer):
    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ['id', 'title', 'description', 'video_url', 'duration', 'order', 'is_preview', 'is_completed']

    def get_is_completed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # We can check if LessonProgress exists for this user and is_completed=True
            # Note: This could cause N+1 query issues if not prefetched, but for small scale it's ok
            progress = obj.progress_records.filter(user=request.user).first()
            return progress.is_completed if progress else False
        return False

    def to_representation(self, instance):
        # Mask video_url if user not enrolled and it's not a preview
        data = super().to_representation(instance)
        request = self.context.get('request')
        
        is_enrolled = False
        if request and request.user.is_authenticated:
            is_enrolled = Enrollment.objects.filter(user=request.user, course=instance.module.course).exists()

        if not instance.is_preview and not is_enrolled:
            data['video_url'] = None  # Hide video URL
            
        return data


class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = ['id', 'title', 'order', 'lessons']


class AdminModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = ['id', 'course', 'title', 'order']


class AdminLessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'module', 'title', 'description', 'video_url', 'duration', 'order', 'is_preview']


class CourseDetailSerializer(serializers.ModelSerializer):
    modules = ModuleSerializer(many=True, read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'thumbnail', 'price', 'status', 'created_at', 'is_enrolled', 'progress', 'modules']

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Enrollment.objects.filter(user=request.user, course=obj).exists()
        return False

    def get_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            enrollment = Enrollment.objects.filter(user=request.user, course=obj).first()
            return enrollment.progress if enrollment else 0
        return 0
