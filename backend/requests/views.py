from rest_framework import generics, permissions, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.utils import timezone
from django.db import transaction
from .models import Request, RequestAttachment, RequestActivity, RequestNote
from .serializers import RequestSerializer, RequestCreateSerializer
from core.utils import success_response, error_response
from core.permissions import IsAdminUserRole


class RequestPagination(PageNumberPagination):
    """Pagination for request listings."""
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


class CreateRequestView(generics.CreateAPIView):
    """
    POST /api/v1/requests/
    Creates a new service request with optional file attachments.
    Accepts multipart/form-data.
    """
    serializer_class = RequestCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return error_response(
                message="Validation failed",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )

        validated = serializer.validated_data
        files = request.FILES.getlist('attachments')

        with transaction.atomic():
            # Create the request
            req_obj = Request.objects.create(
                client=request.user,
                service=validated['service'],
                title=validated['title'],
                description=validated['description'],
                budget=validated.get('budget'),
                quantity=validated.get('quantity', 1),
            )

            # Create attachment records
            for f in files:
                RequestAttachment.objects.create(
                    request=req_obj,
                    file=f
                )

            # Log activity
            RequestActivity.objects.create(
                request=req_obj,
                actor=request.user,
                action='created',
                message='Request created successfully.'
            )

        # Return full serialized response
        response_serializer = RequestSerializer(req_obj, context={'request': request})
        return success_response(
            data=response_serializer.data,
            message="Request created successfully",
            status_code=status.HTTP_201_CREATED
        )


class MyRequestsView(generics.ListAPIView):
    """
    GET /api/v1/requests/my/
    Returns only the current authenticated user's requests, newest first.
    Supports filtering by ?status=pending.
    """
    serializer_class = RequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = RequestPagination

    def get_queryset(self):
        queryset = Request.objects.filter(client=self.request.user).select_related('service', 'service__category').prefetch_related('attachments').order_by('-created_at')

        request_status = self.request.query_params.get('status')
        if request_status:
            queryset = queryset.filter(status=request_status)

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated = self.get_paginated_response(serializer.data)
            return success_response(
                data=paginated.data,
                message="Requests fetched"
            )

        serializer = self.get_serializer(queryset, many=True)
        return success_response(
            data=serializer.data,
            message="Requests fetched"
        )


# --- ADMIN VIEWS ---

class AdminRequestListView(generics.ListAPIView):
    """
    GET /api/v1/admin/requests/
    Returns all requests for admins. Ordered by latest first.
    Supports filtering by ?status=pending.
    """
    serializer_class = RequestSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]
    pagination_class = RequestPagination

    def get_queryset(self):
        queryset = Request.objects.all().select_related('service', 'service__category', 'client').prefetch_related('attachments').order_by('-created_at')

        request_status = self.request.query_params.get('status')
        if request_status:
            queryset = queryset.filter(status=request_status)

        service_id = self.request.query_params.get('service')
        if service_id:
            queryset = queryset.filter(service_id=service_id)

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated = self.get_paginated_response(serializer.data)
            return success_response(
                data=paginated.data,
                message="All requests fetched"
            )

        serializer = self.get_serializer(queryset, many=True)
        return success_response(
            data=serializer.data,
            message="All requests fetched"
        )


class AdminRequestDetailView(generics.RetrieveAPIView):
    """
    GET /api/v1/admin/requests/<id>/
    Returns full request detail with attachments for admin.
    """
    serializer_class = RequestSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]
    queryset = Request.objects.all().select_related('service', 'service__category', 'client').prefetch_related('attachments')


