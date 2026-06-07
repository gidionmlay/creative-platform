from django.urls import path
from .views import MyCoursesView, MarkLessonCompleteView

urlpatterns = [
    path('my-courses/', MyCoursesView.as_view(), name='student-my-courses'),
    path('lessons/<int:pk>/complete/', MarkLessonCompleteView.as_view(), name='mark-lesson-complete'),
]
