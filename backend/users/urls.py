from django.urls import path
from .views import (
    RegisterView,
    ProfileView,
    ChangePasswordView,
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # Auth İşlemleri
    path("register/", RegisterView.as_view(), name="auth_register"),
    path("login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # Profil İşlemleri
    path("profile/", ProfileView.as_view(), name="auth_profile"),
    path("change-password/", ChangePasswordView.as_view(), name="auth_change_password"),
]
