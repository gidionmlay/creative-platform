from django.urls import path
from .views import (
    PublicHomepageView, PublicHomepageSectionView,
    PublicTeamMemberView, PublicServiceBentoCardView
)

urlpatterns = [
    path('', PublicHomepageView.as_view(), name='public-homepage'),
    path('team/', PublicTeamMemberView.as_view(), name='public-team-members'),
    path('services/bento/', PublicServiceBentoCardView.as_view(), name='public-services-bento'),
    path('<slug:section_key>/', PublicHomepageSectionView.as_view(), name='public-homepage-section'),
]
