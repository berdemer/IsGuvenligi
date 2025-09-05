# 🚀 İş Güvenliği Mikroservis Mimarisi

## 🏗️ **Sistem Mimarisi Genel Bakış**

### **Mevcut Monolitik Yapıdan Mikroservis Geçişi:**

```
MEVCUT DURUM (Monolitik)
├── Frontend (Next.js)
├── Backend (Express.js/Keycloak)
└── PostgreSQL Database

HEDEF DURUM (Mikroservis)
├── API Gateway (Kong/Nginx)
├── Core Services
│   ├── AuthN/AuthZ Service
│   ├── User Management Service
│   └── Organization Service
├── Domain Services
│   ├── İş Güvenliği Service
│   ├── İnsan Kaynakları Service
│   └── İşyeri Hekimi Service
├── Frontend Applications
│   ├── İG Admin Panel
│   ├── İK Admin Panel
│   └── Hekim Panel
└── Infrastructure Services
    ├── PostgreSQL Cluster
    ├── Redis Cluster
    ├── Keycloak
    └── Elasticsearch
```

---

## 🔐 **Merkezi AuthN/AuthZ Servisi**

### **Core Authentication Service:**

```typescript
// AuthN/AuthZ Service API Endpoints
POST /auth/login                    # Login
POST /auth/logout                   # Logout
POST /auth/refresh                  # Token refresh
GET  /auth/me                       # Current user
POST /auth/verify                   # Token verification

// Authorization Endpoints
GET  /authz/permissions/:userId     # User permissions
POST /authz/check                   # Permission check
GET  /authz/roles                   # Available roles
POST /authz/assign-role             # Role assignment
```

### **Service Structure:**
```
auth-service/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── authz.controller.ts
│   │   └── user.controller.ts
│   ├── services/
│   │   ├── keycloak.service.ts
│   │   ├── jwt.service.ts
│   │   └── permission.service.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   └── rbac.middleware.ts
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── role.model.ts
│   │   └── permission.model.ts
│   └── utils/
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

---

## 🏢 **Domain Services**

### **1. İş Güvenliği Service:**
```typescript
// İG Service Endpoints
GET    /ig/policies                 # Güvenlik politikaları
POST   /ig/policies                 # Politika oluştur
GET    /ig/incidents               # Olaylar
POST   /ig/incidents               # Olay kaydet
GET    /ig/trainings               # Eğitimler
GET    /ig/audits                  # Denetimler
```

### **2. İnsan Kaynakları Service:**
```typescript
// İK Service Endpoints  
GET    /ik/employees               # Çalışanlar
POST   /ik/employees               # Çalışan ekle
GET    /ik/departments             # Departmanlar
GET    /ik/positions               # Pozisyonlar
GET    /ik/leave-requests          # İzin talepleri
POST   /ik/performance-reviews     # Performans değerlendirmeleri
```

### **3. İşyeri Hekimi Service:**
```typescript
// Hekim Service Endpoints
GET    /hekim/health-records       # Sağlık kayıtları
POST   /hekim/health-records       # Kayıt ekle
GET    /hekim/medical-exams        # Tıbbi muayeneler
GET    /hekim/health-reports       # Sağlık raporları
POST   /hekim/appointments         # Randevu sistemi
```

---

## 🐳 **Docker Compose Yapılandırması**

### **Ana Docker Compose Dosyası:**

```yaml
# docker-compose.yml
version: '3.8'

