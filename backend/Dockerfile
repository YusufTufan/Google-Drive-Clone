# Hafif Python imajı
FROM python:3.11-slim

# Logları anlık görmek için
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Postgres için gerekli sistem kütüphaneleri
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Paketleri yükle
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Kodları kopyala
COPY . .

EXPOSE 8000

# Server'ı başlat
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]