from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.exceptions import ValidationError

from drive.models import File, Folder
from .serializers import FileSerializer, FolderSerializer
from django.contrib.auth.models import User
from django.db.models.functions import Lower

import meilisearch
from django.db.models import Sum, When, Case
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


client = meilisearch.Client("http://meilisearch:7700", "nexus_master_key")


def apply_advanced_search(queryset, request):
    search_query = request.query_params.get("search")
    file_type = request.query_params.get("type")  # 'pdf', 'jpg' vb.

    # Arama yoksa normal queryset döndür
    if not search_query and not file_type:
        return queryset

    # 1. MeiliSearch Filtrelerini Hazırla
    # Kullanıcı SADECE kendi dosyalarını görmeli
    user_id = request.user.id

    # Filtre kuralları: Kendi dosyası OLACAK + Çöp OLMAYACAK + Spam OLMAYACAK
    search_params = {
        "filter": [f"user_id = {user_id}", "is_trashed = false", "is_spam = false"],
        "limit": 100,  # Maksimum sonuç sayısı
    }

    if file_type:
        # Tür filtresi varsa ekle
        search_params["filter"].append(f"type = {file_type}")

    try:
        # 2. MeiliSearch'te Ara
        index = client.index("files")
        # Arama metni boşsa bile filtreler çalışsın diye "" gönderiyoruz
        result = index.search(search_query if search_query else "", search_params)

        # 3. Sonuçları Django Queryset'e Çevir
        hits = result.get("hits", [])
        file_ids = [hit["id"] for hit in hits]

        if not file_ids:
            return queryset.none()

        # Sıralamayı Koru (MeiliSearch en alakalıyı en başa koyar, SQL bozmasın)
        preserved_order = Case(
            *[When(pk=pk, then=pos) for pos, pk in enumerate(file_ids)]
        )

        return queryset.filter(pk__in=file_ids).order_by(preserved_order)

    except Exception as e:
        print(f"MeiliSearch Hatası (Fallback çalışıyor): {e}")
        # Eğer MeiliSearch çökmüşse, eski usul DB araması yap (Yedek Plan)
        if search_query:
            queryset = queryset.filter(name__icontains=search_query)
        if file_type:
            queryset = queryset.filter(name__iendswith=file_type)
        return queryset


class FolderViewSet(viewsets.ModelViewSet):
    serializer_class = FolderSerializer
    queryset = Folder.objects.all()

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Folder.objects.none()

        all_accessible = Folder.objects.filter(
            Q(user=user) | Q(shared_with=user)
        ).distinct()

        # 1. Aksiyonlar
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
            return all_accessible

        # 2. Belirli bir klasörün içindeki klasörler isteniyorsa
        parent_id = self.request.query_params.get("parent")
        if parent_id:
            return all_accessible.filter(
                parent_id=parent_id, is_trashed=False
            ).order_by(Lower("name"))

        filter_type = self.request.query_params.get("filter")

        # 3. "Benimle Paylaşılanlar" Modu
        if filter_type == "shared":
            return all_accessible.filter(shared_with=user, is_trashed=False).order_by(
                Lower("name")
            )

        # 4. Varsayılan (My Drive) - Sadece benimkiler
        my_folders = Folder.objects.filter(user=user).order_by(Lower("name"))

        search_query = self.request.query_params.get("search")
        if search_query:
            return apply_advanced_search(all_accessible, self.request)

        if filter_type:
            return apply_filters(all_accessible, self.request)

        return my_folders.filter(is_trashed=False, is_spam=False, parent__isnull=True)

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

    def perform_destroy(self, instance):
        user = self.request.user

        # Eğer klasörün SAHİBİ benimsem:
        if instance.user == user:
            # Komple sil (İçindekilerle birlikte gider)
            instance.delete()

        # Eğer klasör bana PAYLAŞILMIŞSA:
        else:
            # Klasörü silme, sadece beni "paylaşılanlar" listesinden çıkar
            instance.shared_with.remove(user)

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

        # Hem benim dosyalarım hem de bana paylaşılanlar
        all_accessible = File.objects.filter(
            Q(user=user) | Q(shared_with=user)
        ).distinct()

        # 1. Eğer bir klasörün içindeki dosyalar isteniyorsa
        folder_id = self.request.query_params.get("folder")
        if folder_id:
            return all_accessible.filter(
                folder_id=folder_id, is_trashed=False
            ).order_by(Lower("name"))

        # 2. Aksiyonlar
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
            "get_link",
        ]:
            return all_accessible

        # Benim dosyalarım
        my_files = File.objects.filter(user=user).order_by(Lower("name"))
        # Gelişmiş arama
        search_query = self.request.query_params.get("search")
        file_type = self.request.query_params.get("type")

        if search_query or file_type:
            return apply_advanced_search(all_accessible, self.request)

        filter_type = self.request.query_params.get("filter")
        # 3. Filtreler (Shared, Recent vb.)
        if filter_type == "shared":
            return all_accessible.filter(shared_with=user, is_trashed=False).order_by(
                Lower("name")
            )

        if filter_type:
            return apply_filters(all_accessible, self.request)

        return my_files.filter(is_trashed=False, is_spam=False, folder__isnull=True)

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

    def perform_destroy(self, instance):
        user = self.request.user

        # Eğer dosyanın SAHİBİ benimsem:
        if instance.user == user:
            # 1. MinIO'dan fiziksel sil
            if instance.file:
                instance.file.delete(save=False)
            # 2. Veritabanından sil
            instance.delete()

        # Eğer dosya bana PAYLAŞILMIŞSA:
        else:
            # Dosyayı silme, sadece beni "paylaşılanlar" listesinden çıkar
            instance.shared_with.remove(user)

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
