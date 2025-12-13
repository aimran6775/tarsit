# Tarsit API - Deployment Guide

## Environment Variables

### Required Production Variables
```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT
JWT_SECRET=your-production-jwt-secret-min-32-chars
JWT_REFRESH_SECRET=your-production-refresh-secret-min-32-chars

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/auth/google/callback

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM="Tarsit <noreply@tarsit.com>"

# Frontend
FRONTEND_URL=https://yourdomain.com

# Redis (Optional)
REDIS_URL=redis://your-redis-url:6379

# OpenAI (Optional)
OPENAI_API_KEY=your-openai-key
```

## Deployment Platforms

### Railway
1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Add environment variables in Railway dashboard
5. Deploy: `railway up`

### Render
1. Create new Web Service
2. Connect GitHub repository
3. Build Command: `cd apps/api && pnpm install && npx prisma generate && pnpm build`
4. Start Command: `cd apps/api && node dist/main.js`
5. Add environment variables

### Docker
```bash
# Build image
docker build -t tarsit-api -f apps/api/Dockerfile .

# Run container
docker run -p 4000:4000 --env-file apps/api/.env tarsit-api

# Or use docker-compose
docker-compose up -d
```

### Vercel / Netlify (Serverless)
- Not recommended for this API due to WebSocket requirements
- Use Railway, Render, or traditional VPS instead

## Database Migrations

```bash
# Generate migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

## Health Check Endpoint

```
GET /health
```

Returns:
```json
{
  "status": "ok",
  "timestamp": "2024-12-07T12:00:00.000Z",
  "database": "connected",
  "uptime": 12345
}
```

## SSL/TLS
- Enable HTTPS in production
- Use Let's Encrypt for free SSL certificates
- Configure CORS for your frontend domain

## Monitoring & Logging
- TODO: Add Sentry for error tracking
- TODO: Add LogRocket for session replay
- TODO: Add Datadog for performance monitoring

## Scaling Considerations
- Use Redis for session management and caching
- Consider load balancer for multiple instances
- Database connection pooling (already configured in Prisma)
- CDN for static assets (Cloudinary handles this)
