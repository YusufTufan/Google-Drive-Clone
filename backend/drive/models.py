from django.db import models
from django.contrib.auth.models import User
import uuid

from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile
import os


class Folder(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, verbose_name="Klasör Adı")
    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="subfolders",
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    is_starred = models.BooleanField(default=False)
    is_trashed = models.BooleanField(default=False)
    is_spam = models.BooleanField(default=False)

    shared_with = models.ManyToManyField(
        User, related_name="shared_folders", blank=True
    )

    def __str__(self):
        return self.name


class File(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, verbose_name="Dosya Adı")
    file = models.FileField(upload_to="files/")
    folder = models.ForeignKey(
        Folder, null=True, blank=True, on_delete=models.CASCADE, related_name="files"
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    size = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    is_starred = models.BooleanField(default=False)
    is_trashed = models.BooleanField(default=False)
    is_spam = models.BooleanField(default=False)

    shared_with = models.ManyToManyField(User, related_name="shared_files", blank=True)

    thumbnail = models.ImageField(upload_to="thumbnails/", null=True, blank=True)

    def save(self, *args, **kwargs):
        if self.file and not self.thumbnail:
            ext = self.file.name.split(".")[-1].lower()
            if ext in ["jpg", "jpeg", "png", "gif", "webp"]:
                try:
                    self.make_thumbnail()
                except Exception as e:
                    print(f"Thumbnail oluşturulamadı: {e}")

        super().save(*args, **kwargs)

    def make_thumbnail(self):
        img = Image.open(self.file)
        img.convert("RGB")

        img.thumbnail((300, 300))

        thumb_io = BytesIO()

        fmt = img.format if img.format else "JPEG"
        img.save(thumb_io, format=fmt, quality=85)

        thumb_name = f"thumb_{os.path.basename(self.file.name)}"
        self.thumbnail.save(thumb_name, ContentFile(thumb_io.getvalue()), save=False)

    def __str__(self):
        return self.name
