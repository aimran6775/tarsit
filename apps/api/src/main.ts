import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggerService } from './common/services/logger.service';
import { initSentry } from './sentry/sentry';

async function bootstrap() {
  // Initialize Sentry before creating the app
  initSentry();

  const logger = new LoggerService();
  logger.setContext('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Global exception filter with Sentry integration
  app.useGlobalFilters(new AllExceptionsFilter());

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
    })
  );

  // Compression middleware
  app.use(compression());

  // CORS configuration
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        'https://tarsit.com',
        'https://www.tarsit.com',
        'https://tarsit-web.vercel.app',
        // Allow all Vercel preview deployments
        /^https:\/\/tarsit-.*\.vercel\.app$/,
        // Always allow localhost for development/testing
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
      ].filter(Boolean);

      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Allow GitHub Codespaces (both dev and production for testing)
      const isCodespaces = origin.endsWith('.app.github.dev');
      
      // Check if origin matches any allowed origin (including regex patterns)
      const isAllowed = allowedOrigins.some(allowed => {
        if (allowed instanceof RegExp) {
          return allowed.test(origin);
        }
        return allowed === origin;
      });

      if (isAllowed || isCodespaces) {
        callback(null, true);
      } else {
        console.log('Blocked CORS origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Region-Code',
      'X-Language-Code',
      'X-Currency-Code',
    ],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
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
        '- Connect to: `wss://<API_HOST>/chat`\n' +
        '- Send token in handshake: `{ auth: { token: "Bearer <token>" } }`'
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
      'JWT'
    )
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('businesses', 'Business directory operations')
    .addTag('categories', 'Business categories')
    .addTag('reviews', 'Review and rating system')
    .addTag('appointments', 'Appointment booking')
    .addTag('chats', 'Chat messaging')
    .addTag('analytics', 'Analytics and insights')
    .addTag('verification-requests', 'Business verification');

  // Add servers dynamically based on environment
  const apiBaseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 4001}`;
  if (process.env.NODE_ENV === 'production') {
    config.addServer(apiBaseUrl, 'Production');
  } else {
    config.addServer(apiBaseUrl, 'Development');
    config.addServer('https://api.tarsit.com', 'Production');
  }

  const finalConfig = config.build();

  const document = SwaggerModule.createDocument(app, finalConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Tarsit API Documentation',
  });

  const port = process.env.PORT || 4001;
  await app.listen(port);

  const runningUrl = process.env.API_BASE_URL || `http://localhost:${port}`;
  console.log(`\n🚀 Tarsit API running on: ${runningUrl}`);
  console.log(`📚 API Documentation: ${runningUrl}/api/docs\n`);
}

bootstrap();
