from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from users.views import ProfileView, ChangePasswordView
from drive.views import FileViewSet, FolderViewSet, StorageUsageView

router = DefaultRouter()
router.register(r"files", FileViewSet)
router.register(r"folders", FolderViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    # Auth (Kullanıcı) URL'leri
    path("api/auth/", include("users.urls")),
    # Storage URL'leri
    path("api/storage/", StorageUsageView.as_view(), name="storage_usage"),
    # Drive URL'leri
    path("api/", include(router.urls)),
    # Profil işlemleri
    path("api/auth/profile/", ProfileView.as_view(), name="auth_profile"),
    path(
        "api/auth/change-password/",
        ChangePasswordView.as_view(),
        name="auth_change_password",
    ),
]
