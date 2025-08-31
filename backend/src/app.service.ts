import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      message: 'İş Güvenliği Sistemi API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      keycloakRealm: process.env.KEYCLOAK_REALM || 'isguvenligi',
      features: [
        'Keycloak Authentication',
        'Multi-Session Support',
        'Social Login Integration',
        'Role-based Access Control',
        'Safety Records Management',
        'Training Records',
        'Audit Logging'
      ]
    };
  }

  getSystemInfo() {
    return {
      name: 'İş Güvenliği Sistemi',
      description: 'Kapsamlı iş güvenliği yönetim sistemi',
      version: '1.0.0',
      author: 'İş Güvenliği Ekibi',
      uptime: process.uptime(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      endpoints: {
        api: '/api',
        auth: '/auth',
        users: '/users',
        admin: '/admin',
        safety: '/safety',
        sessions: '/sessions'
      }
    };
  }
}