from django.apps import AppConfig
from django.db.models.signals import post_save, post_delete


class DriveConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "drive"

    def ready(self):
        try:
            from .models import File
            from .search_client import index_file, delete_file_from_index

            # Dosya Kaydedilince (Ekleme/Güncelleme) -> İndeksle
            def update_index(sender, instance, **kwargs):
                try:
                    index_file(instance)
                except Exception as e:
                    print(f"MeiliSearch Index Error: {e}")

            # Dosya Silinince -> İndeksten Sil
            def delete_from_index(sender, instance, **kwargs):
                try:
                    delete_file_from_index(instance.id)
                except Exception as e:
                    print(f"MeiliSearch Delete Error: {e}")

            post_save.connect(update_index, sender=File)
            post_delete.connect(delete_from_index, sender=File)
        except ImportError:
            pass
