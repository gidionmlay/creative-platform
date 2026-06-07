from rest_framework.permissions import BasePermission


class IsAdminUserRole(BasePermission):
    """
    Allows access only to users with role = 'admin'.
    """
    message = "Admin access only."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, 'profile')
            and request.user.profile.role == 'admin'
        )


class IsClientUser(BasePermission):
    """
    Allows access only to users with role = 'client'.
    """
    message = "Client access only."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, 'profile')
            and request.user.profile.role == 'client'
        )


class IsStudentUser(BasePermission):
    """
    Allows access only to users with role = 'student'.
    """
    message = "Student access only."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, 'profile')
            and request.user.profile.role == 'student'
        )
