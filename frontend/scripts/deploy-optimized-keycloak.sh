#!/bin/bash

# Optimized Keycloak Deployment Script
# This script deploys Keycloak with optimized configuration for preventing authentication service degradation

set -e

echo "🚀 Starting Optimized Keycloak Deployment..."

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting." >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose is required but not installed. Aborting." >&2; exit 1; }

# Set deployment directory
DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCKER_DIR="$DEPLOY_DIR/docker"

echo "📁 Deployment directory: $DEPLOY_DIR"

# Create necessary directories
mkdir -p "$DOCKER_DIR/keycloak/themes"
mkdir -p "$DOCKER_DIR/postgres"
mkdir -p "$DOCKER_DIR/logs"

# Set environment variables
export KEYCLOAK_DB_PASSWORD="${KEYCLOAK_DB_PASSWORD:-$(openssl rand -base64 32)}"
export KEYCLOAK_ADMIN_PASSWORD="${KEYCLOAK_ADMIN_PASSWORD:-$(openssl rand -base64 32)}"

echo "🔐 Generated secure passwords for Keycloak deployment"

# Stop existing containers if running
echo "🛑 Stopping existing Keycloak containers..."
docker-compose -f "$DOCKER_DIR/docker-compose.keycloak.yml" down --remove-orphans 2>/dev/null || true

# Remove old volumes if requested
if [[ "${CLEAN_VOLUMES:-false}" == "true" ]]; then
    echo "🗑️ Cleaning existing volumes..."
    docker volume rm isguvenligi_keycloak_data isguvenligi_postgres_data 2>/dev/null || true
fi

# Pull latest images
echo "📥 Pulling latest Docker images..."
docker-compose -f "$DOCKER_DIR/docker-compose.keycloak.yml" pull

# Start optimized Keycloak stack
echo "🚀 Starting optimized Keycloak stack..."
docker-compose -f "$DOCKER_DIR/docker-compose.keycloak.yml" up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
timeout=120
counter=0

while ! docker-compose -f "$DOCKER_DIR/docker-compose.keycloak.yml" exec -T postgres pg_isready -U keycloak -q; do
    sleep 2
    counter=$((counter + 2))
    if [ $counter -ge $timeout ]; then
        echo "❌ PostgreSQL failed to start within $timeout seconds"
        exit 1
    fi
done

echo "✅ PostgreSQL is ready"

# Wait for Keycloak
while ! curl -s http://localhost:8080/health/ready > /dev/null; do
    sleep 5
    counter=$((counter + 5))
    if [ $counter -ge $timeout ]; then
        echo "❌ Keycloak failed to start within $timeout seconds"
        exit 1
    fi
done

echo "✅ Keycloak is ready"

# Display deployment summary
echo ""
echo "🎉 Optimized Keycloak Deployment Complete!"
echo ""
echo "📊 Configuration Summary:"
echo "  - Memory allocation: 2GB-4GB"
echo "  - Connection pool: 10-50 connections"
echo "  - GC optimization: G1GC enabled"
echo "  - Health monitoring: Enabled"
echo "  - Metrics collection: Enabled"
echo ""
echo "🌐 Service URLs:"
echo "  - Keycloak Admin: http://localhost:8080/admin"
echo "  - Keycloak Health: http://localhost:8080/health/ready"
echo "  - PostgreSQL: localhost:5432"
echo ""
echo "🔐 Credentials (save these securely):"
echo "  - Keycloak Admin: admin / $KEYCLOAK_ADMIN_PASSWORD"
echo "  - Database: keycloak / $KEYCLOAK_DB_PASSWORD"
echo ""
echo "📝 Next Steps:"
echo "  1. Configure your application to use: http://localhost:8080"
echo "  2. Set up realm and clients in Keycloak Admin Console"
echo "  3. Monitor performance via Health & Monitoring dashboard"
echo "  4. Set up automated alerts for proactive monitoring"
echo ""
echo "🔧 Management Commands:"
echo "  - View logs: docker-compose -f $DOCKER_DIR/docker-compose.keycloak.yml logs -f"
echo "  - Stop services: docker-compose -f $DOCKER_DIR/docker-compose.keycloak.yml down"
echo "  - Restart: docker-compose -f $DOCKER_DIR/docker-compose.keycloak.yml restart keycloak"
echo ""

# Save credentials to secure file
cat > "$DOCKER_DIR/.env.keycloak" << EOF
KEYCLOAK_DB_PASSWORD=$KEYCLOAK_DB_PASSWORD
KEYCLOAK_ADMIN_PASSWORD=$KEYCLOAK_ADMIN_PASSWORD
EOF

chmod 600 "$DOCKER_DIR/.env.keycloak"
echo "💾 Credentials saved to $DOCKER_DIR/.env.keycloak (secure file)"

echo ""
echo "✅ Deployment successful! Your optimized Keycloak is now running."