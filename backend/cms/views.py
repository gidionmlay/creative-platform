from rest_framework import viewsets, permissions, generics, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import HomepageSection, HomepageMedia, TeamMember, ServiceBentoCard, ContactMessage
from .serializers import (
    HomepageSectionSerializer, HomepageSectionListSerializer,
    HomepageMediaSerializer, TeamMemberSerializer,
    ServiceBentoCardSerializer, ContactMessageSerializer
)


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, 'profile')
            and request.user.profile.role == 'admin'
        )


# -- Public Views --

class PublicHomepageView(generics.ListAPIView):
    queryset = HomepageSection.objects.all()
    serializer_class = HomepageSectionSerializer
    permission_classes = [permissions.AllowAny]


class PublicHomepageSectionView(generics.RetrieveAPIView):
    queryset = HomepageSection.objects.all()
    serializer_class = HomepageSectionSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'section_key'


# -- Admin Views --

class AdminHomepageSectionViewSet(viewsets.ModelViewSet):
    queryset = HomepageSection.objects.all().order_by('section_key')
    serializer_class = HomepageSectionListSerializer
    permission_classes = [IsAdminUser]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return HomepageSectionSerializer
        return HomepageSectionListSerializer


class AdminHomepageMediaViewSet(viewsets.ModelViewSet):
    queryset = HomepageMedia.objects.all().order_by('sort_order')
    serializer_class = HomepageMediaSerializer
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        qs = HomepageMedia.objects.all().order_by('sort_order')
        section = self.request.query_params.get('section')
        if section:
            qs = qs.filter(section_id=section)
        return qs

    def perform_create(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        if instance.image:
            instance.image.delete(save=False)
        instance.delete()


# -- Public Team Member Views --

class PublicTeamMemberView(generics.ListAPIView):
    queryset = TeamMember.objects.filter(is_active=True).order_by('sort_order')
    serializer_class = TeamMemberSerializer
    permission_classes = [permissions.AllowAny]


# -- Admin Team Member Views --

class AdminTeamMemberViewSet(viewsets.ModelViewSet):
    queryset = TeamMember.objects.all().order_by('sort_order')
    serializer_class = TeamMemberSerializer
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]


# -- Public Service Bento Card Views --

class PublicServiceBentoCardView(generics.ListAPIView):
    queryset = ServiceBentoCard.objects.filter(is_active=True).order_by('sort_order')
    serializer_class = ServiceBentoCardSerializer
    permission_classes = [permissions.AllowAny]


# -- Admin Service Bento Card Views --

class AdminServiceBentoCardViewSet(viewsets.ModelViewSet):
    queryset = ServiceBentoCard.objects.all().order_by('sort_order')
    serializer_class = ServiceBentoCardSerializer
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]


# -- Public Contact Message Views --

class PublicContactMessageView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.AllowAny]


# -- Admin Contact Message Views --

class AdminContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all().order_by('-created_at')
    serializer_class = ContactMessageSerializer
    permission_classes = [IsAdminUser]
    http_method_names = ['get', 'patch', 'delete', 'head', 'options']

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.delete()
