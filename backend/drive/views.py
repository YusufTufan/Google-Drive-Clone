from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.exceptions import ValidationError

from drive.models import File, Folder
from .serializers import FileSerializer, FolderSerializer
from django.contrib.auth.models import User
from django.db.models.functions import Lower

from django.db.models import Sum
from rest_framework.views import APIView
from django.db.models import Q


# Filtreleme Fonksiyonu
def apply_filters(queryset, request):
    filter_type = request.query_params.get("filter")
    search_query = request.query_params.get("search")

    # Arama
    if search_query:
        return queryset.filter(name__icontains=search_query, is_trashed=False).order_by(
            Lower("name")
        )

    # Çöp Kutusu
    if filter_type == "trash":
        return queryset.filter(is_trashed=True).order_by(Lower("name"))

    # Spam
    if filter_type == "spam":
        return queryset.filter(is_spam=True).order_by(Lower("name"))

    # Yıldızlı
    if filter_type == "starred":
        return queryset.filter(
            is_starred=True, is_trashed=False, is_spam=False
        ).order_by(Lower("name"))

    # En Son
    if filter_type == "recent":
        return queryset.filter(is_trashed=False, is_spam=False).order_by("-updated_at")[
            :10
        ]

    return queryset.order_by(Lower("name"))


class FolderViewSet(viewsets.ModelViewSet):
    serializer_class = FolderSerializer
    queryset = Folder.objects.all()

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Folder.objects.none()
        # 1. Belirli bir klasörün içindeki klasörler isteniyorsa
        parent_id = self.request.query_params.get("parent")
        if parent_id:
            return Folder.objects.filter(
                parent_id=parent_id, is_trashed=False
            ).order_by(Lower("name"))

        filter_type = self.request.query_params.get("filter")

        # 2. "Benimle Paylaşılanlar" Modu
        if filter_type == "shared":
            return Folder.objects.filter(shared_with=user, is_trashed=False).order_by(
                Lower("name")
            )

        # 3. Varsayılan: Sadece benim klasörlerim
        queryset = Folder.objects.filter(user=user).order_by(Lower("name"))

        if self.action in [
            "retrieve",
            "update",
            "partial_update",
            "destroy",
            "toggle_star",
            "toggle_trash",
            "toggle_spam",
            "move",
            "share",
        ]:
            return queryset

        search_query = self.request.query_params.get("search")
        if search_query:
            return queryset.filter(name__icontains=search_query, is_trashed=False)

        if filter_type:
            return apply_filters(queryset, self.request)

        return queryset.filter(is_trashed=False, is_spam=False, parent__isnull=True)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        instance = self.get_object()
        new_name = serializer.validated_data.get("name")
        if new_name:
            exists = (
                Folder.objects.filter(
                    user=self.request.user, parent=instance.parent, name=new_name
                )
                .exclude(pk=instance.pk)
                .exists()
            )
            if exists:
                raise ValidationError({"message": "Bu isimde klasör var."})
        serializer.save()

    # --- AKSİYONLAR ---
    @action(detail=True, methods=["post"])
    def share(self, request, pk=None):
        folder = self.get_object()
        username = request.data.get("username")

        try:
            user_to_share = User.objects.get(username=username)
            if user_to_share == request.user:
                return Response({"error": "Kendinizle paylaşamazsınız"}, status=400)

            folder.shared_with.add(user_to_share)
            return Response(
                {"status": "shared", "message": f"{username} ile paylaşıldı"}
            )
        except User.DoesNotExist:
            return Response({"error": "Kullanıcı bulunamadı"}, status=404)

    @action(detail=True, methods=["post"])
    def move(self, request, pk=None):
        obj = self.get_object()
        target_folder_id = request.data.get("target_folder_id")
        if str(target_folder_id) == str(obj.id):
            return Response({"error": "Kendisi hedef olamaz"}, status=400)
        obj.parent_id = target_folder_id
        obj.save()
        return Response({"status": "moved"})

    # (Diğer toggle aksiyonları: star, trash, spam...)
    @action(detail=True, methods=["post"])
    def toggle_star(self, request, pk=None):
        obj = self.get_object()
        obj.is_starred = not obj.is_starred
        obj.save()
        return Response({"status": "ok"})

    @action(detail=True, methods=["post"])
    def toggle_trash(self, request, pk=None):
        obj = self.get_object()
        obj.is_trashed = not obj.is_trashed
        if obj.is_trashed:
            obj.is_spam = False
        obj.save()
        return Response({"status": "ok"})

    @action(detail=True, methods=["post"])
    def toggle_spam(self, request, pk=None):
        obj = self.get_object()
        obj.is_spam = not obj.is_spam
        if obj.is_spam:
            obj.is_trashed = False
        obj.save()
        return Response({"status": "ok"})


