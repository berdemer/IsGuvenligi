-- Keycloak Database Initialization Script
-- This script will be automatically executed by PostgreSQL on first startup

-- Create the keycloak database if it doesn't exist
SELECT 'CREATE DATABASE keycloak'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'keycloak')\gexec

-- Connect to keycloak database
\c keycloak;

-- Create extensions that might be needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a specific schema for keycloak if needed
-- CREATE SCHEMA IF NOT EXISTS keycloak AUTHORIZATION keycloak;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE keycloak TO keycloak;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO keycloak;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO keycloak;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO keycloak;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO keycloak;