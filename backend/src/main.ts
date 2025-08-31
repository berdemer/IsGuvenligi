import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as session from 'express-session';
// import * as connectRedis from 'connect-redis';
// import { Redis } from 'ioredis';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "ws:", "wss:"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // CORS configuration
  app.enableCors({
    origin: [
      'http://localhost:3002', // Frontend
      'http://localhost:3000', // Backend
      'http://localhost:8080' // Keycloak
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
    ],
  });

  // Session configuration - temporarily disabled Redis
  // const redisClient = new Redis({
  //   host: process.env.REDIS_HOST || 'redis',
  //   port: parseInt(process.env.REDIS_PORT) || 6379,
  //   db: 0,
  // });

  // const RedisStore = connectRedis.default;
  
  app.use(session({
    // store: new RedisStore({ client: redisClient }), // Disabled Redis store
    secret: process.env.SESSION_SECRET || 'isguvenligi-session-secret',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      maxAge: 1000 * 60 * 30, // 30 minutes
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
    name: 'isguvenligi.sid',
  }));

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('İş Güvenliği Sistemi API')
    .setDescription('İş Güvenliği Sistemi Backend API Documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Kimlik Doğrulama')
    .addTag('users', 'Kullanıcı Yönetimi')
    .addTag('admin', 'Yönetim Paneli')
    .addTag('safety', 'İş Güvenliği')
    .addTag('sessions', 'Oturum Yönetimi')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'İş Güvenliği API Docs',
  });

  // Health check endpoint
  app.use('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 Swagger documentation: http://localhost:${port}/api`);
  logger.log(`🏥 Health check: http://localhost:${port}/health`);
  logger.log(`🔐 Keycloak URL: ${process.env.KEYCLOAK_URL}`);
  logger.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap().catch((error) => {
  console.error('Application failed to start:', error);
  process.exit(1);
});