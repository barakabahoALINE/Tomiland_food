from django.contrib.auth import login, logout
from django.core.exceptions import ValidationError
from rest_framework import generics, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from .models import User
from .permissions import IsAdminUser, IsAuthenticatedAndVerified, IsOwnerOrAdmin
from .serializers import (
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    LoginSerializer,
    OTPSerializer,
    ProfileUpdateSerializer,
    ResetPasswordSerializer,
    TokenObtainSerializer,
    UserDetailSerializer,
    UserListSerializer,
    UserRegistrationSerializer,
    VerifyOTPSerializer,
)
from .services import AccountService
from .utils import build_error_response, build_success_response


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = (AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user, otp = AccountService.create_user_account(
                email=serializer.validated_data['email'],
                phone_number=serializer.validated_data['phone_number'],
                password=serializer.validated_data['password'],
                first_name=serializer.validated_data.get('first_name', ''),
                last_name=serializer.validated_data.get('last_name', ''),
            )
        except ValidationError as exc:
            return Response(build_error_response(str(exc), status=400)[0], status=400)

        return Response(build_success_response('Registration successful. Verification required.', {
            'user': {
                'id': user.id,
                'email': user.email,
                'role': user.role,
                'is_verified': user.is_verified,
            },
        })[0], status=201)


class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        login(request, user)
        token_serializer = TokenObtainSerializer(data={'email': user.email, 'password': request.data['password']})
        token_serializer.is_valid(raise_exception=True)
        return Response(build_success_response('Login successful.', token_serializer.validated_data)[0], status=200)


class LogoutView(generics.GenericAPIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get('refresh') or request.data.get('refresh_token')
        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except Exception:
                pass
        logout(request)
        return Response(build_success_response('Logout successful.')[0], status=200)


class CustomTokenRefreshView(TokenRefreshView):
    pass


class RequestOTPView(generics.GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = OTPSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            otp = AccountService.resend_otp(serializer.validated_data['email'])
        except ValidationError as exc:
            return Response(build_error_response(str(exc), status=400)[0], status=400)
        return Response(build_success_response('OTP sent to your email address.')[0], status=200)


class VerifyOTPView(generics.GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = VerifyOTPSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            AccountService.verify_user_otp(serializer.validated_data['email'], serializer.validated_data['otp'])
        except ValidationError as exc:
            return Response(build_error_response(str(exc), status=400)[0], status=400)
        return Response(build_success_response('OTP verified successfully.')[0], status=200)


class ForgotPasswordView(generics.GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = ForgotPasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            otp = AccountService.resend_otp(serializer.validated_data['email'])
        except ValidationError as exc:
            return Response(build_error_response(str(exc), status=400)[0], status=400)
        return Response(build_success_response('Password reset OTP sent to your email address.')[0], status=200)


class ResetPasswordView(generics.GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = ResetPasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            AccountService.verify_user_otp(serializer.validated_data['email'], serializer.validated_data['otp'])
            AccountService.reset_password(serializer.validated_data['email'], serializer.validated_data['password'])
        except ValidationError as exc:
            return Response(build_error_response(str(exc), status=400)[0], status=400)
        return Response(build_success_response('Password reset successfully.')[0], status=200)


class ChangePasswordView(generics.GenericAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = ChangePasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            AccountService.change_password(request.user, serializer.validated_data['old_password'], serializer.validated_data['new_password'])
        except ValidationError as exc:
            return Response(build_error_response(str(exc), status=400)[0], status=400)
        return Response(build_success_response('Password changed successfully.')[0], status=200)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileUpdateSerializer
    permission_classes = (IsAuthenticated, IsOwnerOrAdmin)
    parser_classes = (MultiPartParser, FormParser)

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        serializer = UserDetailSerializer(request.user)
        return Response(build_success_response('Profile retrieved successfully.', serializer.data)[0], status=200)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        serializer = self.get_serializer(request.user, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(build_success_response('Profile updated successfully.', UserDetailSerializer(request.user).data)[0], status=200)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(is_deleted=False)
    serializer_class = UserListSerializer
    permission_classes = (IsAuthenticated, IsAdminUser)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return UserDetailSerializer
        return UserListSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(build_success_response('Users retrieved successfully.', serializer.data)[0], status=200)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(build_success_response('User retrieved successfully.', serializer.data)[0], status=200)

    @action(detail=True, methods=['post'])
    def activate(self, request, *args, **kwargs):
        user = self.get_object()
        AccountService.activate_user(user)
        return Response(build_success_response('User activated successfully.')[0], status=200)

    @action(detail=True, methods=['post'])
    def deactivate(self, request, *args, **kwargs):
        user = self.get_object()
        AccountService.deactivate_user(user)
        return Response(build_success_response('User deactivated successfully.')[0], status=200)

    @action(detail=True, methods=['post'])
    def soft_delete(self, request, *args, **kwargs):
        user = self.get_object()
        AccountService.soft_delete_user(user)
        return Response(build_success_response('User soft deleted successfully.')[0], status=200)
