import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';
import { SecurityMiddleware } from './common/middleware/security.middleware';
import { SecurityInterceptor } from './common/interceptors/security.interceptor';
import { CacheInterceptor } from './common/interceptors/cache.interceptor';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BusinessesModule } from './businesses/businesses.module';
import { CategoriesModule } from './categories/categories.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ServicesModule } from './services/services.module';
import { FavoritesModule } from './favorites/favorites.module';
import { PhotosModule } from './photos/photos.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ChatsModule } from './chats/chats.module';
import { MessagesModule } from './messages/messages.module';
import { SearchModule } from './search/search.module';
import { UploadsModule } from './uploads/uploads.module';
import { VerificationRequestsModule } from './verification-requests/verification-requests.module';
import { ChatModule } from './chat/chat.module';
import { AdminModule } from './admin/admin.module';
import { HealthModule } from './health/health.module';
import { TeamModule } from './team/team.module';
import { BusinessHoursModule } from './business-hours/business-hours.module';
import { TarsModule } from './tars/tars.module';

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
    ChatModule,
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
    consumer
      .apply(SecurityMiddleware, RequestLoggerMiddleware)
      .forRoutes('*');
  }
}
