#!/bin/bash

# Keycloak İş Güvenliği Sistemi Durdurma Scripti
# Bu script Keycloak sunucusunu ve PostgreSQL veritabanını durdurur

echo "🛑 Keycloak İş Güvenliği Sistemi durduruluyor..."

# Container'ları durdur
docker-compose down

echo "✅ Sistem başarıyla durduruldu!"
echo ""
echo "ℹ️  Veri korundu. Sistemi yeniden başlatmak için './start.sh' çalıştırın."
echo ""
echo "🗑️  Tüm verileri silmek istiyorsanız:"
echo "   docker-compose down -v"