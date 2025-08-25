FROM quay.io/keycloak/keycloak:23.0

# Copy realm configuration
COPY realm-export.json /opt/keycloak/data/import/

# Copy custom themes if any
# COPY themes/ /opt/keycloak/themes/

# Set environment variables
ENV KC_DB=postgres
ENV KC_FEATURES=token-exchange,admin-fine-grained-authz
ENV KC_CACHE=ispn
ENV KC_CACHE_STACK=kubernetes

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/health/ready || exit 1

# Run Keycloak
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]