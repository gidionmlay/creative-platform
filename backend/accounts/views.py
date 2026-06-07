"""
G Design — Admin User Management API
=====================================
All endpoints are protected by IsAdminUserRole.
Provides: list, detail, suspend, activate, role-change,
          soft-delete, reset-password, analytics, activity.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Q
from django.db.models.functions import TruncMonth, TruncWeek

from accounts.models import Profile
from notifications.models import Notification
from courses.models import Enrollment
from requests.models import Request
from core.permissions import IsAdminUserRole
from core.utils import success_response, error_response


# ── helpers ──────────────────────────────────────────────────────────────

def _serialize_user(user):
    """Return a safe dict for a single user."""
    try:
        profile = user.profile
        role = profile.role
        user_status = profile.status
        avatar = profile.avatar or None
        phone = profile.phone or None
        bio = profile.bio or None
        last_seen = profile.last_seen.isoformat() if profile.last_seen else None
    except Profile.DoesNotExist:
        role = 'client'
        user_status = 'active'
        avatar = phone = bio = last_seen = None

    enrollment_count = Enrollment.objects.filter(user=user).count()
    request_count    = Request.objects.filter(client=user).count()

    return {
        'id':              user.id,
        'username':        user.username,
        'email':           user.email,
        'first_name':      user.first_name,
        'last_name':       user.last_name,
        'full_name':       f"{user.first_name} {user.last_name}".strip() or user.username,
        'role':            role,
        'status':          user_status,
        'avatar':          avatar,
        'phone':           phone,
        'bio':             bio,
        'last_seen':       last_seen,
        'date_joined':     user.date_joined.isoformat(),
        'last_login':      user.last_login.isoformat() if user.last_login else None,
        'is_active':       user.is_active,
        'enrollment_count': enrollment_count,
        'request_count':   request_count,
    }


def _send_notification(user, title, message, notif_type='system'):
    """Create a DB notification and skip WS errors gracefully."""
    try:
        notif = Notification.objects.create(
            user=user, title=title, message=message, type=notif_type
        )
        # Try to push via channels — non-fatal if it fails
        try:
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"user_{user.id}",
                {
                    "type": "send_notification",
                    "data": {
                        "id": notif.id,
                        "title": notif.title,
                        "message": notif.message,
                        "type": notif.type,
                        "created_at": notif.created_at.isoformat(),
                    }
                }
            )
        except Exception:
            pass  # WS push is best-effort
    except Exception:
        pass


# ── Views ─────────────────────────────────────────────────────────────────

class AdminUserListView(APIView):
    """GET  /api/v1/admin/users/  — paginated, filterable user list."""
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        qs = User.objects.select_related('profile').order_by('-date_joined')

        # Filters
        role_filter   = request.query_params.get('role', '')
        status_filter = request.query_params.get('status', '')
        search        = request.query_params.get('search', '').strip()

        if role_filter:
            qs = qs.filter(profile__role=role_filter)
        if status_filter:
            qs = qs.filter(profile__status=status_filter)
        if search:
            qs = qs.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )

        # Pagination
        page     = max(1, int(request.query_params.get('page', 1)))
        per_page = min(50, max(10, int(request.query_params.get('per_page', 20))))
        total    = qs.count()
        start    = (page - 1) * per_page
        end      = start + per_page
        users    = qs[start:end]

        return Response({
            'count':    total,
            'page':     page,
            'per_page': per_page,
            'pages':    max(1, (total + per_page - 1) // per_page),
            'results':  [_serialize_user(u) for u in users],
        })


class AdminUserDetailView(APIView):
    """GET /api/v1/admin/users/{id}/"""
    permission_classes = [IsAdminUserRole]

    def get(self, request, pk):
        try:
            user = User.objects.select_related('profile').get(pk=pk)
        except User.DoesNotExist:
            return error_response("User not found.", status_code=404)

        data = _serialize_user(user)

        # Enriched: recent enrollments
        enrollments = Enrollment.objects.filter(user=user).select_related('course').order_by('-enrolled_at')[:5]
        data['enrollments'] = [
            {'course': e.course.title, 'status': e.status, 'progress': e.progress}
            for e in enrollments
        ]

        # Enriched: recent requests
        recent_requests = Request.objects.filter(client=user).order_by('-created_at')[:5]
        data['requests'] = [
            {'id': r.id, 'title': r.title, 'service': r.service, 'status': r.status}
            for r in recent_requests
        ]

        # Notification summary
        data['notification_count'] = Notification.objects.filter(user=user).count()
        data['unread_notifications'] = Notification.objects.filter(user=user, is_read=False).count()

        return success_response(data)


class AdminUserSuspendView(APIView):
    """PATCH /api/v1/admin/users/{id}/suspend/"""
    permission_classes = [IsAdminUserRole]

    def patch(self, request, pk):
        try:
            user = User.objects.select_related('profile').get(pk=pk)
        except User.DoesNotExist:
            return error_response("User not found.", status_code=404)

        if not hasattr(user, 'profile'):
            return error_response("User profile missing.")

        if user.profile.role == 'admin':
            return error_response("Cannot suspend another admin account.")

        user.profile.status = 'suspended'
        user.profile.save(update_fields=['status'])

        _send_notification(
            user,
            "Account Suspended",
            "Your account has been suspended by an administrator. Please contact support for assistance.",
            notif_type='system'
        )

        return success_response({'id': user.id, 'status': 'suspended'}, message="User suspended.")


class AdminUserActivateView(APIView):
    """PATCH /api/v1/admin/users/{id}/activate/"""
    permission_classes = [IsAdminUserRole]

    def patch(self, request, pk):
        try:
            user = User.objects.select_related('profile').get(pk=pk)
        except User.DoesNotExist:
            return error_response("User not found.", status_code=404)

        if not hasattr(user, 'profile'):
            return error_response("User profile missing.")

        user.profile.status = 'active'
        user.profile.save(update_fields=['status'])

        _send_notification(
            user,
            "Account Activated",
            "Your account has been activated. You can now log in and access all features.",
            notif_type='system'
        )

        return success_response({'id': user.id, 'status': 'active'}, message="User activated.")


class AdminUserChangeRoleView(APIView):
    """PATCH /api/v1/admin/users/{id}/role/"""
    permission_classes = [IsAdminUserRole]

    VALID_ROLES = {'admin', 'student', 'client'}

    def patch(self, request, pk):
        try:
            user = User.objects.select_related('profile').get(pk=pk)
        except User.DoesNotExist:
            return error_response("User not found.", status_code=404)

        new_role = request.data.get('role', '').lower()
        if new_role not in self.VALID_ROLES:
            return error_response(f"Invalid role. Must be one of: {', '.join(self.VALID_ROLES)}")

        if not hasattr(user, 'profile'):
            return error_response("User profile missing.")

        old_role = user.profile.role
        user.profile.role = new_role
        user.profile.save(update_fields=['role'])

        _send_notification(
            user,
            "Role Changed",
            f"Your account role has been changed from '{old_role}' to '{new_role}'.",
            notif_type='system'
        )

        return success_response({'id': user.id, 'role': new_role}, message="Role updated.")


class AdminUserDeleteView(APIView):
    """DELETE /api/v1/admin/users/{id}/delete/ — soft delete (deactivates)"""
    permission_classes = [IsAdminUserRole]

    def delete(self, request, pk):
        try:
            user = User.objects.select_related('profile').get(pk=pk)
        except User.DoesNotExist:
            return error_response("User not found.", status_code=404)

        if user == request.user:
            return error_response("You cannot delete your own account.")

        if hasattr(user, 'profile') and user.profile.role == 'admin':
            return error_response("Cannot delete an admin account.")

        # Soft delete: deactivate + mark blocked
        user.is_active = False
        user.save(update_fields=['is_active'])
        if hasattr(user, 'profile'):
            user.profile.status = 'blocked'
            user.profile.save(update_fields=['status'])

        return success_response({'id': user.id}, message="User deactivated.", status_code=200)


class AdminUserResetPasswordView(APIView):
    """POST /api/v1/admin/users/{id}/reset-password/"""
    permission_classes = [IsAdminUserRole]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return error_response("User not found.", status_code=404)

        new_password = request.data.get('new_password', '').strip()
        if not new_password or len(new_password) < 8:
            return error_response("Password must be at least 8 characters.")

        user.set_password(new_password)
        user.save()

        _send_notification(
            user,
            "Password Reset",
            "Your account password has been reset by an administrator. Please log in with your new credentials.",
            notif_type='system'
        )

        return success_response({}, message="Password reset successfully.")


class AdminUserAnalyticsView(APIView):
    """GET /api/v1/admin/users/analytics/"""
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        now = timezone.now()
        week_ago = now - timedelta(days=7)

        profiles = Profile.objects.all()
        total_users    = User.objects.count()
        total_students = profiles.filter(role='student').count()
        total_clients  = profiles.filter(role='client').count()
        total_admins   = profiles.filter(role='admin').count()
        active_users   = profiles.filter(status='active').count()
        suspended      = profiles.filter(status='suspended').count()
        new_this_week  = User.objects.filter(date_joined__gte=week_ago).count()

        # Growth chart (last 12 months)
        growth_qs = (
            User.objects
            .filter(date_joined__gte=now - timedelta(days=365))
            .annotate(period=TruncMonth('date_joined'))
            .values('period')
            .annotate(count=Count('id'))
            .order_by('period')
        )
        growth_labels = []
        growth_data   = []
        for item in growth_qs:
            if item['period']:
                growth_labels.append(item['period'].strftime('%b %Y'))
                growth_data.append(item['count'])

        # Role distribution
        role_data = {
            'labels': ['Students', 'Clients', 'Admins'],
            'data':   [total_students, total_clients, total_admins],
        }

        # Status distribution
        status_data = {
            'labels': ['Active', 'Suspended', 'Pending', 'Blocked'],
            'data': [
                profiles.filter(status='active').count(),
                profiles.filter(status='suspended').count(),
                profiles.filter(status='pending').count(),
                profiles.filter(status='blocked').count(),
            ]
        }

        return Response({
            'kpis': {
                'total_users':    total_users,
                'total_students': total_students,
                'total_clients':  total_clients,
                'active_users':   active_users,
                'suspended':      suspended,
                'new_this_week':  new_this_week,
            },
            'growth': {
                'labels': growth_labels,
                'data':   growth_data,
            },
            'role_distribution':   role_data,
            'status_distribution': status_data,
        })


class AdminUserActivityView(APIView):
    """GET /api/v1/admin/users/{id}/activity/"""
    permission_classes = [IsAdminUserRole]

    def get(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return error_response("User not found.", status_code=404)

        activities = []

        # Enrollments
        for e in Enrollment.objects.filter(user=user).select_related('course').order_by('-enrolled_at')[:10]:
            activities.append({
                'type': 'enrollment',
                'message': f"Enrolled in {e.course.title}",
                'created_at': e.enrolled_at.isoformat(),
            })

        # Requests
        for r in Request.objects.filter(client=user).order_by('-created_at')[:10]:
            activities.append({
                'type': 'request',
                'message': f"Submitted request: {r.title} [{r.status}]",
                'created_at': r.created_at.isoformat(),
            })

        # Notifications as activity proxy
        for n in Notification.objects.filter(user=user).order_by('-created_at')[:10]:
            activities.append({
                'type': 'notification',
                'message': n.title,
                'created_at': n.created_at.isoformat(),
            })

        activities.sort(key=lambda x: x['created_at'], reverse=True)
        return success_response(activities[:20])
