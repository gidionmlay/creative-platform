from django.urls import path
from .views import (
    AdminProjectListView, AdminProjectDetailView,
    AdminProjectStatusView, AdminProjectProgressView,
    AdminProjectMessageView, AdminProjectFileView
)

urlpatterns = [
    path('', AdminProjectListView.as_view(), name='admin-project-list'),
    path('<int:pk>/', AdminProjectDetailView.as_view(), name='admin-project-detail'),
    path('<int:pk>/status/', AdminProjectStatusView.as_view(), name='admin-project-status'),
    path('<int:pk>/progress/', AdminProjectProgressView.as_view(), name='admin-project-progress'),
    path('<int:pk>/messages/', AdminProjectMessageView.as_view(), name='admin-project-messages'),
    path('<int:pk>/files/', AdminProjectFileView.as_view(), name='admin-project-files'),
]
