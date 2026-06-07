from django.urls import path
from .views import (
    AdminUserListView,
    AdminUserDetailView,
    AdminUserSuspendView,
    AdminUserActivateView,
    AdminUserChangeRoleView,
    AdminUserDeleteView,
    AdminUserResetPasswordView,
    AdminUserAnalyticsView,
    AdminUserActivityView,
)

urlpatterns = [
    # Analytics overview
    path('analytics/', AdminUserAnalyticsView.as_view(), name='admin-users-analytics'),

    # User list & detail
    path('',           AdminUserListView.as_view(),   name='admin-users-list'),
    path('<int:pk>/',  AdminUserDetailView.as_view(), name='admin-users-detail'),

    # User actions
    path('<int:pk>/suspend/',        AdminUserSuspendView.as_view(),       name='admin-users-suspend'),
    path('<int:pk>/activate/',       AdminUserActivateView.as_view(),      name='admin-users-activate'),
    path('<int:pk>/role/',           AdminUserChangeRoleView.as_view(),    name='admin-users-role'),
    path('<int:pk>/delete/',         AdminUserDeleteView.as_view(),        name='admin-users-delete'),
    path('<int:pk>/reset-password/', AdminUserResetPasswordView.as_view(), name='admin-users-reset-password'),
    path('<int:pk>/activity/',       AdminUserActivityView.as_view(),      name='admin-users-activity'),
]
