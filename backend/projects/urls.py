from django.urls import path
from .views import (
    ClientProjectListView, ClientProjectDetailView,
    ClientProjectMessageView, ClientProjectFileView,
    ClientProjectRevisionView, ClientProjectApproveView
)

urlpatterns = [
    path('my/', ClientProjectListView.as_view(), name='client-project-list'),
    path('<int:pk>/', ClientProjectDetailView.as_view(), name='client-project-detail'),
    path('<int:pk>/messages/', ClientProjectMessageView.as_view(), name='client-project-messages'),
    path('<int:pk>/files/', ClientProjectFileView.as_view(), name='client-project-files'),
    path('<int:pk>/revision/', ClientProjectRevisionView.as_view(), name='client-project-revision'),
    path('<int:pk>/approve/', ClientProjectApproveView.as_view(), name='client-project-approve'),
]
