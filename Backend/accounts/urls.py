from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    ChangePasswordView,
    CustomTokenRefreshView,
    ForgotPasswordView,
    LoginView,
    LogoutView,
    ProfileView,
    RegisterView,
    RequestOTPView,
    ResetPasswordView,
    UserViewSet,
    VerifyOTPView,
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('otp/request/', RequestOTPView.as_view(), name='request_otp'),
    path('otp/verify/', VerifyOTPView.as_view(), name='verify_otp'),
    path('password/forgot/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('password/reset/', ResetPasswordView.as_view(), name='reset_password'),
    path('password/change/', ChangePasswordView.as_view(), name='change_password'),
    path('profile/', ProfileView.as_view(), name='profile'),
]

urlpatterns += router.urls
