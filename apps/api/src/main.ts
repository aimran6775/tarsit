import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Security headers with Helmet (enhanced configuration)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false, // Allow external resources
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
    }),
  );

  // Compression middleware
  app.use(compression());

  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  // Enhanced Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Tarsit API')
    .setDescription(
      'Tarsit - Connecting Small Businesses to the World\n\n' +
        '## Features\n' +
        '- 🔐 JWT Authentication with OAuth (Google)\n' +
        '- 🏢 Business Directory with Search & Discovery\n' +
        '- ⭐ Reviews & Ratings System\n' +
        '- 📅 Appointment Booking\n' +
        '- 💬 Real-time Chat (WebSocket)\n' +
        '- 📊 Advanced Analytics & Insights\n' +
        '- ✅ Business Verification\n' +
        '- 📸 Image Upload (Supabase Storage)\n' +
        '- 📧 Email Notifications\n' +
        '- 🚀 Performance Optimized with Caching\n\n' +
        '## Authentication\n' +
        '1. Sign up: `POST /api/auth/signup`\n' +
        '2. Login: `POST /api/auth/login`\n' +
        '3. Use the returned `accessToken` in the Authorization header: `Bearer <token>`\n' +
        '4. Refresh token: `POST /api/auth/refresh`\n\n' +
        '## Rate Limits\n' +
        '- Auth endpoints: 3-10 requests/minute\n' +
        '- General endpoints: 100 requests/minute\n\n' +
        '## WebSocket\n' +
        '- Connect to: `ws://localhost:4000/chat`\n' +
        '- Send token in handshake: `{ auth: { token: "Bearer <token>" } }`',
    )
    .setVersion('1.0.0')
    .setContact('Tarsit Team', 'https://tarsit.com', 'support@tarsit.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
        name: 'Authorization',
        in: 'header',
      },
      'JWT',
    )
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('businesses', 'Business directory operations')
    .addTag('categories', 'Business categories')
    .addTag('reviews', 'Review and rating system')
    .addTag('appointments', 'Appointment booking')
    .addTag('chats', 'Chat messaging')
    .addTag('analytics', 'Analytics and insights')
    .addTag('verification-requests', 'Business verification')
    .addServer('http://localhost:4000', 'Development')
    .addServer('https://api.tarsit.com', 'Production')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Tarsit API Documentation',
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  
  console.log(`\n🚀 Tarsit API running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs\n`);
}

bootstrap();
