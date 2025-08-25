#!/bin/bash

# Sosyal Giriş Yapılandırma Scripti
# Bu script Google ve Microsoft OAuth yapılandırmasını otomatikleştirir

echo "🔐 Sosyal Giriş Yapılandırması Başlatılıyor..."

# Renkli çıktı için fonksiyonlar
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# .env dosyasından değerleri oku
if [ -f .env ]; then
    source .env
else
    print_error ".env dosyası bulunamadı!"
    exit 1
fi

# Keycloak'ın hazır olmasını bekle
print_info "Keycloak servisinin hazır olması bekleniyor..."
until curl -f http://localhost:8080/health/ready > /dev/null 2>&1; do
    echo "Keycloak henüz hazır değil, bekleniyor..."
    sleep 5
done
print_success "Keycloak hazır!"

# Keycloak admin token al
print_info "Keycloak admin token alınıyor..."
ADMIN_TOKEN=$(curl -s -X POST \
  "http://localhost:8080/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" \
  -d "username=${KEYCLOAK_ADMIN}" \
  -d "password=${KEYCLOAK_ADMIN_PASSWORD}" \
  | jq -r '.access_token')

if [ "$ADMIN_TOKEN" = "null" ] || [ -z "$ADMIN_TOKEN" ]; then
    print_error "Admin token alınamadı!"
    exit 1
fi
print_success "Admin token alındı!"

# Google Identity Provider'ı yapılandır
setup_google_provider() {
    print_info "Google Identity Provider yapılandırılıyor..."
    
    if [ -z "$GOOGLE_CLIENT_ID" ] || [ "$GOOGLE_CLIENT_ID" = "your-google-client-id" ]; then
        print_warning "Google Client ID bulunamadı. Google yapılandırması atlanıyor."
        print_info "Google OAuth yapılandırması için:"
        echo "  1. https://console.cloud.google.com/ adresine gidin"
        echo "  2. Yeni proje oluşturun veya mevcut projeyi seçin"
        echo "  3. APIs & Services > Credentials bölümüne gidin"
        echo "  4. OAuth 2.0 Client IDs oluşturun"
        echo "  5. Authorized redirect URIs'ye şunu ekleyin:"
        echo "     http://localhost:8080/realms/isguvenligi/broker/google/endpoint"
        echo "  6. .env dosyasında GOOGLE_CLIENT_ID ve GOOGLE_CLIENT_SECRET değerlerini güncelleyin"
        return 1
    fi

    # Google provider'ı oluştur/güncelle
    GOOGLE_CONFIG='{
        "alias": "google",
        "displayName": "Google",
        "providerId": "google",
        "enabled": true,
        "updateProfileFirstLoginMode": "on",
        "trustEmail": true,
        "storeToken": false,
        "addReadTokenRoleOnCreate": false,
        "authenticateByDefault": false,
        "linkOnly": false,
        "firstBrokerLoginFlowAlias": "first broker login",
        "config": {
            "syncMode": "IMPORT",
            "clientId": "'$GOOGLE_CLIENT_ID'",
            "clientSecret": "'$GOOGLE_CLIENT_SECRET'",
            "acceptsPromptNoneForwardFromClient": "false"
        }
    }'

    # Mevcut provider'ı kontrol et
    EXISTING_GOOGLE=$(curl -s -X GET \
        "http://localhost:8080/admin/realms/isguvenligi/identity-provider/instances/google" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -H "Content-Type: application/json")

    if echo "$EXISTING_GOOGLE" | jq -e '.alias' > /dev/null 2>&1; then
        # Güncelle
        print_info "Mevcut Google provider güncelleniyor..."
        curl -s -X PUT \
            "http://localhost:8080/admin/realms/isguvenligi/identity-provider/instances/google" \
            -H "Authorization: Bearer $ADMIN_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$GOOGLE_CONFIG" > /dev/null
    else
        # Oluştur
        print_info "Yeni Google provider oluşturuluyor..."
        curl -s -X POST \
            "http://localhost:8080/admin/realms/isguvenligi/identity-provider/instances" \
            -H "Authorization: Bearer $ADMIN_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$GOOGLE_CONFIG" > /dev/null
    fi

    print_success "Google provider yapılandırıldı!"
}

