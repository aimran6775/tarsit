# 🚀 Tarsit Deployment Guide

## Overview

This guide covers deploying both the frontend (Next.js) and backend (NestJS) applications to production.

---

## Prerequisites

- Node.js 18+ installed
- pnpm 8+ installed
- PostgreSQL database (Supabase recommended)
- Redis instance (Upstash recommended)
- Cloudinary account (for image storage)
- Mapbox account (for maps)
- SMTP server (for emails)

---

## Frontend Deployment (Next.js)

### Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login
   vercel login
   
   # Deploy
   cd apps/web
   vercel
   ```

2. **Environment Variables**
   Set in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://api.tarsit.com
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
   ```

3. **Build Settings**
   - Framework Preset: Next.js
   - Root Directory: `apps/web`
   - Build Command: `pnpm build`
   - Output Directory: `.next`

### Netlify

1. **Configuration** (`netlify.toml`):
   ```toml
   [build]
     command = "cd apps/web && pnpm build"
     publish = "apps/web/.next"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy**
   - Connect GitHub repository
   - Set environment variables
   - Deploy

### Self-Hosted (Docker)

```dockerfile
# apps/web/Dockerfile
FROM node:18-alpine AS base
RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build --filter=@tarsit/web

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/
RUN pnpm install --prod --filter=@tarsit/web

EXPOSE 3000
CMD ["pnpm", "--filter", "@tarsit/web", "start"]
```

---

## Backend Deployment (NestJS)

### Railway (Recommended)

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login and Initialize**
   ```bash
   railway login
   railway init
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set DATABASE_URL=postgresql://...
   railway variables set JWT_SECRET=your-secret
   # ... add all required variables
   ```

4. **Deploy**
   ```bash
   railway up
   ```

5. **Database Migrations**
   ```bash
   railway run pnpm prisma migrate deploy
   ```

### Render

1. **Create Web Service**
   - Connect GitHub repository
   - Build Command: `cd apps/api && pnpm install && npx prisma generate && pnpm build`
   - Start Command: `cd apps/api && node dist/main.js`

2. **Environment Variables**
   - Add all required variables in Render dashboard
   - Set `NODE_ENV=production`

3. **Database**
   - Create PostgreSQL database
   - Run migrations: `pnpm prisma migrate deploy`

### Docker Deployment

```dockerfile
# apps/api/Dockerfile
FROM node:18-alpine AS base
RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build --filter=@tarsit/api

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
RUN pnpm install --prod --filter=@tarsit/api
RUN cd apps/api && npx prisma generate

EXPOSE 4000
CMD ["node", "apps/api/dist/main.js"]
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      # ... other env vars
    depends_on:
      - redis
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
```

---

## Environment Variables

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=https://api.tarsit.com
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT
JWT_SECRET=your-production-jwt-secret-min-32-chars
JWT_REFRESH_SECRET=your-production-refresh-secret-min-32-chars
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://api.tarsit.com/api/auth/google/callback

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
FRONTEND_URL=https://tarsit.com

# Redis
REDIS_URL=redis://your-redis-url:6379

# OpenAI (Optional)
OPENAI_API_KEY=your-openai-key

# Environment
NODE_ENV=production
PORT=4000
```

---

## Database Setup

### Supabase (Recommended)

1. **Create Project**
   - Go to https://supabase.com
   - Create new project
   - Note connection string

2. **Run Migrations**
   ```bash
   cd apps/api
   pnpm prisma migrate deploy
   pnpm prisma generate
   ```

3. **Seed Database (Optional)**
   ```bash
   pnpm prisma:seed
   ```

### Self-Hosted PostgreSQL

1. **Install PostgreSQL**
2. **Create Database**
   ```sql
   CREATE DATABASE tarsit;
   CREATE USER tarsit_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE tarsit TO tarsit_user;
   ```

3. **Run Migrations**
   ```bash
   DATABASE_URL=postgresql://tarsit_user:secure_password@localhost:5432/tarsit
   pnpm prisma migrate deploy
   ```

---

## Redis Setup

### Upstash (Recommended)

1. **Create Database**
   - Go to https://upstash.com
   - Create Redis database
   - Copy connection URL

2. **Set Environment Variable**
   ```
   REDIS_URL=redis://default:password@host:port
   ```

### Self-Hosted Redis

```bash
# Docker
docker run -d -p 6379:6379 redis:7-alpine

# Or install locally
# macOS: brew install redis
# Linux: apt-get install redis
```

---

## SSL/TLS Setup

### Vercel/Netlify
- Automatic SSL via Let's Encrypt
- No configuration needed

### Self-Hosted
1. **Install Certbot**
   ```bash
   sudo apt-get install certbot
   ```

2. **Get Certificate**
   ```bash
   sudo certbot certonly --standalone -d api.tarsit.com
   ```

3. **Configure Nginx**
   ```nginx
   server {
       listen 443 ssl;
       server_name api.tarsit.com;
       
       ssl_certificate /etc/letsencrypt/live/api.tarsit.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/api.tarsit.com/privkey.pem;
       
       location / {
           proxy_pass http://localhost:4000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## Monitoring & Logging

### Recommended Services

1. **Error Tracking**
   - Sentry (https://sentry.io)
   - LogRocket (https://logrocket.com)

2. **Performance Monitoring**
   - Datadog (https://datadoghq.com)
   - New Relic (https://newrelic.com)

3. **Uptime Monitoring**
   - UptimeRobot (https://uptimerobot.com)
   - Pingdom (https://pingdom.com)

### Health Checks

**Frontend:**
- Health endpoint: `/api/health` (if API routes enabled)

**Backend:**
- Health endpoint: `/api/health`
- Returns: `{ status: "ok", database: "connected", uptime: 12345 }`

---

## Scaling Considerations

### Frontend
- **CDN:** Vercel/Netlify provide global CDN
- **Caching:** Static assets cached automatically
- **Image Optimization:** Next.js Image component handles this

### Backend
- **Load Balancing:** Use multiple instances behind load balancer
- **Database Connection Pooling:** Configured in Prisma
- **Redis Caching:** Already implemented
- **Horizontal Scaling:** Stateless API, easy to scale

### Database
- **Connection Pooling:** Use PgBouncer for connection pooling
- **Read Replicas:** For read-heavy workloads
- **Backup Strategy:** Daily automated backups

---

## Post-Deployment Checklist

- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] SSL certificates configured
- [ ] CORS settings correct
- [ ] Rate limiting configured
- [ ] Monitoring set up
- [ ] Error tracking configured
- [ ] Backup strategy in place
- [ ] Health checks passing
- [ ] API documentation accessible
- [ ] Frontend builds successfully
- [ ] All tests passing

---

## Rollback Procedure

### Frontend (Vercel)
```bash
vercel rollback [deployment-url]
```

### Backend
1. Revert to previous deployment
2. Run database migrations if needed
3. Verify health checks

---

## Support

For deployment issues:
- **Documentation:** See `/docs` folder
- **Email:** devops@tarsit.com
- **Status:** https://status.tarsit.com
