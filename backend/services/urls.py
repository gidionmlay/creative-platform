from django.urls import path
from .views import PublicServiceListView, PublicServiceDetailView, PublicCategoryListView

urlpatterns = [
    path('', PublicServiceListView.as_view(), name='public-service-list'),
    path('categories/', PublicCategoryListView.as_view(), name='public-category-list'),
    path('<slug:slug>/', PublicServiceDetailView.as_view(), name='public-service-detail'),
]
