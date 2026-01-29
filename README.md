# 🚀 NexusDrive - Full Stack Cloud Storage Solution

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![React](https://img.shields.io/badge/Frontend-React-61DAFB) ![Django](https://img.shields.io/badge/Backend-Django-092E20)

**NexusDrive**, modern web teknolojileri kullanılarak geliştirilmiş, güvenli, ölçeklenebilir ve kullanıcı dostu bir dosya depolama ve yönetim sistemidir (Google Drive Klonu).

Bu proje; dosya versiyonlama, çoklu yükleme, sürükle-bırak desteği ve detaylı dosya yönetim özellikleriyle kurumsal standartlarda bir deneyim sunar.

---

## 🌟 Özellikler

### 📂 Dosya ve Klasör Yönetimi
* **İç İçe Klasör Yapısı:** Sınırsız derinlikte klasör oluşturma ve gezinme (Breadcrumb navigasyonu ile).
* **Sürükle & Bırak (Drag & Drop):** Dosyaları ve klasörleri sürükleyerek yükleme veya taşıma.
* **Çoklu Yükleme (Bulk Upload):** Aynı anda yüzlerce dosyayı progress bar eşliğinde yükleme.
* **Gelişmiş Görünümler:** Izgara (Grid) ve Liste (List) görünümleri arasında anlık geçiş.

### 🛡️ Güvenlik ve Paylaşım
* **İzole Alanlar:** Her kullanıcı sadece kendi dosyalarına erişebilir.
* **Güvenli Paylaşım:** Dosya ve klasörleri diğer kullanıcılarla paylaşma ve yetki yönetimi.
* **JWT Authentication:** Güvenli oturum yönetimi.

### ⚙️ Gelişmiş Özellikler
* **Otomatik Thumbnail:** Yüklenen görseller için backend tarafında (Pillow) otomatik önizleme oluşturma.
* **Dosya Yaşam Döngüsü:** Yıldızlama, Spam Bildirme, Çöp Kutusu ve Geri Yükleme mekanizmaları.
* **Dinamik Kota Takibi:** Kullanılan alanı klasör boyutlarıyla birlikte hesaplayan akıllı sistem.
* **Backend & Depolama:** Dosyalar **MinIO (S3 Compatible)** üzerinde saklanır, veritabanı olarak **SQLite** (Geliştirme) kullanılır.

---

## 🛠️ Teknoloji Yığını (Tech Stack)

* **Frontend:** React.js, Tailwind CSS, Axios
* **Backend:** Django, Django REST Framework (DRF)
* **Depolama (Storage):** MinIO (AWS S3 Uyumlu)
* **Görüntü İşleme:** Pillow (PIL)
* **Veritabanı:** SQLite (Prodüksiyon için PostgreSQL önerilir)

---

## 🚀 Kurulum (Local Development)

Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin.

### 1. Ön Hazırlıklar
* Python 3.x ve Node.js yüklü olmalıdır.
* MinIO Server yerel makinenizde çalışıyor olmalıdır.

### 2. Ortam Değişkenleri (.env)
Backend klasörü içinde `.env` dosyası oluşturun ve aşağıdaki ayarları kendinize göre düzenleyin:

```bash
# backend/.env
DEBUG=True
SECRET_KEY=gizli-anahtariniz-buraya
ALLOWED_HOSTS=localhost,127.0.0.1

# MinIO Ayarları
MINIO_ENDPOINT=127.0.0.1:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=nexus-drive-bucket
MINIO_USE_SSL=False
```


### 3. Backend Kurulumu
```bash
cd backend
python -m venv venv
# Windows için: venv\Scripts\activate
# Mac/Linux için: source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
### 4. Frontend Kurulumu
```bash
cd frontend
npm install
npm start
```

## 🗺️ Geliştirme Yol Haritası (Development Roadmap)

Proje, modern bulut mimarisi standartlarına uygun olarak 3 ana fazda planlanmıştır. Şu an **Faz 1** tamamlanmış olup, **Faz 2** çalışmaları başlamıştır.

### ✅ Faz 1: Core Features & MVP (Tamamlandı)
*Kullanıcı odaklı temel özelliklerin ve uygulama mimarisinin oluşturulması.*
- [x] **Full Stack Mimarisi:** Django REST Framework ve React yapısının kurulması.
- [x] **Depolama Katmanı:** AWS S3 uyumlu **MinIO** entegrasyonu ve medya yönetimi.
- [x] **Gelişmiş Dosya Yönetimi:** Sürükle-bırak (Drag&Drop), çoklu dosya yükleme (Bulk Upload) ve iç içe klasör yapısı.
- [x] **UI/UX Optimizasyonu:** Dinamik breadcrumb navigasyonu, liste/ızgara görünümleri ve toast bildirimleri.
- [x] **Güvenlik:** JWT tabanlı kimlik doğrulama ve izole kullanıcı alanları.

### 🐳 Faz 2: DevOps & Containerization (Sürece Alındı)
*Uygulamanın taşınabilirliğini ve üretim ortamına (Production) uygunluğunu artırma.*
- [ ] **Dockerization:** Backend, Frontend ve MinIO servislerinin Docker imajlarının oluşturulması.
- [ ] **Orchestration:** `docker-compose` ile tüm servislerin (App, DB, Storage) tek komutla ayağa kaldırılması.
- [ ] **Veritabanı Migrasyonu:** Geliştirme veritabanından (SQLite) üretim veritabanına (**PostgreSQL**) geçiş.

### ☸️ Faz 3: High Availability & Observability (Gelecek Hedefleri)
*Sistemin ölçeklenebilirliği ve izlenebilirliğinin sağlanması.*
- [ ] **Kubernetes (K8s) Deployment:** Uygulamanın Cluster yapısına taşınması (Deployment, Service, PVC yapılandırmaları).
- [ ] **Observability Stack:** **Prometheus** ile sistem metriklerinin toplanması ve **Grafana** ile görselleştirilmesi.
- [ ] **Log Yönetimi:** Merkezi loglama altyapısının kurulması.

📄 Lisans
Bu proje MIT lisansı ile lisanslanmıştır.

👨‍💻 Geliştirici
[Yusuf TUFAN]