class ApproveRequestView(generics.UpdateAPIView):
    """
    PATCH /api/v1/admin/requests/<id>/approve/
    Approves a request. Admin only.
    """
    queryset = Request.objects.all()
    serializer_class = RequestSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        if instance.status != 'pending':
            return error_response(
                message=f"Cannot approve request. Current status is '{instance.status}'.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        admin_note = request.data.get('admin_note', '')

        instance.status = 'approved'
        instance.admin_note = admin_note
        instance.save()

        RequestActivity.objects.create(
            request=instance,
            actor=request.user,
            action='approved',
            message=f'Request approved by {request.user.first_name}.'
        )
        
        # Phase C3.1: Create Project Workspace automatically
        from projects.models import Project, ProjectTimeline
        project, created = Project.objects.get_or_create(
            request=instance,
            defaults={
                'client': instance.client,
                'service': instance.service,
                'title': instance.title,
                'description': instance.description,
                'status': 'IN_PROGRESS',
                'due_date': instance.delivery_date
            }
        )
        
        if created:
            ProjectTimeline.objects.create(
                project=project,
                action="Project created from approved request",
                actor=request.user
            )
            
            # Note: Project notification is handled by the signals in projects/signals.py 
            # when status changes to 'IN_PROGRESS' which covers the project creation.

        serializer = self.get_serializer(instance)
        return success_response(
            data=serializer.data,
            message="Request approved successfully"
        )


class RejectRequestView(generics.UpdateAPIView):
    """
    PATCH /api/v1/admin/requests/<id>/reject/
    Rejects a request. Admin only. Requires admin_note.
    """
    queryset = Request.objects.all()
    serializer_class = RequestSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        if instance.status != 'pending':
            return error_response(
                message=f"Cannot reject request. Current status is '{instance.status}'.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        admin_note = request.data.get('admin_note', '')

        if not admin_note.strip():
            return error_response(
                message="Validation failed",
                errors={"admin_note": ["Rejection reason is required."]},
                status_code=status.HTTP_400_BAD_REQUEST
            )

        instance.status = 'rejected'
        instance.admin_note = admin_note
        instance.save()

        RequestActivity.objects.create(
            request=instance,
            actor=request.user,
            action='rejected',
            message=f'Request rejected. Reason: {admin_note}'
        )

        serializer = self.get_serializer(instance)
        return success_response(
            data=serializer.data,
            message="Request rejected successfully"
        )


class UpdateRequestStatusView(generics.UpdateAPIView):
    """
    PATCH /api/v1/admin/requests/<id>/status/
    Update request status (in_progress, completed). Admin only.
    """
    queryset = Request.objects.all()
    serializer_class = RequestSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        new_status = request.data.get('status', '')

        valid_transitions = {
            'pending': ['under_review', 'approved', 'rejected'],
            'under_review': ['approved', 'rejected', 'waiting_client'],
            'approved': ['in_progress', 'rejected', 'waiting_client'],
            'in_progress': ['waiting_client', 'revision', 'completed'],
            'waiting_client': ['in_progress', 'cancelled'],
            'revision': ['in_progress', 'completed'],
        }

        allowed = valid_transitions.get(instance.status, [])
        if new_status not in allowed:
            return error_response(
                message=f"Cannot change status from '{instance.status}' to '{new_status}'.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        instance.status = new_status
        if request.data.get('admin_note'):
            instance.admin_note = request.data['admin_note']
        instance.save()

        RequestActivity.objects.create(
            request=instance,
            actor=request.user,
            action=new_status,
            message=f'Status changed to {new_status.replace("_", " ").title()}'
        )

        serializer = self.get_serializer(instance)
        return success_response(
            data=serializer.data,
            message=f"Request status updated to '{new_status}'"
        )


class AddRequestNoteView(generics.CreateAPIView):
    """
    POST /api/v1/admin/requests/<id>/notes/
    Adds an internal note to a request. Admin only.
    """
    serializer_class = RequestSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]

    def post(self, request, *args, **kwargs):
        req_id = self.kwargs.get('pk')
        try:
            req_obj = Request.objects.get(id=req_id)
        except Request.DoesNotExist:
            return error_response("Request not found", status_code=status.HTTP_404_NOT_FOUND)
        
        note_text = request.data.get('note', '')
        if not note_text.strip():
            return error_response("Note text is required", status_code=status.HTTP_400_BAD_REQUEST)
            
        RequestNote.objects.create(
            request=req_obj,
            user=request.user,
            note=note_text
        )
        
        RequestActivity.objects.create(
            request=req_obj,
            actor=request.user,
            action='note_added',
            message='An internal note was added.'
        )

        serializer = self.get_serializer(req_obj)
        return success_response(
            data=serializer.data,
            message="Note added successfully"
        )
