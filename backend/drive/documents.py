from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry
from .models import File


@registry.register_document
class FileDocument(Document):
    user = fields.ObjectField(
        properties={
            "id": fields.IntegerField(),
            "username": fields.TextField(),
        }
    )

    class Index:
        name = "files_metadata"
        settings = {"number_of_shards": 1, "number_of_replicas": 0}

    class Django:
        model = File
        fields = [
            "id",
            "name",
            "size",
            "created_at",
        ]
