-- İş Güvenliği Sistemi Veritabanı Başlatma Scripti
-- Bu script ana uygulama veritabanını ve Keycloak veritabanını hazırlar

-- Ana uygulama veritabanını oluştur
CREATE DATABASE isguvenligi;

-- Keycloak veritabanını oluştur
CREATE DATABASE keycloak;

-- İş Güvenliği veritabanına bağlan
\c isguvenligi;

-- UUID extension'ı etkinleştir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Kullanıcı oturumları tablosu (multi-session desteği için)
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    CONSTRAINT unique_user_session UNIQUE(user_id, session_id)
);

-- Kullanıcı profilleri tablosu (Keycloak'tan ek bilgiler için)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keycloak_user_id VARCHAR(255) UNIQUE NOT NULL,
    employee_id VARCHAR(50),
    department VARCHAR(100),
    position VARCHAR(100),
    phone VARCHAR(20),
    manager_id UUID REFERENCES user_profiles(id),
    hire_date DATE,
    is_active BOOLEAN DEFAULT true,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sosyal giriş ayarları tablosu
CREATE TABLE social_login_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(50) NOT NULL UNIQUE,
    is_enabled BOOLEAN DEFAULT false,
    client_id VARCHAR(255),
    client_secret TEXT,
    additional_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sistem ayarları tablosu
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string',
    is_public BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- İş güvenliği kayıtları tablosu
CREATE TABLE safety_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    record_type VARCHAR(50) NOT NULL, -- 'incident', 'training', 'inspection'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(20), -- 'low', 'medium', 'high', 'critical'
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'in_progress', 'closed'
    assigned_to VARCHAR(255),
    location VARCHAR(255),
    incident_date TIMESTAMP,
    reported_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_date TIMESTAMP,
    attachments JSONB DEFAULT '[]',
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Eğitim kayıtları tablosu
CREATE TABLE training_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    training_name VARCHAR(255) NOT NULL,
    training_type VARCHAR(100),
    trainer VARCHAR(255),
    training_date DATE,
    completion_date DATE,
    expiry_date DATE,
    status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'completed', 'expired'
    certificate_url VARCHAR(500),
    score INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Denetim kayıtları tablosu
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- İndeksler
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX idx_user_sessions_last_activity ON user_sessions(last_activity);

CREATE INDEX idx_user_profiles_keycloak_id ON user_profiles(keycloak_user_id);
CREATE INDEX idx_user_profiles_employee_id ON user_profiles(employee_id);
CREATE INDEX idx_user_profiles_department ON user_profiles(department);

CREATE INDEX idx_safety_records_user_id ON safety_records(user_id);
CREATE INDEX idx_safety_records_type ON safety_records(record_type);
CREATE INDEX idx_safety_records_status ON safety_records(status);
CREATE INDEX idx_safety_records_created_at ON safety_records(created_at);

CREATE INDEX idx_training_records_user_id ON training_records(user_id);
CREATE INDEX idx_training_records_status ON training_records(status);
CREATE INDEX idx_training_records_expiry ON training_records(expiry_date);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Varsayılan sosyal giriş sağlayıcıları
INSERT INTO social_login_settings (provider, is_enabled, additional_settings) VALUES 
('google', false, '{"scope": "openid email profile"}'),
('microsoft', false, '{"scope": "openid email profile"}');

-- Varsayılan sistem ayarları
INSERT INTO system_settings (setting_key, setting_value, setting_type, is_public, description) VALUES
('app_name', 'İş Güvenliği Sistemi', 'string', true, 'Uygulama adı'),
('company_name', 'Şirket Adı', 'string', true, 'Şirket adı'),
('max_sessions_per_user', '5', 'integer', false, 'Kullanıcı başına maksimum oturum sayısı'),
('session_timeout_minutes', '30', 'integer', false, 'Oturum zaman aşımı (dakika)'),
('password_expiry_days', '90', 'integer', false, 'Şifre geçerlilik süresi (gün)'),
('enable_2fa', 'true', 'boolean', false, 'İki faktörlü kimlik doğrulamayı etkinleştir');

-- Trigger fonksiyonu: updated_at alanını otomatik güncelle
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger'ları oluştur
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_social_login_settings_updated_at BEFORE UPDATE ON social_login_settings
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_safety_records_updated_at BEFORE UPDATE ON safety_records
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_training_records_updated_at BEFORE UPDATE ON training_records
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Keycloak veritabanına geç ve izinleri ayarla
\c keycloak;

-- Gerekli extension'ları etkinleştir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ana veritabanına geri dön
\c isguvenligi;

-- Yetkilendirme ve güvenlik
GRANT CONNECT ON DATABASE isguvenligi TO admin;
GRANT USAGE ON SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO admin;

-- Keycloak veritabanı yetkileri
\c keycloak;
GRANT CONNECT ON DATABASE keycloak TO admin;
GRANT USAGE ON SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO admin;