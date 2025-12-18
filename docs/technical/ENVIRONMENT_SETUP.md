# ⚙️ Environment Setup Guide

## Quick Start

```bash
# 1. Clone repository
git clone <repository-url>
cd tarsit

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env

# 4. Configure environment variables (see below)

# 5. Set up database
cd apps/api
pnpm prisma generate
pnpm prisma migrate dev

# 6. Start development servers
pnpm dev
```

---

## Frontend Environment Variables

Create `apps/web/.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# Mapbox (Required for maps)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbGV4YW1wbGUwMDBvM3BwNGV3eXl4YnY2In0.your-token-here

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### Getting Mapbox Token

1. Go to https://account.mapbox.com/
2. Sign up or log in
3. Go to "Access tokens"
4. Create a new token
5. Copy the token to `NEXT_PUBLIC_MAPBOX_TOKEN`

---

## Backend Environment Variables

Create `apps/api/.env`:

```env
# ============================================
# DATABASE
# ============================================
DATABASE_URL=postgresql://user:password@localhost:5432/tarsit?schema=public

# ============================================
# JWT AUTHENTICATION
# ============================================
JWT_SECRET=your-development-jwt-secret-min-32-characters-long
JWT_REFRESH_SECRET=your-development-refresh-secret-min-32-characters-long
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# ============================================
# GOOGLE OAUTH (Optional)
# ============================================
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback

# ============================================
# CLOUDINARY (Image Storage)
# ============================================
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ============================================
# EMAIL (SMTP)
# ============================================
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM="Tarsit <noreply@tarsit.com>"

# ============================================
# FRONTEND URL
# ============================================
FRONTEND_URL=http://localhost:3000

# ============================================
# REDIS (Optional - for caching)
# ============================================
REDIS_URL=redis://localhost:6379

# ============================================
# OPENAI (Optional - for AI features)
# ============================================
OPENAI_API_KEY=sk-your-openai-key

# ============================================
# ENVIRONMENT
# ============================================
NODE_ENV=development
PORT=4000

# ============================================
# CORS (Optional - override defaults)
# ============================================
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

---

## Setting Up Services

### 1. PostgreSQL Database

#### Option A: Supabase (Recommended for Development)

1. Go to https://supabase.com
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string
5. Update `DATABASE_URL` in `.env`

#### Option B: Local PostgreSQL

```bash
# macOS
brew install postgresql
brew services start postgresql
createdb tarsit

# Linux
sudo apt-get install postgresql
sudo systemctl start postgresql
sudo -u postgres createdb tarsit

# Windows
# Download from https://www.postgresql.org/download/windows/
```

### 2. Redis (Optional but Recommended)

#### Option A: Upstash (Cloud)

1. Go to https://upstash.com
2. Create Redis database
3. Copy connection URL
4. Update `REDIS_URL` in `.env`

#### Option B: Local Redis

```bash
# macOS
brew install redis
brew services start redis

# Linux
sudo apt-get install redis
sudo systemctl start redis

# Docker
docker run -d -p 6379:6379 redis:7-alpine
```

### 3. Cloudinary (Image Storage)

1. Go to https://cloudinary.com
2. Sign up for free account
3. Go to Dashboard
4. Copy:
   - Cloud Name
   - API Key
   - API Secret
5. Update in `.env`

### 4. Email (SMTP)

#### Gmail Setup

1. Enable 2-Factor Authentication
2. Generate App Password:
   - Go to Google Account → Security
   - App passwords → Generate
   - Copy the password
3. Update in `.env`:
   ```
   MAIL_USER=your-email@gmail.com
   MAIL_PASSWORD=your-app-password
   ```

#### Other SMTP Providers

- **SendGrid:** Use SMTP settings from SendGrid
- **Mailgun:** Use SMTP settings from Mailgun
- **AWS SES:** Use SMTP settings from AWS SES

### 5. Mapbox (Maps)

1. Go to https://account.mapbox.com/
2. Sign up or log in
3. Go to "Access tokens"
4. Create new token (or use default public token)
5. Copy to `NEXT_PUBLIC_MAPBOX_TOKEN` in frontend `.env.local`

---

## Database Setup

### Initial Migration

```bash
cd apps/api

# Generate Prisma Client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# (Optional) Seed database
pnpm prisma:seed
```

### Prisma Studio (Database GUI)

```bash
cd apps/api
pnpm prisma:studio
# Opens at http://localhost:5555
```

---

## Development Workflow

### Start Development Servers

```bash
# From root directory
pnpm dev

# This starts:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:4000
# - API Docs: http://localhost:4000/api/docs
```

### Individual Services

```bash
# Frontend only
cd apps/web
pnpm dev

# Backend only
cd apps/api
pnpm dev
```

### Database Commands

```bash
cd apps/api

# Create migration
pnpm prisma migrate dev --name migration_name

# Reset database (WARNING: deletes all data)
pnpm prisma migrate reset

# View database
pnpm prisma:studio
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
cd apps/api
pnpm prisma db pull

# If fails, check:
# 1. Database is running
# 2. DATABASE_URL is correct
# 3. Credentials are valid
# 4. Network/firewall allows connection
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3000  # Frontend
lsof -i :4000  # Backend

# Kill process
kill -9 <PID>
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules apps/*/node_modules
pnpm install
```

### Prisma Client Errors

```bash
cd apps/api
pnpm prisma generate
```

---

## Production Environment

For production, use the same variables but with production values:

- Use production database URL
- Use strong, unique JWT secrets
- Use production Cloudinary account
- Use production email service
- Set `NODE_ENV=production`
- Use production frontend URL

See `DEPLOYMENT.md` for production deployment details.

---

## Security Notes

⚠️ **Never commit `.env` files to git!**

- `.env` files are in `.gitignore`
- Use `.env.example` as template
- Rotate secrets regularly
- Use different secrets for dev/staging/prod
- Keep secrets secure and encrypted

---

## Next Steps

1. ✅ Set up all environment variables
2. ✅ Start development servers
3. ✅ Run database migrations
4. ✅ Test the application
5. ✅ Read `USER_GUIDE.md` for usage
6. ✅ Read `API_DOCUMENTATION.md` for API details

---

## Support

Having issues? Check:
- `TESTING_GUIDE.md` for test setup
- `DEPLOYMENT.md` for deployment help
- GitHub Issues for known problems
