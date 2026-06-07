from django.urls import path
from .views import (
    AdminCourseListView, AdminCourseDetailView,
    AdminModuleListCreateView, AdminModuleDetailView,
    AdminLessonListCreateView, AdminLessonDetailView,
    AdminModuleReorderView, AdminLessonReorderView,
    AdminEnrollmentListView
)

urlpatterns = [
    # Courses
    path('', AdminCourseListView.as_view(), name='admin-course-list'),
    path('<int:pk>/', AdminCourseDetailView.as_view(), name='admin-course-detail'),
    
    # Reorder Endpoints (Must be above <int:pk> catch-alls to avoid clashing)
    path('modules/reorder/', AdminModuleReorderView.as_view(), name='admin-module-reorder'),
    path('lessons/reorder/', AdminLessonReorderView.as_view(), name='admin-lesson-reorder'),

    # Modules
    path('<int:course_id>/modules/', AdminModuleListCreateView.as_view(), name='admin-module-list-create'),
    path('modules/<int:pk>/', AdminModuleDetailView.as_view(), name='admin-module-detail'),

    # Lessons
    path('modules/<int:module_id>/lessons/', AdminLessonListCreateView.as_view(), name='admin-lesson-list-create'),
    path('lessons/<int:pk>/', AdminLessonDetailView.as_view(), name='admin-lesson-detail'),
    
    # Enrollments
    path('enrollments/', AdminEnrollmentListView.as_view(), name='admin-enrollments'),
]
