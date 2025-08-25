#!/bin/bash

# Keycloak İş Güvenliği Sistemi Yedekleme Scripti
# Bu script veritabanını ve realm yapılandırmasını yedekler

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="keycloak_backup_$DATE"

echo "💾 Keycloak İş Güvenliği Sistemi yedekleniyor..."

# Yedekleme klasörü oluştur
mkdir -p $BACKUP_DIR

# PostgreSQL veritabanını yedekle
echo "🗄️  PostgreSQL veritabanı yedekleniyor..."
docker-compose exec -T postgres pg_dump -U keycloak keycloak > "$BACKUP_DIR/${BACKUP_FILE}_database.sql"

# Realm yapılandırmasını export et
echo "🔐 Keycloak realm yapılandırması export ediliyor..."
docker-compose exec keycloak /opt/keycloak/bin/kc.sh export --dir /tmp --realm isguvenligi --users realm_file

# Export edilen dosyayı kopyala
docker cp keycloak-server:/tmp/isguvenligi-realm.json "$BACKUP_DIR/${BACKUP_FILE}_realm.json"

# Yapılandırma dosyalarını yedekle
echo "⚙️  Yapılandırma dosyaları yedekleniyor..."
cp docker-compose.yml "$BACKUP_DIR/${BACKUP_FILE}_docker-compose.yml"
cp .env "$BACKUP_DIR/${BACKUP_FILE}_env"
cp realm-export.json "$BACKUP_DIR/${BACKUP_FILE}_initial-realm.json"

# Yedekleme arşivi oluştur
echo "📦 Yedekleme arşivi oluşturuluyor..."
cd $BACKUP_DIR
tar -czf "${BACKUP_FILE}.tar.gz" ${BACKUP_FILE}*
rm ${BACKUP_FILE}_*

cd ..

echo "✅ Yedekleme tamamlandı!"
echo "📁 Yedekleme dosyası: $BACKUP_DIR/${BACKUP_FILE}.tar.gz"
echo ""
echo "📝 Yedeklemeyi geri yüklemek için restore.sh scriptini kullanın."