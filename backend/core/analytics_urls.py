from django.urls import path
from .analytics_views import (
    AdminAnalyticsOverviewView,
    AdminUserGrowthAnalyticsView,
    AdminRequestFlowAnalyticsView,
    AdminRecentActivityView
)

urlpatterns = [
    path('overview/', AdminAnalyticsOverviewView.as_view(), name='admin-analytics-overview'),
    path('user-growth/', AdminUserGrowthAnalyticsView.as_view(), name='admin-analytics-user-growth'),
    path('request-flow/', AdminRequestFlowAnalyticsView.as_view(), name='admin-analytics-request-flow'),
    path('recent-activity/', AdminRecentActivityView.as_view(), name='admin-analytics-recent-activity'),
]
