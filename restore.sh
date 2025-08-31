#!/bin/bash

# Keycloak İş Güvenliği Sistemi Geri Yükleme Scripti
# Bu script yedeklenen veritabanını ve realm yapılandırmasını geri yükler

BACKUP_DIR="./backups"

echo "🔄 Keycloak İş Güvenliği Sistemi yedekten geri yükleniyor..."

# Yedekleme dosyasını seç
if [ $# -eq 0 ]; then
    echo "📁 Mevcut yedekleme dosyaları:"
    ls -la $BACKUP_DIR/*.tar.gz 2>/dev/null || echo "Yedekleme dosyası bulunamadı!"
    echo ""
    echo "Kullanım: ./restore.sh [yedekleme_dosyası.tar.gz]"
    exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    echo "❌ Yedekleme dosyası bulunamadı: $BACKUP_DIR/$BACKUP_FILE"
    exit 1
fi

# Sistemi durdur
echo "🛑 Sistem durduruluyor..."
docker-compose down

# Yedekleme arşivini aç
echo "📦 Yedekleme arşivi açılıyor..."
cd $BACKUP_DIR
tar -xzf $BACKUP_FILE

# Dosya adlarını bul
BACKUP_BASE=$(basename $BACKUP_FILE .tar.gz)

# PostgreSQL veritabanını geri yükle
echo "🗄️  PostgreSQL veritabanı geri yükleniyor..."
cd ..
docker-compose up -d postgres
sleep 10

# Veritabanını temizle ve yeniden oluştur
docker-compose exec postgres dropdb -U keycloak keycloak 2>/dev/null || true
docker-compose exec postgres createdb -U keycloak keycloak

# Yedeklenen veritabanını geri yükle
docker-compose exec -T postgres psql -U keycloak keycloak < "$BACKUP_DIR/${BACKUP_BASE}_database.sql"

# Keycloak'ı başlat
echo "🔐 Keycloak başlatılıyor..."
docker-compose up -d keycloak

# Keycloak'ın hazır olmasını bekle
echo "⏳ Keycloak hazır olmasını bekleniyor..."
until curl -f http://localhost:8080/health/ready > /dev/null 2>&1; do
    echo "Keycloak henüz hazır değil, bekleniyor..."
    sleep 5
done

# Realm yapılandırmasını import et (eğer varsa)
if [ -f "$BACKUP_DIR/${BACKUP_BASE}_realm.json" ]; then
    echo "🔐 Realm yapılandırması import ediliyor..."
    docker cp "$BACKUP_DIR/${BACKUP_BASE}_realm.json" keycloak-server:/tmp/restore-realm.json
    docker-compose exec keycloak /opt/keycloak/bin/kc.sh import --file /tmp/restore-realm.json --override true
fi

# Geçici dosyaları temizle
rm -f $BACKUP_DIR/${BACKUP_BASE}_*

echo "✅ Geri yükleme tamamlandı!"
echo "🌐 Keycloak Admin Console: http://localhost:8080"