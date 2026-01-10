import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
}));
