from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminContactMessageViewSet

router = DefaultRouter()
router.register(r'', AdminContactMessageViewSet, basename='admin-contact-messages')

urlpatterns = [
    path('', include(router.urls)),
]
