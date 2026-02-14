import meilisearch

# Global değişkenler
client = None
index = None


def get_meilisearch_client():
    """
    MeiliSearch bağlantısını kurmaya çalışır.
    Önce standart servis ismini ('meilisearch'), olmazsa container ismini ('nexus_meilisearch') dener.
    """
    global client, index

    # Denenecek adresler (Docker ağında servis ismi veya container ismi olabilir)
    hosts = ["http://meilisearch:7700", "http://nexus_meilisearch:7700"]

    for host in hosts:
        try:
            print(f"🔌 MeiliSearch'e bağlanılıyor: {host} ...")
            temp_client = meilisearch.Client(host, "nexus_master_key")

            # Bağlantıyı test et (Sağlık kontrolü)
            temp_client.health()

            # Eğer buraya geldiysek bağlantı başarılıdır
            client = temp_client
            index = client.index("files")

            # Ayarları güncelle (Filtreleme ve Arama için gerekli)
            index.update_filterable_attributes(
                ["user_id", "type", "is_trashed", "is_spam", "folder_id", "is_starred"]
            )
            index.update_searchable_attributes(["name", "owner_username"])

            print(f"✅ MeiliSearch bağlantısı BAŞARILI: {host}")
            return True

        except Exception as e:
            print(f"⚠️ {host} adresine bağlanılamadı: {str(e)}")
            continue

    print(
        "❌ MeiliSearch'e hiçbir adresten ulaşılamadı. Arama özelliği devre dışı kalacak."
    )
    return False


# İlk başlatma denemesi (Dosya import edildiğinde çalışır)
get_meilisearch_client()

# --- FONKSİYONLAR ---


def index_file(file_instance):
    """
    Bir dosyayı MeiliSearch indeksine ekler veya günceller.
    """
    # Bağlantı kopuksa tekrar dene, yine olmazsa çık
    if not client or not index:
        if not get_meilisearch_client():
            return

    # Dosya fiziksel olarak yoksa işlem yapma
    if not file_instance.file:
        return

    try:
        # Dosya uzantısını güvenli şekilde al
        file_type = "unknown"
        if file_instance.file.name:
            parts = file_instance.file.name.split(".")
            if len(parts) > 1:
                file_type = parts[-1].lower()

        # MeiliSearch'e gönderilecek veri paketi
        data = {
            "id": str(file_instance.id),
            "name": file_instance.name,
            "size": file_instance.size,
            "type": file_type,
            "user_id": file_instance.user.id,
            "owner_username": file_instance.user.username,
            # Klasör ID yoksa (Ana Dizin) -1 olarak işaretle ki filtrelemesi kolay olsun
            "folder_id": file_instance.folder_id if file_instance.folder else -1,
            "is_trashed": file_instance.is_trashed,
            "is_spam": file_instance.is_spam,
            "is_starred": file_instance.is_starred,
            "created_at": file_instance.created_at.timestamp(),
        }

        # Gönder Gelsin!
        index.add_documents([data])
        # print(f"🔍 İndekslendi: {file_instance.name}") # Log kirliliği yapmasın diye kapalı

    except Exception as e:
        print(f"❌ İndeksleme Hatası ({file_instance.name}): {e}")


def delete_file_from_index(file_id):
    """
    Bir dosyayı MeiliSearch indeksinden siler.
    """
    if not client or not index:
        return

    try:
        index.delete_document(file_id)
        # print(f"🗑️ İndeksten Silindi ID: {file_id}")
    except Exception as e:
        print(f"❌ İndeksten Silme Hatası: {e}")
