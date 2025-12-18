import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AdminModule } from './admin/admin.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { AuthModule } from './auth/auth.module';
import { BusinessHoursModule } from './business-hours/business-hours.module';
import { BusinessesModule } from './businesses/businesses.module';
import { CategoriesModule } from './categories/categories.module';
import { ChatsModule } from './chats/chats.module';
import { CacheInterceptor } from './common/interceptors/cache.interceptor';
import { SecurityInterceptor } from './common/interceptors/security.interceptor';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';
import { SecurityMiddleware } from './common/middleware/security.middleware';
import { FavoritesModule } from './favorites/favorites.module';
import { HealthModule } from './health/health.module';
import { MessagesModule } from './messages/messages.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PhotosModule } from './photos/photos.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SearchModule } from './search/search.module';
import { ServicesModule } from './services/services.module';
import { TarsModule } from './tars/tars.module';
import { TeamModule } from './team/team.module';
import { UploadsModule } from './uploads/uploads.module';
import { VerificationRequestsModule } from './verification-requests/verification-requests.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        // Higher limit in development/test mode for easier testing
        limit: process.env.NODE_ENV === 'production' ? 100 : 1000,
      },
    ]),
    CacheModule.register({
      isGlobal: true,
      ttl: 300000, // 5 minutes default TTL
      max: 100, // Maximum number of items in cache
    }),
    PrismaModule,
    AuthModule,
    BusinessesModule,
    CategoriesModule,
    ReviewsModule,
    ServicesModule,
    FavoritesModule,
    PhotosModule,
    AppointmentsModule,
    NotificationsModule,
    AnalyticsModule,
    ChatsModule,
    MessagesModule,
    SearchModule,
    UploadsModule,
    VerificationRequestsModule,
    AdminModule,
    HealthModule,
    TeamModule,
    BusinessHoursModule,
    TarsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SecurityInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecurityMiddleware, RequestLoggerMiddleware).forRoutes('*');
  }
}
