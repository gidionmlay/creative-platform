from django.urls import path
from .views import CourseListView, CourseDetailView, EnrollCourseView, MyCoursesView

urlpatterns = [
    # Public
    path('', CourseListView.as_view(), name='course-list'),
    path('<int:pk>/', CourseDetailView.as_view(), name='course-detail'),
    
    # Student specific (nested under /student/ in core/urls or prefixed here, but we will route 'student/' properly)
    path('<int:pk>/enroll/', EnrollCourseView.as_view(), name='course-enroll'),
]