services:
  # API Gateway
  api-gateway:
    image: kong:latest
    container_name: api-gateway
    environment:
      KONG_DATABASE: postgres
      KONG_PG_HOST: postgres
      KONG_PG_DATABASE: kong
      KONG_PG_USER: kong
      KONG_PG_PASSWORD: kong123
    ports:
      - "8000:8000"
      - "8443:8443"
      - "8001:8001"
      - "8444:8444"
    depends_on:
      - postgres
    networks:
      - microservices-network

  # Core Services
  auth-service:
    build: ./services/auth-service
    container_name: auth-service
    environment:
      DATABASE_URL: postgresql://auth:auth123@postgres:5432/auth_db
      KEYCLOAK_URL: http://keycloak:8080
      REDIS_URL: redis://redis:6379
      JWT_SECRET: your-super-secret-key
    ports:
      - "3001:3000"
    depends_on:
      - postgres
      - keycloak
      - redis
    networks:
      - microservices-network

  user-service:
    build: ./services/user-service
    container_name: user-service
    environment:
      DATABASE_URL: postgresql://users:users123@postgres:5432/users_db
      AUTH_SERVICE_URL: http://auth-service:3000
    ports:
      - "3002:3000"
    depends_on:
      - postgres
      - auth-service
    networks:
      - microservices-network

  # Domain Services
  ig-service:
    build: ./services/ig-service
    container_name: ig-service
    environment:
      DATABASE_URL: postgresql://ig:ig123@postgres:5432/ig_db
      AUTH_SERVICE_URL: http://auth-service:3000
    ports:
      - "3003:3000"
    depends_on:
      - postgres
      - auth-service
    networks:
      - microservices-network

  ik-service:
    build: ./services/ik-service
    container_name: ik-service
    environment:
      DATABASE_URL: postgresql://ik:ik123@postgres:5432/ik_db
      AUTH_SERVICE_URL: http://auth-service:3000
    ports:
      - "3004:3000"
    depends_on:
      - postgres
      - auth-service
    networks:
      - microservices-network

  hekim-service:
    build: ./services/hekim-service
    container_name: hekim-service
    environment:
      DATABASE_URL: postgresql://hekim:hekim123@postgres:5432/hekim_db
      AUTH_SERVICE_URL: http://auth-service:3000
    ports:
      - "3005:3000"
    depends_on:
      - postgres
      - auth-service
    networks:
      - microservices-network

  # Frontend Applications
  ig-frontend:
    build: ./frontends/ig-admin
    container_name: ig-frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
      NEXT_PUBLIC_AUTH_URL: http://localhost:3001
    ports:
      - "3000:3000"
    depends_on:
      - api-gateway
    networks:
      - microservices-network

  ik-frontend:
    build: ./frontends/ik-admin
    container_name: ik-frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
      NEXT_PUBLIC_AUTH_URL: http://localhost:3001
    ports:
      - "3010:3000"
    depends_on:
      - api-gateway
    networks:
      - microservices-network

  # Infrastructure Services
  postgres:
    image: postgres:15-alpine
    container_name: postgres-cluster
    environment:
      POSTGRES_DB: main_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-databases.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    networks:
      - microservices-network

  keycloak:
    image: quay.io/keycloak/keycloak:latest
    container_name: keycloak
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin123
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak_db
      KC_DB_USERNAME: keycloak
      KC_DB_PASSWORD: keycloak123
    command: start-dev
    ports:
      - "8080:8080"
    depends_on:
      - postgres
    networks:
      - microservices-network

  redis:
    image: redis:7-alpine
    container_name: redis-cluster
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - microservices-network

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
    container_name: elasticsearch
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    networks:
      - microservices-network

volumes:
  postgres_data:
  redis_data:
  elasticsearch_data:

networks:
  microservices-network:
    driver: bridge
```

---

## 🗄️ **Database Schema Design**

### **Merkezi Auth Database:**
```sql
-- auth_db schema
CREATE DATABASE auth_db;

-- Users table (merkezi kullanıcı yönetimi)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keycloak_id VARCHAR UNIQUE NOT NULL,
    username VARCHAR UNIQUE NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    code VARCHAR UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User-Organization relationship
CREATE TABLE user_organizations (
    user_id UUID REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    role VARCHAR NOT NULL,
    PRIMARY KEY (user_id, organization_id)
);

-- Roles and Permissions
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR UNIQUE NOT NULL,
    description TEXT,
    service VARCHAR NOT NULL -- 'auth', 'ig', 'ik', 'hekim'
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR UNIQUE NOT NULL,
    resource VARCHAR NOT NULL,
    action VARCHAR NOT NULL,
    service VARCHAR NOT NULL
);

CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id),
    permission_id UUID REFERENCES permissions(id),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id),
    role_id UUID REFERENCES roles(id),
    organization_id UUID REFERENCES organizations(id),
    PRIMARY KEY (user_id, role_id, organization_id)
);
```

### **Domain-Specific Databases:**
```sql
-- ig_db (İş Güvenliği)
CREATE DATABASE ig_db;
-- İG specific tables...

-- ik_db (İnsan Kaynakları) 
CREATE DATABASE ik_db;
-- İK specific tables...

-- hekim_db (İşyeri Hekimi)
CREATE DATABASE hekim_db;
-- Hekim specific tables...
```

---

## 🔄 **API Gateway Configuration (Kong)**

### **Kong Routing Rules:**
```yaml
# kong-config.yml
services:
  - name: auth-service
    url: http://auth-service:3000
    routes:
      - name: auth-route
        paths: ["/auth", "/authz"]
        
  - name: ig-service
    url: http://ig-service:3000
    routes:
      - name: ig-route
        paths: ["/ig"]
        plugins:
          - name: jwt
            config:
              secret_is_base64: false
              
  - name: ik-service
    url: http://ik-service:3000
    routes:
      - name: ik-route
        paths: ["/ik"]
        plugins:
          - name: jwt
          - name: rbac
            
  - name: hekim-service
    url: http://hekim-service:3000
    routes:
      - name: hekim-route
        paths: ["/hekim"]
        plugins:
          - name: jwt
          - name: rbac
