from rest_framework.response import Response
from rest_framework import status


def success_response(data=None, message="Success", status_code=status.HTTP_200_OK):
    """
    Standardized success response wrapper.
    Returns: { "success": true, "message": "...", "data": {...} }
    """
    return Response({
        "success": True,
        "message": message,
        "data": data,
    }, status=status_code)


def error_response(message="An error occurred", errors=None, status_code=status.HTTP_400_BAD_REQUEST):
    """
    Standardized error response wrapper.
    Returns: { "success": false, "message": "...", "errors": {...} }
    """
    return Response({
        "success": False,
        "message": message,
        "errors": errors or {},
    }, status=status_code)
