from django.urls import path
from .views import AdminRequestListView, AdminRequestDetailView, ApproveRequestView, RejectRequestView, UpdateRequestStatusView, AddRequestNoteView

urlpatterns = [
    path('', AdminRequestListView.as_view(), name='admin-request-list'),
    path('<int:pk>/', AdminRequestDetailView.as_view(), name='admin-request-detail'),
    path('<int:pk>/approve/', ApproveRequestView.as_view(), name='admin-request-approve'),
    path('<int:pk>/reject/', RejectRequestView.as_view(), name='admin-request-reject'),
    path('<int:pk>/status/', UpdateRequestStatusView.as_view(), name='admin-request-status'),
    path('<int:pk>/notes/', AddRequestNoteView.as_view(), name='admin-request-add-note'),
]
