import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '4001', 10),
  environment: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'api',
  frontendUrl:
    process.env.FRONTEND_URL || 'https://improved-memory-p6vxppj655p37pgw-3001.app.github.dev',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || [
    'https://improved-memory-p6vxppj655p37pgw-3001.app.github.dev',
  ],
}));