# Microsoft Identity Provider'ı yapılandır
setup_microsoft_provider() {
    print_info "Microsoft Identity Provider yapılandırılıyor..."
    
    if [ -z "$MICROSOFT_CLIENT_ID" ] || [ "$MICROSOFT_CLIENT_ID" = "your-microsoft-client-id" ]; then
        print_warning "Microsoft Client ID bulunamadı. Microsoft yapılandırması atlanıyor."
        print_info "Microsoft OAuth yapılandırması için:"
        echo "  1. https://portal.azure.com/ adresine gidin"
        echo "  2. Azure Active Directory > App registrations bölümüne gidin"
        echo "  3. New registration ile yeni uygulama kaydı oluşturun"
        echo "  4. Redirect URI'ye şunu ekleyin:"
        echo "     http://localhost:8080/realms/isguvenligi/broker/microsoft/endpoint"
        echo "  5. Certificates & secrets bölümünden client secret oluşturun"
        echo "  6. .env dosyasında MICROSOFT_CLIENT_ID ve MICROSOFT_CLIENT_SECRET değerlerini güncelleyin"
        return 1
    fi

    # Microsoft provider'ı oluştur/güncelle
    MICROSOFT_CONFIG='{
        "alias": "microsoft",
        "displayName": "Microsoft",
        "providerId": "microsoft",
        "enabled": true,
        "updateProfileFirstLoginMode": "on",
        "trustEmail": true,
        "storeToken": false,
        "addReadTokenRoleOnCreate": false,
        "authenticateByDefault": false,
        "linkOnly": false,
        "firstBrokerLoginFlowAlias": "first broker login",
        "config": {
            "syncMode": "IMPORT",
            "clientId": "'$MICROSOFT_CLIENT_ID'",
            "clientSecret": "'$MICROSOFT_CLIENT_SECRET'"
        }
    }'

    # Mevcut provider'ı kontrol et
    EXISTING_MICROSOFT=$(curl -s -X GET \
        "http://localhost:8080/admin/realms/isguvenligi/identity-provider/instances/microsoft" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -H "Content-Type: application/json")

    if echo "$EXISTING_MICROSOFT" | jq -e '.alias' > /dev/null 2>&1; then
        # Güncelle
        print_info "Mevcut Microsoft provider güncelleniyor..."
        curl -s -X PUT \
            "http://localhost:8080/admin/realms/isguvenligi/identity-provider/instances/microsoft" \
            -H "Authorization: Bearer $ADMIN_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$MICROSOFT_CONFIG" > /dev/null
    else
        # Oluştur
        print_info "Yeni Microsoft provider oluşturuluyor..."
        curl -s -X POST \
            "http://localhost:8080/admin/realms/isguvenligi/identity-provider/instances" \
            -H "Authorization: Bearer $ADMIN_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$MICROSOFT_CONFIG" > /dev/null
    fi

    print_success "Microsoft provider yapılandırıldı!"
}

# Sosyal provider'ları veritabanında güncelle
update_database_settings() {
    print_info "Veritabanı ayarları güncelleniyor..."
    
    # PostgreSQL'e bağlan ve ayarları güncelle
    docker-compose exec -T postgres psql -U admin -d isguvenligi <<EOF
-- Google ayarlarını güncelle
UPDATE social_login_settings 
SET is_enabled = $([ ! -z "$GOOGLE_CLIENT_ID" ] && [ "$GOOGLE_CLIENT_ID" != "your-google-client-id" ] && echo "true" || echo "false"),
    client_id = '$GOOGLE_CLIENT_ID',
    client_secret = '$GOOGLE_CLIENT_SECRET'
WHERE provider = 'google';

-- Microsoft ayarlarını güncelle
UPDATE social_login_settings 
SET is_enabled = $([ ! -z "$MICROSOFT_CLIENT_ID" ] && [ "$MICROSOFT_CLIENT_ID" != "your-microsoft-client-id" ] && echo "true" || echo "false"),
    client_id = '$MICROSOFT_CLIENT_ID',
    client_secret = '$MICROSOFT_CLIENT_SECRET'
WHERE provider = 'microsoft';
EOF

    print_success "Veritabanı ayarları güncellendi!"
}

# Ana fonksiyon
main() {
    print_info "Sosyal giriş yapılandırması başlatılıyor..."
    
    # jq'nun yüklü olup olmadığını kontrol et
    if ! command -v jq &> /dev/null; then
        print_error "jq yüklü değil. Lütfen jq'yu yükleyin: apt-get install jq veya brew install jq"
        exit 1
    fi

    # Sosyal provider'ları yapılandır
    setup_google_provider
    setup_microsoft_provider
    
    # Veritabanı ayarlarını güncelle
    update_database_settings
    
    print_success "Sosyal giriş yapılandırması tamamlandı!"
    print_info "Kullanılabilir sosyal giriş seçenekleri:"
    
    if [ ! -z "$GOOGLE_CLIENT_ID" ] && [ "$GOOGLE_CLIENT_ID" != "your-google-client-id" ]; then
        echo "  ✅ Google"
    else
        echo "  ❌ Google (yapılandırılmadı)"
    fi
    
    if [ ! -z "$MICROSOFT_CLIENT_ID" ] && [ "$MICROSOFT_CLIENT_ID" != "your-microsoft-client-id" ]; then
        echo "  ✅ Microsoft"
    else
        echo "  ❌ Microsoft (yapılandırılmadı)"
    fi
    
    echo ""
    print_info "Giriş sayfası: http://localhost:3000/auth/login"
    print_info "Keycloak Admin: http://localhost:8080/admin/"
}

# Scripti çalıştır
main "$@"