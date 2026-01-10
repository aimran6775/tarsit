import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MailModule } from '../mail/mail.module';
import { PrismaModule } from '../prisma/prisma.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';
import { JwtStrategy } from './jwt.strategy';

// Conditionally import GoogleStrategy only if credentials are configured
const optionalProviders = [];
if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_ID !== 'placeholder-client-id.apps.googleusercontent.com'
) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { GoogleStrategy } = require('./strategies/google.strategy');
  optionalProviders.push(GoogleStrategy);
}

@Module({
  imports: [
    PrismaModule,
    MailModule,
    SupabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, SupabaseAuthGuard, ...optionalProviders],
  exports: [AuthService, JwtModule, SupabaseAuthGuard],
})
export class AuthModule {}
