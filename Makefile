.PHONY: help up down build logs clean reset install dev prod backup restore

# Renkli çıktı
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[1;33m
BLUE=\033[0;34m
NC=\033[0m # No Color

help: ## Kullanılabilir komutları göster
	@echo "$(BLUE)İş Güvenliği Sistemi - Makefile Komutları$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "$(GREEN)%-15s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Tüm bağımlılıkları yükle
	@echo "$(BLUE)📦 Bağımlılıklar yükleniyor...$(NC)"
	@cd backend && npm install
	@cd frontend && npm install
	@echo "$(GREEN)✅ Tüm bağımlılıklar yüklendi!$(NC)"

up: ## Tüm servisleri başlat
	@echo "$(BLUE)🚀 Servisler başlatılıyor...$(NC)"
	@docker-compose up -d
	@echo "$(GREEN)✅ Servisler başlatıldı!$(NC)"
	@echo "$(YELLOW)🌐 Frontend: http://localhost:3000$(NC)"
	@echo "$(YELLOW)🔧 Backend: http://localhost:3001$(NC)"
	@echo "$(YELLOW)🔐 Keycloak: http://localhost:8080$(NC)"

down: ## Tüm servisleri durdur
	@echo "$(BLUE)🛑 Servisler durduruluyor...$(NC)"
	@docker-compose down
	@echo "$(GREEN)✅ Servisler durduruldu!$(NC)"

build: ## Tüm container'ları yeniden oluştur
	@echo "$(BLUE)🔨 Container'lar oluşturuluyor...$(NC)"
	@docker-compose build --no-cache
	@echo "$(GREEN)✅ Container'lar oluşturuldu!$(NC)"

rebuild: down build up ## Servisleri durdur, yeniden oluştur ve başlat

logs: ## Tüm servislerin loglarını göster
	@docker-compose logs -f

logs-frontend: ## Sadece frontend loglarını göster
	@docker-compose logs -f frontend

logs-backend: ## Sadece backend loglarını göster
	@docker-compose logs -f backend

logs-keycloak: ## Sadece Keycloak loglarını göster
	@docker-compose logs -f keycloak

logs-postgres: ## Sadece PostgreSQL loglarını göster
	@docker-compose logs -f postgres

status: ## Servislerin durumunu kontrol et
	@echo "$(BLUE)📊 Servis durumları:$(NC)"
	@docker-compose ps

clean: ## Tüm volume'ları ve container'ları temizle
	@echo "$(RED)🧹 Sistem temizleniyor... (UYARI: Tüm veriler silinecek!)$(NC)"
	@read -p "Devam etmek istediğinizden emin misiniz? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v --remove-orphans; \
		docker system prune -f; \
		echo "$(GREEN)✅ Sistem temizlendi!$(NC)"; \
	else \
		echo "$(YELLOW)İşlem iptal edildi.$(NC)"; \
	fi

reset: clean build up ## Sistemi tamamen sıfırla ve yeniden başlat

dev: ## Geliştirme ortamını başlat
	@echo "$(BLUE)💻 Geliştirme ortamı başlatılıyor...$(NC)"
	@docker-compose -f docker-compose.yml up -d
	@echo "$(GREEN)✅ Geliştirme ortamı hazır!$(NC)"

prod: ## Production ortamını başlat
	@echo "$(BLUE)🏭 Production ortamı başlatılıyor...$(NC)"
	@docker-compose -f docker-compose.prod.yml up -d
	@echo "$(GREEN)✅ Production ortamı hazır!$(NC)"

shell-backend: ## Backend container'ına shell erişimi
	@docker-compose exec backend sh

shell-frontend: ## Frontend container'ına shell erişimi
	@docker-compose exec frontend sh

shell-postgres: ## PostgreSQL container'ına shell erişimi
	@docker-compose exec postgres psql -U admin -d isguvenligi

shell-redis: ## Redis container'ına shell erişimi
	@docker-compose exec redis redis-cli

backup: ## Veritabanını yedekle
	@echo "$(BLUE)💾 Veritabanı yedekleniyor...$(NC)"
	@./scripts/backup.sh
	@echo "$(GREEN)✅ Yedekleme tamamlandı!$(NC)"

restore: ## Veritabanını geri yükle
	@echo "$(BLUE)📥 Veritabanı geri yükleniyor...$(NC)"
	@./scripts/restore.sh
	@echo "$(GREEN)✅ Geri yükleme tamamlandı!$(NC)"

setup-social: ## Sosyal giriş ayarlarını yapılandır
	@echo "$(BLUE)🔐 Sosyal giriş yapılandırılıyor...$(NC)"
	@./scripts/setup-social-login.sh
	@echo "$(GREEN)✅ Sosyal giriş yapılandırıldı!$(NC)"

test-backend: ## Backend testlerini çalıştır
	@echo "$(BLUE)🧪 Backend testleri çalıştırılıyor...$(NC)"
	@cd backend && npm test

test-frontend: ## Frontend testlerini çalıştır
	@echo "$(BLUE)🧪 Frontend testleri çalıştırılıyor...$(NC)"
	@cd frontend && npm test

test: test-backend test-frontend ## Tüm testleri çalıştır

lint-backend: ## Backend lint kontrolü
	@echo "$(BLUE)🔍 Backend lint kontrolü...$(NC)"
	@cd backend && npm run lint

lint-frontend: ## Frontend lint kontrolü
	@echo "$(BLUE)🔍 Frontend lint kontrolü...$(NC)"
	@cd frontend && npm run lint

lint: lint-backend lint-frontend ## Tüm lint kontrollerini çalıştır

update: ## Bağımlılıkları güncelle
	@echo "$(BLUE)🔄 Bağımlılıklar güncelleniyor...$(NC)"
	@cd backend && npm update
	@cd frontend && npm update
	@echo "$(GREEN)✅ Bağımlılıklar güncellendi!$(NC)"

health: ## Servislerin sağlık durumunu kontrol et
	@echo "$(BLUE)🏥 Sağlık kontrolü yapılıyor...$(NC)"
	@echo "Frontend:" && curl -f http://localhost:3000/api/health || echo "❌ Frontend erişilemez"
	@echo "Backend:" && curl -f http://localhost:3001/health || echo "❌ Backend erişilemez"
	@echo "Keycloak:" && curl -f http://localhost:8080/health/ready || echo "❌ Keycloak erişilemez"

monitor: ## Sistem kaynaklarını izle
	@echo "$(BLUE)📊 Sistem kaynakları izleniyor...$(NC)"
	@docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"

permissions: ## Script izinlerini düzelt
	@echo "$(BLUE)🔧 Script izinleri düzeltiliyor...$(NC)"
	@chmod +x scripts/*.sh
	@echo "$(GREEN)✅ İzinler düzeltildi!$(NC)"

info: ## Sistem bilgilerini göster
	@echo "$(BLUE)📋 İş Güvenliği Sistemi Bilgileri$(NC)"
	@echo ""
	@echo "🌐 Erişim Adresleri:"
	@echo "  Frontend:  http://localhost:3000"
	@echo "  Backend:   http://localhost:3001"
	@echo "  API Docs:  http://localhost:3001/api"
	@echo "  Keycloak:  http://localhost:8080"
	@echo "  Admin:     http://localhost:8080/admin/"
	@echo ""
	@echo "🔐 Varsayılan Giriş Bilgileri:"
	@echo "  Admin:     admin / Admin123!"
	@echo "  Keycloak:  admin / admin123"
	@echo ""
	@echo "💾 Veritabanı:"
	@echo "  PostgreSQL: localhost:5432"
	@echo "  Database:   isguvenligi"
	@echo "  User:       admin"
	@echo ""
	@echo "🔄 Redis:"
	@echo "  Host:       localhost:6379"

# İlk kurulum için özel komut
first-setup: permissions install build up setup-social ## İlk kurulum (tam otomatik)
	@echo "$(GREEN)🎉 İş Güvenliği Sistemi başarıyla kuruldu!$(NC)"
	@echo ""
	@make info