from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Course, Enrollment, Module, Lesson, LessonProgress
from .serializers import CourseSerializer, EnrollmentSerializer, CourseDetailSerializer, LessonSerializer, ModuleSerializer
from core.permissions import IsStudentUser, IsAdminUserRole
from django.contrib.auth.models import User

# --- PUBLIC APIS ---

class CourseListView(generics.ListAPIView):
    """List all available courses"""
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.AllowAny]


class CourseDetailView(generics.RetrieveAPIView):
    """Get specific course details (nested)"""
    queryset = Course.objects.all()
    serializer_class = CourseDetailSerializer
    permission_classes = [permissions.AllowAny]

# --- STUDENT APIS ---

class MarkLessonCompleteView(generics.GenericAPIView):
    """Mark a lesson as complete for the enrolled student"""
    permission_classes = [IsStudentUser]

    def post(self, request, *args, **kwargs):
        lesson_id = self.kwargs.get('pk')
        lesson = get_object_or_404(Lesson, pk=lesson_id)
        
        # Ensure user is enrolled in the course this lesson belongs to
        course = lesson.module.course
        enrollment = Enrollment.objects.filter(user=request.user, course=course).first()
        if not enrollment:
            return Response({"detail": "Not enrolled in this course."}, status=status.HTTP_403_FORBIDDEN)
            
        # Create or update progress
        progress, created = LessonProgress.objects.get_or_create(
            user=request.user, 
            lesson=lesson,
            defaults={'is_completed': True}
        )
        
        if not created and not progress.is_completed:
            progress.is_completed = True
            progress.save()

        # Recalculate course progress
        total_lessons = Lesson.objects.filter(module__course=course).count()
        if total_lessons > 0:
            completed_lessons = LessonProgress.objects.filter(
                user=request.user, 
                lesson__module__course=course, 
                is_completed=True
            ).count()
            
            new_progress = int((completed_lessons / total_lessons) * 100)
            if enrollment.progress != new_progress:
                enrollment.progress = new_progress
                if new_progress == 100:
                    enrollment.status = 'completed'
                enrollment.save()

        return Response({"detail": "Lesson marked as complete", "progress": enrollment.progress}, status=status.HTTP_200_OK)


# --- STUDENT APIS ---

class EnrollCourseView(generics.CreateAPIView):
    """Enroll a student in a course"""
    permission_classes = [IsStudentUser]
    serializer_class = EnrollmentSerializer

    def create(self, request, *args, **kwargs):
        course_id = self.kwargs.get('pk')
        course = get_object_or_404(Course, pk=course_id)
        
        # Check if already enrolled
        if Enrollment.objects.filter(user=request.user, course=course).exists():
            return Response({"detail": "Already enrolled in this course."}, status=status.HTTP_400_BAD_REQUEST)

        enrollment = Enrollment.objects.create(user=request.user, course=course)
        
        # Trigger notification
        from notifications.models import Notification
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync

        notif = Notification.objects.create(
            user=request.user,
            title="Course Enrolled",
            message=f"You have successfully enrolled in '{course.title}'.",
            type="system"
        )

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"user_{request.user.id}",
            {
                "type": "send_notification",
                "data": {
                    "id": notif.id,
                    "title": notif.title,
                    "message": notif.message,
                    "type": notif.type,
                    "created_at": notif.created_at.isoformat(),
                }
            }
        )

        serializer = self.get_serializer(enrollment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MyCoursesView(generics.ListAPIView):
    """List courses the student is enrolled in"""
    permission_classes = [IsStudentUser]
    serializer_class = EnrollmentSerializer

    def get_queryset(self):
        return Enrollment.objects.filter(user=self.request.user)


# --- ADMIN APIS ---

class AdminCourseListView(generics.ListCreateAPIView):
    """Admin full control over courses"""
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAdminUserRole]


class AdminCourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin course update/delete"""
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAdminUserRole]


class AdminModuleListCreateView(generics.ListCreateAPIView):
    """Admin create modules for a course"""
    permission_classes = [IsAdminUserRole]
    from .serializers import AdminModuleSerializer
    serializer_class = AdminModuleSerializer

    def get_queryset(self):
        return Module.objects.filter(course_id=self.kwargs['course_id'])

    def perform_create(self, serializer):
        serializer.save(course_id=self.kwargs['course_id'])


class AdminModuleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin update/delete module"""
    queryset = Module.objects.all()
    permission_classes = [IsAdminUserRole]
    from .serializers import AdminModuleSerializer
    serializer_class = AdminModuleSerializer


class AdminLessonListCreateView(generics.ListCreateAPIView):
    """Admin create lessons for a module"""
    permission_classes = [IsAdminUserRole]
    from .serializers import AdminLessonSerializer
    serializer_class = AdminLessonSerializer

    def get_queryset(self):
        return Lesson.objects.filter(module_id=self.kwargs['module_id'])

    def perform_create(self, serializer):
        serializer.save(module_id=self.kwargs['module_id'])


class AdminLessonDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin update/delete lesson"""
    queryset = Lesson.objects.all()
    permission_classes = [IsAdminUserRole]
    from .serializers import AdminLessonSerializer
    serializer_class = AdminLessonSerializer


class AdminModuleReorderView(generics.GenericAPIView):
    """Reorder modules bulk update"""
    permission_classes = [IsAdminUserRole]

    def patch(self, request, *args, **kwargs):
        # Expects: [{'id': 1, 'order': 0}, {'id': 2, 'order': 1}]
        data = request.data
        if not isinstance(data, list):
            return Response({"detail": "Expected a list of objects."}, status=status.HTTP_400_BAD_REQUEST)
        
        for item in data:
            Module.objects.filter(id=item.get('id')).update(order=item.get('order', 0))
            
        return Response({"detail": "Modules reordered successfully."}, status=status.HTTP_200_OK)


class AdminLessonReorderView(generics.GenericAPIView):
    """Reorder lessons bulk update"""
    permission_classes = [IsAdminUserRole]

    def patch(self, request, *args, **kwargs):
        data = request.data
        if not isinstance(data, list):
            return Response({"detail": "Expected a list of objects."}, status=status.HTTP_400_BAD_REQUEST)
        
        for item in data:
            Lesson.objects.filter(id=item.get('id')).update(order=item.get('order', 0))
            
        return Response({"detail": "Lessons reordered successfully."}, status=status.HTTP_200_OK)


class AdminEnrollmentListView(generics.ListAPIView):
    """Admin view all enrollments"""
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAdminUserRole]

    def get_queryset(self):
        queryset = super().get_queryset()
        course_id = self.request.query_params.get('course_id')
        student_id = self.request.query_params.get('student_id')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        if student_id:
            queryset = queryset.filter(user_id=student_id)
        return queryset
