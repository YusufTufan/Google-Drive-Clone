from rest_framework import serializers
from .models import File, Folder
from django.db.models import Sum


class FileSerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source="user.username")

    class Meta:
        model = File
        fields = [
            "id",
            "name",
            "file",
            "folder",
            "thumbnail",
            "user",
            "owner_username",
            "size",
            "created_at",
            "updated_at",
            "is_starred",
            "is_trashed",
            "is_spam",
            "shared_with",
        ]
        read_only_fields = [
            "user",
            "size",
            "created_at",
            "updated_at",
            "owner_username",
        ]


class FolderSerializer(serializers.ModelSerializer):

    owner_username = serializers.ReadOnlyField(source="user.username")
    size = serializers.SerializerMethodField()

    class Meta:
        model = Folder
        fields = [
            "id",
            "name",
            "parent",
            "user",
            "owner_username",
            "created_at",
            "updated_at",
            "is_starred",
            "is_trashed",
            "is_spam",
            "shared_with",
            "size",
        ]
        read_only_fields = ["user", "created_at", "updated_at", "owner_username"]

    def get_size(self, obj):
        total_size = obj.files.filter(is_trashed=False).aggregate(Sum("size"))[
            "size__sum"
        ]
        return total_size or 0
