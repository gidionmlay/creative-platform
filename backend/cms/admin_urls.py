from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AdminHomepageSectionViewSet, AdminHomepageMediaViewSet,
    AdminTeamMemberViewSet, AdminServiceBentoCardViewSet
)

router = DefaultRouter()
router.register(r'sections', AdminHomepageSectionViewSet, basename='admin-cms-section')
router.register(r'media', AdminHomepageMediaViewSet, basename='admin-cms-media')
router.register(r'team', AdminTeamMemberViewSet, basename='admin-cms-team')
router.register(r'services-bento', AdminServiceBentoCardViewSet, basename='admin-cms-services-bento')

urlpatterns = [
    path('', include(router.urls)),
]
