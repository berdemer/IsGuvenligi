#!/bin/bash

# Keycloak İş Güvenliği Sistemi Başlatma Scripti
# Bu script Keycloak sunucusunu ve PostgreSQL veritabanını başlatır

echo "🔐 Keycloak İş Güvenliği Sistemi Başlatılıyor..."

# .env dosyasının varlığını kontrol et
if [ ! -f .env ]; then
    echo "⚠️  .env dosyası bulunamadı. .env.example dosyasından kopyalayın ve düzenleyin."
    cp .env.example .env
    echo "✅ .env dosyası oluşturuldu. Lütfen gerekli ayarları yapın."
fi

# Docker ve Docker Compose'un yüklü olduğunu kontrol et
if ! command -v docker &> /dev/null; then
    echo "❌ Docker yüklü değil. Lütfen Docker'ı yükleyin."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose yüklü değil. Lütfen Docker Compose'u yükleyin."
    exit 1
fi

# Önceki container'ları temizle
echo "🧹 Eski container'lar temizleniyor..."
docker-compose down

# Yeni container'ları başlat
echo "🚀 Container'lar başlatılıyor..."
docker-compose up -d

# Servislerin başlamasını bekle
echo "⏳ Servisler başlatılıyor, lütfen bekleyin..."
sleep 10

# PostgreSQL'in hazır olmasını bekle
echo "🗄️  PostgreSQL hazır olmasını bekleniyor..."
until docker-compose exec postgres pg_isready -U keycloak; do
    echo "PostgreSQL henüz hazır değil, bekleniyor..."
    sleep 2
done

# Keycloak'ın hazır olmasını bekle
echo "🔐 Keycloak hazır olmasını bekleniyor..."
until curl -f http://localhost:8080/health/ready > /dev/null 2>&1; do
    echo "Keycloak henüz hazır değil, bekleniyor..."
    sleep 5
done

echo "✅ Sistem başarıyla başlatıldı!"
echo ""
echo "🌐 Keycloak Admin Console: http://localhost:8080"
echo "👤 Admin Kullanıcı Adı: admin"
echo "🔑 Admin Şifresi: admin123"
echo ""
echo "📊 Sistem durumunu kontrol etmek için:"
echo "   docker-compose ps"
echo ""
echo "📝 Logları görüntülemek için:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Sistemi durdurmak için:"
echo "   docker-compose down"