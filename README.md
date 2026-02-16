# 🚀 NexusDrive - Full Stack Cloud Storage Solution

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![React](https://img.shields.io/badge/Frontend-React-61DAFB) ![Django](https://img.shields.io/badge/Backend-Django-092E20) ![Kubernetes](https://img.shields.io/badge/Orchestration-Kubernetes-326CE5)

**NexusDrive**, modern web teknolojileri kullanılarak geliştirilmiş, güvenli, ölçeklenebilir ve kullanıcı dostu bir dosya depolama ve yönetim sistemidir (Google Drive Klonu).

Bu proje; dosya versiyonlama, çoklu yükleme, sürükle-bırak desteği ve detaylı dosya yönetim özellikleriyle kurumsal standartlarda bir deneyim sunar.

---

## 🌟 Özellikler

### 📂 Dosya ve Klasör Yönetimi
* **İç İçe Klasör Yapısı:** Sınırsız derinlikte klasör oluşturma ve gezinme (Breadcrumb navigasyonu ile).
* **Sürükle & Bırak (Drag & Drop):** Dosyaları ve klasörleri sürükleyerek yükleme veya taşıma.
* **Çoklu Yükleme (Bulk Upload):** Aynı anda yüzlerce dosyayı progress bar eşliğinde yükleme.
* **Gelişmiş Görünümler:** Izgara (Grid) ve Liste (List) görünümleri arasında anlık geçiş.
* **Hızlı Arama:** **Meilisearch** entegrasyonu ile milyonlarca dosya arasında milisaniyeler içinde arama.

### 🛡️ Güvenlik ve Paylaşım
* **İzole Alanlar:** Her kullanıcı sadece kendi dosyalarına erişebilir (JWT tabanlı kimlik doğrulama).
* **Bulut Depolama:** AWS S3 uyumlu **MinIO** ile yüksek performanslı nesne depolama.
* **Kubernetes (K8s):** Deployment, Service ve PVC yapılandırmaları ile tam konteyner orkestrasyonu.

### ⚙️ Gelişmiş Özellikler
* **Otomatik Thumbnail:** Yüklenen görseller için backend tarafında (Pillow) otomatik önizleme oluşturma.
* **Dosya Yaşam Döngüsü:** Yıldızlama, Spam Bildirme, Çöp Kutusu ve Geri Yükleme mekanizmaları.
* **Dinamik Kota Takibi:** Kullanılan alanı klasör boyutlarıyla birlikte hesaplayan akıllı sistem.
* **Backend & Depolama:** Dosyalar **MinIO (S3 Compatible)** üzerinde saklanır, veritabanı olarak **PostgreSQL** (Geliştirme) kullanılır.

---

## 🛠️ Teknoloji Yığını (Tech Stack)

- **Frontend:** React, Tailwind CSS, Axios
- **Backend:** Django REST Framework, PostgreSQL
- **Search Engine:** Meilisearch
- **Storage:** MinIO (S3 Compatible)
- **DevOps:** Docker, Kubernetes (K8s)
- **Monitoring:** Prometheus & Grafana

---

🚀 Kurulum Rehberi (Installation Guide)
Sistemi yerel ortamınızda iki farklı yöntemle ayağa kaldırabilirsiniz.
## 1. Yöntem: Kubernetes (Önerilen / Production-Ready)
Bu yöntemle projeyi tam bir Cluster mimarisinde çalıştırabilirsiniz.
Gereksinimler: Docker Desktop (Kubernetes Enabled) veya Minikube.Tüm ### 1. Servisleri Başlatın:
```bash
kubectl apply -f .
```
Bu komut; Backend, Frontend, Veritabanı, MinIO ve Meilisearch bileşenlerini otomatik olarak yapılandırır.
### Erişim İçin Tünelleri Açın (Port-Forward):
Servislere localhost üzerinden erişmek için aşağıdaki tünelleri ayrı terminallerde başlatın:
- **Frontend:** kubectl port-forward svc/frontend 3000:3000
- **Backend:** kubectl port-forward svc/backend 8000:8000
- **MinIO:** kubectl port-forward svc/minio 9001:9001

## 2. Yöntem: Docker Compose (Hızlı Başlatma)
Geliştirme aşamasında hızlıca ayağa kaldırmak için:
```bash
docker-compose up -d --build
```
🔗 Erişim ve Kimlik BilgileriSistem ayağa kalktıktan sonra aşağıdaki adreslerden bileşenlere erişebilirsiniz. Kubernetes modunda çalışıyorsanız, servis tünellerinin (port-forward) açık olduğundan emin olun.
| Servis | Adres | Kimlik Bilgileri |
| :--- | :--- | :--- |
| **Uygulama (Frontend)** | `http://localhost:3000` | - |
| **Backend API** | `http://localhost:8000/api/` | Kayıtlı Kullanıcı |
| **MinIO Console** | `http://localhost:9001` | **User:** `minioadmin` \| **Pass:** `minioadmin` |
| **Meilisearch** | `http://localhost:7700` | **Key:** `nexus_master_key` |
| **PostgreSQL** | `localhost:5432` | **User:** `nexus_user` \| **DB:** `nexus_drive` |
| **Prometheus** | `http://localhost:9090` | - |

⚠️ Önemli Not (İlk Kurulum)Sistemi ilk kez çalıştırdığınızda dosya yükleyebilmek için MinIO panelinde (localhost:9001) şu adımları yapmalısınız:
1. nexus-drive-bucket adında bir kova (bucket) oluşturun.
2. Kova ayarlarından Anonymous erişim politikasını Read and Write olarak güncelleyin.

## 🗺️ Geliştirme Yol Haritası (Development Roadmap)

Proje, modern bulut mimarisi standartlarına uygun olarak 3 ana fazda planlanmıştır. Şu an **Faz 1** ve **Faz 2**  tamamlanmış olup, **Faz 3** çalışmaları başlamıştır.

### ✅ Faz 1: Core Features & MVP (Tamamlandı)
*Kullanıcı odaklı temel özelliklerin ve uygulama mimarisinin oluşturulması.*
- [x] **Full Stack Mimarisi:** Django REST Framework ve React yapısının kurulması.
- [x] **Depolama Katmanı:** AWS S3 uyumlu **MinIO** entegrasyonu ve medya yönetimi.
- [x] **Gelişmiş Dosya Yönetimi:** Sürükle-bırak (Drag&Drop), çoklu dosya yükleme (Bulk Upload) ve iç içe klasör yapısı.
- [x] **UI/UX Optimizasyonu:** Dinamik breadcrumb navigasyonu, liste/ızgara görünümleri ve toast bildirimleri.
- [x] **Güvenlik:** JWT tabanlı kimlik doğrulama ve izole kullanıcı alanları.

### 🐳 Faz 2: DevOps & Containerization (Tamamlandı)
*Uygulamanın taşınabilirliğini ve üretim ortamına (Production) uygunluğunu artırma.*
- [x] **Dockerization:** Backend, Frontend ve MinIO servislerinin Docker imajlarının oluşturulması.
- [x] **Orchestration:** `docker-compose` ile tüm servislerin (App, DB, Storage) tek komutla ayağa kaldırılması.
- [x] **Veritabanı Migrasyonu:** Geliştirme veritabanından (SQLite) üretim veritabanına (**PostgreSQL**) geçiş.

### ✅ Faz 3: High Availability & Observability (Tamamlandı)
- [x] **Kubernetes Deployment:** Uygulamanın Cluster yapısına taşınması (Deployment, Service, PVC).
- [x] **Gelişmiş Arama:** Meilisearch ile tam metin arama (Full-text search) desteği.
- [x] **Monitoring:** Prometheus ve Grafana ile sistem metriklerinin izlenmesi.

📄 Lisans
Bu proje MIT lisansı ile lisanslanmıştır.

👨‍💻 Geliştirici: [Yusuf TUFAN]
