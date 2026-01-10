import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from './logger.service';

interface EnvVar {
  name: string;
  required: boolean;
  description: string;
  validator?: (value: string) => boolean;
}

@Injectable()
export class EnvironmentService implements OnModuleInit {
  private readonly envVars: EnvVar[] = [
    // Database
    { name: 'DATABASE_URL', required: true, description: 'PostgreSQL connection string' },

    // Supabase
    { name: 'SUPABASE_URL', required: true, description: 'Supabase project URL' },
    { name: 'SUPABASE_KEY', required: true, description: 'Supabase anon/public key' },
    { name: 'SUPABASE_SERVICE_KEY', required: false, description: 'Supabase service role key' },

    // JWT
    {
      name: 'JWT_SECRET',
      required: true,
      description: 'Secret key for JWT signing',
      validator: (v) => v.length >= 32,
    },
    { name: 'JWT_EXPIRES_IN', required: false, description: 'JWT expiration time (e.g., 7d)' },

    // API
    { name: 'PORT', required: false, description: 'API server port' },
    { name: 'NODE_ENV', required: false, description: 'Environment (development/production)' },
    { name: 'CORS_ORIGINS', required: false, description: 'Allowed CORS origins (comma-separated)' },

    // OpenAI (for Tars AI)
    { name: 'OPENAI_API_KEY', required: false, description: 'OpenAI API key for Tars' },

    // Sentry
    { name: 'SENTRY_DSN', required: false, description: 'Sentry DSN for error tracking' },

    // 2FA
    { name: 'TWO_FACTOR_SECRET', required: false, description: 'Encryption key for 2FA secrets' },

    // Push Notifications
    { name: 'VAPID_PUBLIC_KEY', required: false, description: 'VAPID public key for web push' },
    { name: 'VAPID_PRIVATE_KEY', required: false, description: 'VAPID private key for web push' },

    // OAuth (optional)
    { name: 'GOOGLE_CLIENT_ID', required: false, description: 'Google OAuth client ID' },
    { name: 'GOOGLE_CLIENT_SECRET', required: false, description: 'Google OAuth client secret' },
  ];

  constructor(
    private config: ConfigService,
    private logger: LoggerService,
  ) {}

  onModuleInit() {
    this.validateEnvironment();
  }

  validateEnvironment(): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const envVar of this.envVars) {
      const value = this.config.get<string>(envVar.name);

      if (!value) {
        if (envVar.required) {
          errors.push(`Missing required env var: ${envVar.name} - ${envVar.description}`);
        } else {
          warnings.push(`Optional env var not set: ${envVar.name} - ${envVar.description}`);
        }
        continue;
      }

      if (envVar.validator && !envVar.validator(value)) {
        errors.push(`Invalid value for ${envVar.name}: validation failed`);
      }
    }

    // Log results
    if (errors.length > 0) {
      this.logger.error(
        `Environment validation failed with ${errors.length} errors`,
        errors.join('; '),
        'EnvironmentService',
      );
    }

    if (warnings.length > 0 && process.env.NODE_ENV === 'development') {
      this.logger.warn(
        `Environment has ${warnings.length} optional variables not set`,
        'EnvironmentService',
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  getEnvironmentInfo() {
    return {
      nodeEnv: this.config.get<string>('NODE_ENV') || 'development',
      port: this.config.get<number>('PORT') || 4000,
      databaseConfigured: !!this.config.get<string>('DATABASE_URL'),
      supabaseConfigured: !!this.config.get<string>('SUPABASE_URL'),
      sentryConfigured: !!this.config.get<string>('SENTRY_DSN'),
      openaiConfigured: !!this.config.get<string>('OPENAI_API_KEY'),
      pushConfigured:
        !!this.config.get<string>('VAPID_PUBLIC_KEY') &&
        !!this.config.get<string>('VAPID_PRIVATE_KEY'),
    };
  }
}
