from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from .utils import success_response, error_response


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    if not username or not password:
        return Response({"error": "Username and password are required"}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists"}, status=400)

    if email and User.objects.filter(email=email).exists():
        return Response({"error": "Email already exists"}, status=400)

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )
    
    # Update role if provided
    role = request.data.get('role')
    if role and hasattr(user, 'profile'):
        user.profile.role = role
        user.profile.save()

    return Response({
        "message": "User registered successfully"
    }, status=201)


class CustomLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        identifier = request.data.get("identifier")  # email OR username
        password = request.data.get("password")

        user = User.objects.filter(email__iexact=identifier).first()

        if not user:
            user = User.objects.filter(username__iexact=identifier).first()

        if user:
            user = authenticate(username=user.username, password=password)

        if not user:
            return Response({"error": "Invalid credentials"}, status=400)

        token, _ = Token.objects.get_or_create(user=user)
        
        role = 'client'
        if hasattr(user, 'profile'):
            role = user.profile.role

        return Response({
            "key": token.key,
            "user_id": user.id,
            "username": user.username,
            "email": user.email,
            "profile_role": role
        })

@api_view(['GET'])
def get_user_profile(request):
    user = request.user
    role = 'client'
    if hasattr(user, 'profile'):
        role = user.profile.role

    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": role
    })