```

---

## 📱 **Frontend Uygulamaları**

### **Paylaşılan UI Kütüphanesi:**
```
shared-ui/
├── components/
│   ├── Layout/
│   ├── Auth/
│   ├── Forms/
│   └── Common/
├── hooks/
│   ├── useAuth.ts
│   ├── usePermissions.ts
│   └── useAPI.ts
├── utils/
├── types/
└── package.json
```

### **Domain-Specific Frontend Apps:**
```
frontends/
├── ig-admin/                 # İş Güvenliği Admin Panel
├── ik-admin/                 # İK Admin Panel  
├── hekim-panel/              # İşyeri Hekimi Panel
├── mobile-app/               # React Native Mobile
└── shared-ui/                # Paylaşılan UI komponenleri
```

---

## 🚀 **Deployment Strategy**

### **Development Environment:**
```bash
# Tüm servisleri başlat
docker-compose -f docker-compose.dev.yml up -d

# Sadece core servisleri başlat
docker-compose up auth-service user-service postgres keycloak redis

# Specific service development
docker-compose up ig-service ig-frontend
```

### **Production Environment:**
```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# Kubernetes deployment (gelecekte)
kubectl apply -f k8s/
```

---

## 📊 **Service Communication Patterns**

### **Synchronous Communication (REST API):**
```typescript
// Service-to-Service REST calls
class AuthService {
  async validateToken(token: string): Promise<User> {
    const response = await fetch(`${AUTH_SERVICE_URL}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.json();
  }
}
```

### **Asynchronous Communication (Event-Driven):**
```typescript
// Event publishing
class UserService {
  async createUser(userData: CreateUserDTO) {
    const user = await this.userRepository.create(userData);
    
    // Publish event to other services
    await this.eventBus.publish('user.created', {
      userId: user.id,
      organizationId: user.organizationId,
      roles: user.roles
    });
    
    return user;
  }
}
```

---

## 🔐 **Security Architecture**

### **JWT Token Flow:**
```
1. User Login → Auth Service → Keycloak
2. Keycloak → JWT Token → Auth Service  
3. Auth Service → Enhanced JWT → Frontend
4. Frontend → API Request + JWT → API Gateway
5. API Gateway → Token Validation → Auth Service
6. Auth Service → Permission Check → Domain Service
```

### **RBAC Implementation:**
```typescript
// Permission-based access control
@Controller('ig')
@UseGuards(JwtAuthGuard)
export class IgController {
  
  @Get('policies')
  @RequirePermission('ig:policies:read')
  async getPolicies() {
    // Implementation
  }
  
  @Post('policies')
  @RequirePermission('ig:policies:create')
  async createPolicy() {
    // Implementation
  }
}
```

---

## 📈 **Monitoring & Observability**

### **Service Monitoring:**
```yaml
# Prometheus + Grafana + Jaeger
services:
  prometheus:
    image: prom/prometheus
    ports: ["9090:9090"]
    
  grafana:
    image: grafana/grafana
    ports: ["3001:3000"]
    
  jaeger:
    image: jaegertracing/all-in-one
    ports: ["16686:16686"]
```

### **Health Checks:**
```typescript
// Health check endpoints for each service
@Get('health')
async healthCheck() {
  return {
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'auth-service',
    version: '1.0.0',
    dependencies: {
      database: await this.checkDatabase(),
      keycloak: await this.checkKeycloak(),
      redis: await this.checkRedis()
    }
  };
}
```

---

## 🎯 **Migration Strategy**

### **Phase 1: Core Services (2-3 hafta)**
1. ✅ Auth Service extraction
2. ✅ User Management Service
3. ✅ API Gateway setup
4. ✅ Database restructuring

### **Phase 2: Domain Services (3-4 hafta)**  
1. ✅ İG Service migration
2. ✅ İK Service development
3. ✅ Hekim Service development
4. ✅ Frontend adaptations

### **Phase 3: Enhancement (2-3 hafta)**
1. ✅ Event-driven architecture
2. ✅ Advanced monitoring
3. ✅ Performance optimization
4. ✅ Production deployment

---

## 💡 **Advantages of This Architecture**

### **Scalability:**
- Her servis bağımsız olarak scale edilebilir
- Yük dağılımı optimize edilebilir
- Resource allocation'ı flexible

### **Maintainability:**
- Domain-specific development teams
- Independent deployment cycles  
- Technology stack diversity

### **Security:**
- Merkezi authentication & authorization
- Service-level security policies
- Granular permission control

### **Business Value:**
- Rapid feature development
- Multi-tenant support ready
- Easy integration with 3rd party systems

---

**Bu mimari mevcut İG admin panelini koruyarak, yatay genişleme imkanı sunar ve enterprise-ready bir sistem oluşturur.**