from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminServiceViewSet, AdminServiceCategoryViewSet

router = DefaultRouter()
router.register(r'categories', AdminServiceCategoryViewSet, basename='admin-service-category')
router.register(r'', AdminServiceViewSet, basename='admin-service')

urlpatterns = [
    path('', include(router.urls)),
]
