from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from .models import ServiceCategory, Service, ServiceFeature, ServiceGallery
from .serializers import (
    ServiceCategorySerializer, ServiceSerializer, 
    ServiceFeatureSerializer, ServiceGallerySerializer
)

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and hasattr(request.user, 'profile') and request.user.profile.role == 'admin')

# PUBLIC
class PublicCategoryListView(generics.ListAPIView):
    queryset = ServiceCategory.objects.all().order_by('name')
    serializer_class = ServiceCategorySerializer
    permission_classes = [permissions.AllowAny]

class PublicServiceListView(generics.ListAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Service.objects.filter(active=True)
        category = self.request.query_params.get('category')
        featured = self.request.query_params.get('featured')
        search = self.request.query_params.get('search')
        
        if category:
            queryset = queryset.filter(category__slug=category)
        if featured:
            if featured.lower() == 'true':
                queryset = queryset.filter(featured=True)
            elif featured.lower() == 'false':
                queryset = queryset.filter(featured=False)
        if search:
            queryset = queryset.filter(title__icontains=search)
            
        return queryset

class PublicServiceDetailView(generics.RetrieveAPIView):
    queryset = Service.objects.filter(active=True)
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

# ADMIN
class AdminServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all().order_by('-created_at')
    serializer_class = ServiceSerializer
    permission_classes = [IsAdminUser]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_destroy(self, instance):
        instance.active = False
        instance.save()

    @action(detail=True, methods=['post'])
    def gallery(self, request, pk=None):
        service = self.get_object()
        serializer = ServiceGallerySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(service=service)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def features(self, request, pk=None):
        service = self.get_object()
        serializer = ServiceFeatureSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(service=service)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=True, methods=['delete'], url_path='features/(?P<feature_id>[^/.]+)')
    def delete_feature(self, request, pk=None, feature_id=None):
        service = self.get_object()
        try:
            feature = ServiceFeature.objects.get(pk=feature_id, service=service)
            feature.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ServiceFeature.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
            
    @action(detail=True, methods=['delete'], url_path='gallery/(?P<gallery_id>[^/.]+)')
    def delete_gallery(self, request, pk=None, gallery_id=None):
        service = self.get_object()
        try:
            gallery = ServiceGallery.objects.get(pk=gallery_id, service=service)
            gallery.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ServiceGallery.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

class AdminServiceCategoryViewSet(viewsets.ModelViewSet):
    queryset = ServiceCategory.objects.all().order_by('name')
    serializer_class = ServiceCategorySerializer
    permission_classes = [IsAdminUser]
