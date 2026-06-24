from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from core.utils import success_response, error_response
from core.permissions import IsAdminUserRole, IsClientUser
from .models import Project, ProjectMessage, ProjectFile, ProjectTimeline
from .serializers import (
    ProjectListSerializer, ProjectDetailSerializer, ProjectCreateSerializer,
    ProjectMessageSerializer, ProjectFileSerializer, ProjectTimelineSerializer
)

class AdminProjectListView(generics.ListCreateAPIView):
    serializer_class = ProjectListSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]

    def get_queryset(self):
        queryset = Project.objects.select_related('client', 'service').all()
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return success_response(
            data=serializer.data,
            message="Projects fetched"
        )

    def create(self, request, *args, **kwargs):
        # Admin can manually create projects
        serializer = ProjectCreateSerializer(data=request.data)
        if serializer.is_valid():
            project = serializer.save(status='IN_PROGRESS')
            from projects.models import ProjectTimeline
            ProjectTimeline.objects.create(
                project=project,
                action="Project manually created by Admin",
                actor=request.user
            )
            return success_response(
                data=ProjectDetailSerializer(project).data,
                message="Project created successfully",
                status_code=status.HTTP_201_CREATED
            )
        return error_response("Validation failed", errors=serializer.errors)

class AdminProjectDetailView(generics.RetrieveUpdateAPIView):
    queryset = Project.objects.select_related('client', 'service').all()
    serializer_class = ProjectDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return success_response(data=serializer.data)

class AdminProjectStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]

    def patch(self, request, pk):
        project = get_object_or_404(Project, pk=pk)
        new_status = request.data.get('status')
        if new_status not in dict(Project.STATUS_CHOICES):
            return error_response("Invalid status")
        
        project.status = new_status
        project.save()
        return success_response(ProjectDetailSerializer(project).data, "Status updated")

class AdminProjectProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]

    def patch(self, request, pk):
        project = get_object_or_404(Project, pk=pk)
        try:
            progress = int(request.data.get('progress', 0))
            if not (0 <= progress <= 100):
                raise ValueError
        except ValueError:
            return error_response("Progress must be an integer between 0 and 100")
            
        project.progress = progress
        project.save()
        
        from projects.models import ProjectTimeline
        ProjectTimeline.objects.create(
            project=project,
            action=f"Progress updated to {progress}%",
            actor=request.user
        )
        return success_response(ProjectDetailSerializer(project).data, "Progress updated")

class AdminProjectMessageView(generics.CreateAPIView):
    serializer_class = ProjectMessageSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]

    def perform_create(self, serializer):
        project = get_object_or_404(Project, pk=self.kwargs['pk'])
        serializer.save(project=project, sender=self.request.user)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return success_response(response.data, "Message sent")

class AdminProjectFileView(generics.CreateAPIView):
    serializer_class = ProjectFileSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]

    def perform_create(self, serializer):
        project = get_object_or_404(Project, pk=self.kwargs['pk'])
        is_deliverable = self.request.data.get('is_deliverable', False)
        # Convert JS string "true"/"false" if needed
        if str(is_deliverable).lower() == 'true': is_deliverable = True
        elif str(is_deliverable).lower() == 'false': is_deliverable = False
        
        # Determine default file type based on deliverable status
        file_type = self.request.data.get('file_type')
        if not file_type:
            file_type = 'DELIVERABLE' if is_deliverable else 'WORK_FILE'
            
        serializer.save(
            project=project, 
            uploaded_by=self.request.user,
            is_deliverable=is_deliverable,
            file_type=file_type
        )

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return success_response(response.data, "File uploaded successfully")


# --- CLIENT VIEWS ---

class ClientProjectListView(generics.ListAPIView):
    serializer_class = ProjectListSerializer
    permission_classes = [permissions.IsAuthenticated, IsClientUser]

    def get_queryset(self):
        return Project.objects.filter(client=self.request.user).select_related('client', 'service')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return success_response(serializer.data, "My projects fetched")

class ClientProjectDetailView(generics.RetrieveAPIView):
    serializer_class = ProjectDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsClientUser]

    def get_queryset(self):
        return Project.objects.filter(client=self.request.user).select_related('client', 'service')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return success_response(serializer.data)

class ClientProjectMessageView(generics.CreateAPIView):
    serializer_class = ProjectMessageSerializer
    permission_classes = [permissions.IsAuthenticated, IsClientUser]

    def perform_create(self, serializer):
        project = get_object_or_404(Project, pk=self.kwargs['pk'], client=self.request.user)
        serializer.save(project=project, sender=self.request.user)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return success_response(response.data, "Message sent")

class ClientProjectFileView(generics.CreateAPIView):
    serializer_class = ProjectFileSerializer
    permission_classes = [permissions.IsAuthenticated, IsClientUser]

    def perform_create(self, serializer):
        project = get_object_or_404(Project, pk=self.kwargs['pk'], client=self.request.user)
        # Client files are typically REVISION or REFERENCE
        file_type = self.request.data.get('file_type', 'REVISION')
        serializer.save(
            project=project, 
            uploaded_by=self.request.user,
            file_type=file_type,
            is_deliverable=False
        )

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return success_response(response.data, "File uploaded successfully")

class ClientProjectRevisionView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsClientUser]

    def post(self, request, pk):
        project = get_object_or_404(Project, pk=pk, client=request.user)
        project.status = 'REVISION_REQUESTED'
        project.save()
        
        reason = request.data.get('revision_notes') or request.data.get('reason') or 'Revision requested by client'
        
        if reason:
            ProjectMessage.objects.create(
                project=project,
                sender=request.user,
                message=reason
            )
            
        return success_response(ProjectDetailSerializer(project).data, "Revision requested")

class ClientProjectApproveView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsClientUser]

    def post(self, request, pk):
        project = get_object_or_404(Project, pk=pk, client=request.user)
        project.status = 'COMPLETED'
        project.progress = 100
        project.save()
        
        ProjectTimeline.objects.create(
            project=project,
            action="Project approved by Client",
            actor=request.user
        )
        return success_response(ProjectDetailSerializer(project).data, "Project approved and marked completed")

class ClientProjectTimelineView(generics.ListAPIView):
    serializer_class = ProjectTimelineSerializer
    permission_classes = [permissions.IsAuthenticated, IsClientUser]

    def get_queryset(self):
        return ProjectTimeline.objects.filter(
            project__pk=self.kwargs['pk'],
            project__client=self.request.user
        )

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return success_response(serializer.data, "Timeline fetched")
