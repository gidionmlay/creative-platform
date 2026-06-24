from django.urls import path
from .views import PublicContactMessageView

urlpatterns = [
    path('', PublicContactMessageView.as_view(), name='public-contact-messages'),
]
