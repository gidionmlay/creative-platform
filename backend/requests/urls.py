from django.urls import path
from .views import CreateRequestView, MyRequestsView

urlpatterns = [
    path('', CreateRequestView.as_view(), name='create-request'),
    path('my/', MyRequestsView.as_view(), name='my-requests'),
]
