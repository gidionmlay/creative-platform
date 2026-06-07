import os
from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from .models import MediaAsset
from .serializers import MediaAssetSerializer

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and hasattr(request.user, 'profile') and request.user.profile.role == 'admin')

class MediaPagination(PageNumberPagination):
    page_size = 24
    page_size_query_param = 'page_size'
    max_page_size = 100

class AdminMediaViewSet(viewsets.ModelViewSet):
    serializer_class = MediaAssetSerializer
    permission_classes = [IsAdminUser]
    pagination_class = MediaPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'alt_text', 'file']

    def get_queryset(self):
        queryset = MediaAsset.objects.all()
        
        # Filters
        folder = self.request.query_params.get('folder')
        file_type = self.request.query_params.get('file_type')
        
        if folder:
            queryset = queryset.filter(folder=folder)
        if file_type:
            queryset = queryset.filter(file_type=file_type)
            
        return queryset

    def perform_create(self, serializer):
        folder = self.request.data.get('folder', 'general')
        serializer.save(uploaded_by=self.request.user, folder=folder)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Safety checks
        try:
            from services.models import Service, ServiceGallery
            if Service.objects.filter(thumbnail_asset=instance).exists():
                return Response(
                    {"detail": "Cannot delete this asset. It is currently used as a thumbnail in one or more services."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if ServiceGallery.objects.filter(image_asset=instance).exists():
                return Response(
                    {"detail": "Cannot delete this asset. It is currently used in a service gallery."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (ImportError, RuntimeError) as e:
            # Catch import errors if services app is not fully loaded
            pass

        # Delete physical files
        try:
            if instance.file and os.path.isfile(instance.file.path):
                os.remove(instance.file.path)
            if instance.thumbnail and os.path.isfile(instance.thumbnail.path):
                os.remove(instance.thumbnail.path)
            if instance.medium and os.path.isfile(instance.medium.path):
                os.remove(instance.medium.path)
        except Exception as e:
            # Log any OS filesystem errors silently to prevent API crash
            print(f"Error removing physical files: {e}")

        return super().destroy(request, *args, **kwargs)
