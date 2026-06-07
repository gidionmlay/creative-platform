from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminMediaViewSet

router = DefaultRouter()
router.register(r'', AdminMediaViewSet, basename='admin-media')

urlpatterns = [
    path('', include(router.urls)),
]