class FileViewSet(viewsets.ModelViewSet):
    serializer_class = FileSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    queryset = File.objects.all()

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return File.objects.none()

        # 1. Eğer bir klasörün içindeki dosyalar isteniyorsa
        folder_id = self.request.query_params.get("folder")
        if folder_id:
            return File.objects.filter(folder_id=folder_id, is_trashed=False).order_by(
                Lower("name")
            )

        # Link alma vs. işlemleri için kapsama alanı
        if self.action in ["get_link", "retrieve"]:
            return File.objects.filter(Q(user=user) | Q(shared_with=user)).distinct()

        filter_type = self.request.query_params.get("filter")

        # 2. Paylaşılanlar
        if filter_type == "shared":
            return File.objects.filter(shared_with=user, is_trashed=False).order_by(
                Lower("name")
            )

        # 3. Varsayılan: Benim dosyalarım
        queryset = File.objects.filter(user=user).order_by(Lower("name"))

        if self.action in [
            "retrieve",
            "update",
            "partial_update",
            "destroy",
            "toggle_star",
            "toggle_trash",
            "toggle_spam",
            "move",
            "share",
        ]:
            return queryset

        search_query = self.request.query_params.get("search")
        if search_query:
            return queryset.filter(name__icontains=search_query, is_trashed=False)

        if filter_type:
            return apply_filters(queryset, self.request)

        return queryset.filter(is_trashed=False, is_spam=False, folder__isnull=True)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, size=self.request.data.get("file").size)

    def perform_update(self, serializer):
        instance = self.get_object()
        new_name = serializer.validated_data.get("name")
        if new_name:
            exists = (
                File.objects.filter(
                    user=self.request.user, folder=instance.folder, name=new_name
                )
                .exclude(pk=instance.pk)
                .exists()
            )
            if exists:
                raise ValidationError({"message": "Bu isimde dosya var."})
        serializer.save()

    # --- AKSİYONLAR ---
    @action(detail=True, methods=["post"])
    def share(self, request, pk=None):
        file = self.get_object()
        username = request.data.get("username")

        try:
            user_to_share = User.objects.get(username=username)
            if user_to_share == request.user:
                return Response({"error": "Kendinizle paylaşamazsınız"}, status=400)

            file.shared_with.add(user_to_share)
            return Response(
                {"status": "shared", "message": f"{username} ile paylaşıldı"}
            )
        except User.DoesNotExist:
            return Response({"error": "Kullanıcı bulunamadı"}, status=404)

    @action(detail=True, methods=["post"])
    def move(self, request, pk=None):
        obj = self.get_object()
        obj.folder_id = request.data.get("target_folder_id")
        obj.save()
        return Response({"status": "moved"})

    @action(detail=True, methods=["post"])
    def toggle_star(self, request, pk=None):
        obj = self.get_object()
        obj.is_starred = not obj.is_starred
        obj.save()
        return Response({"status": "ok"})

    @action(detail=True, methods=["post"])
    def toggle_trash(self, request, pk=None):
        obj = self.get_object()
        obj.is_trashed = not obj.is_trashed
        if obj.is_trashed:
            obj.is_spam = False
        obj.save()
        return Response({"status": "ok"})

    @action(detail=True, methods=["post"])
    def toggle_spam(self, request, pk=None):
        obj = self.get_object()
        obj.is_spam = not obj.is_spam
        if obj.is_spam:
            obj.is_trashed = False
        obj.save()
        return Response({"status": "ok"})

    @action(detail=True, methods=["get"])
    def get_link(self, request, pk=None):
        file_obj = self.get_object()

        # Dosyanın geçici (imzalı) indirme linkini alıyoruz
        try:
            download_url = file_obj.file.url
            return Response({"url": download_url})
        except Exception:
            return Response({"error": "Link oluşturulamadı"}, status=500)


class StorageUsageView(APIView):
    def get(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({"total": 0, "used": 0})

        total_used = (
            File.objects.filter(user=user).aggregate(Sum("size"))["size__sum"] or 0
        )
        limit = 15 * 1024 * 1024 * 1024

        return Response({"total": limit, "used": total_used})
