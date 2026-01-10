# Koyeb Deployment Guide for Tarsit

This guide will help you deploy Tarsit to Koyeb's free tier.

## Prerequisites

- GitHub account (your repo: `aimran6775/tarsit`)
- Koyeb account (sign up at [koyeb.com](https://koyeb.com))
- Supabase project (for database, auth, storage)
- Domain: `tarsit.com` (Squarespace)

## Architecture on Koyeb

```
┌─────────────────────────────────────────────────────┐
│                    tarsit.com                        │
│                   (Squarespace DNS)                  │
└─────────────────────┬───────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│   tarsit.com    │     │ api.tarsit.com  │
│   (Web App)     │     │   (API)         │
│   Koyeb Free    │────▶│   Koyeb Free    │
└─────────────────┘     └────────┬────────┘
                                 │
                                 ▼
                    ┌─────────────────────┐
                    │     Supabase        │
                    │  (DB/Auth/Storage)  │
                    └─────────────────────┘
```

## Step 1: Sign Up for Koyeb

1. Go to [app.koyeb.com](https://app.koyeb.com)
2. Sign up with GitHub
3. You'll get access to the free tier (1 nano instance, 512MB RAM)

## Step 2: Deploy the API Backend

1. Click **"Create App"** → **"Web service"**

2. Select **GitHub** and authorize access to your repo

3. Choose repository: `aimran6775/tarsit`

4. Configure the service:
   - **Name**: `tarsit-api`
   - **Region**: Washington, DC (closest to you) or Frankfurt
   - **Instance type**: Nano (Free)
   - **Builder**: Dockerfile
   - **Dockerfile path**: `apps/api/Dockerfile`
   - **Build context**: `/` (root of repo)

5. Set **Environment Variables**:

   ```
   NODE_ENV=production
   PORT=8000
   DATABASE_URL=postgresql://...your-supabase-connection-string...
   JWT_ACCESS_SECRET=your-strong-secret-here
   JWT_REFRESH_SECRET=your-strong-secret-here
   JWT_ACCESS_EXPIRATION=15m
   JWT_REFRESH_EXPIRATION=7d
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_KEY=your-service-key
   OPENAI_API_KEY=sk-your-openai-key
   API_BASE_URL=https://api.tarsit.com
   ```

6. Set **Health Check**:
   - Path: `/api/health`
   - Port: `8000`

7. Click **Deploy**

8. Wait for build (~3-5 minutes)

9. Note your API URL: `https://tarsit-api-xxxxx.koyeb.app`

## Step 3: Deploy the Web Frontend

1. Click **"Create App"** → **"Web service"**

2. Choose the same repository: `aimran6775/tarsit`

3. Configure the service:
   - **Name**: `tarsit-web`
   - **Region**: Same as API
   - **Instance type**: Nano (Free)
   - **Builder**: Dockerfile
   - **Dockerfile path**: `apps/web/Dockerfile`
   - **Build context**: `/` (root of repo)

4. Set **Build Arguments** (click "Add build argument"):

   ```
   NEXT_PUBLIC_API_URL=https://tarsit-api-xxxxx.koyeb.app
   NEXT_PUBLIC_APP_URL=https://tarsit.com
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_MAPBOX_TOKEN=pk.your-mapbox-token
   ```

5. Set **Environment Variables**:

   ```
   NODE_ENV=production
   PORT=3000
   ```

6. Set **Health Check**:
   - Path: `/`
   - Port: `3000`

7. Click **Deploy**

## Step 4: Configure Custom Domain

### For API (api.tarsit.com)

1. In Koyeb, go to your `tarsit-api` app → **Settings** → **Domains**
2. Click **"Add domain"** → Enter `api.tarsit.com`
3. Koyeb will show you a CNAME record to add

### For Web (tarsit.com)

1. In Koyeb, go to your `tarsit-web` app → **Settings** → **Domains**
2. Click **"Add domain"** → Enter `tarsit.com` and `www.tarsit.com`
3. Koyeb will show you CNAME records to add

### In Squarespace DNS

Go to Squarespace → Domains → `tarsit.com` → DNS Settings

Add these records:

| Type  | Host | Value                      | TTL  |
| ----- | ---- | -------------------------- | ---- |
| CNAME | api  | `<your-api-app>.koyeb.app` | 3600 |
| CNAME | www  | `<your-web-app>.koyeb.app` | 3600 |
| CNAME | @    | `<your-web-app>.koyeb.app` | 3600 |

**Note**: Some DNS providers don't allow CNAME on root (@). If that's the case:

- Use Koyeb's A record IP instead
- Or use Cloudflare as DNS (free) which supports CNAME flattening

## Step 5: Update Supabase Settings

In your Supabase project → **Authentication** → **URL Configuration**:

1. **Site URL**: `https://tarsit.com`
2. **Redirect URLs** (add all):
   - `https://tarsit.com/**`
   - `https://www.tarsit.com/**`
   - `https://tarsit-web-xxxxx.koyeb.app/**`

## Step 6: Verify Deployment

1. **Test API**: `https://api.tarsit.com/api/health`
   - Should return: `{"status": "ok", ...}`

2. **Test Web**: `https://tarsit.com`
   - Should load the homepage

3. **Test Auth**: Try logging in/signing up

## Environment Variables Reference

### API Service (`tarsit-api`)

| Variable               | Required | Example                   |
| ---------------------- | -------- | ------------------------- |
| `NODE_ENV`             | Yes      | `production`              |
| `PORT`                 | Yes      | `8000`                    |
| `DATABASE_URL`         | Yes      | `postgresql://...`        |
| `JWT_ACCESS_SECRET`    | Yes      | `random-32-char-string`   |
| `JWT_REFRESH_SECRET`   | Yes      | `random-32-char-string`   |
| `SUPABASE_URL`         | Yes      | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY`    | Yes      | `eyJ...`                  |
| `SUPABASE_SERVICE_KEY` | Yes      | `eyJ...`                  |
| `OPENAI_API_KEY`       | Yes      | `sk-...`                  |
| `API_BASE_URL`         | Yes      | `https://api.tarsit.com`  |
| `REDIS_URL`            | No       | Leave empty for free tier |

### Web Service (`tarsit-web`) - Build Args

| Variable                        | Required | Example                   |
| ------------------------------- | -------- | ------------------------- |
| `NEXT_PUBLIC_API_URL`           | Yes      | `https://api.tarsit.com`  |
| `NEXT_PUBLIC_APP_URL`           | Yes      | `https://tarsit.com`      |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes      | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes      | `eyJ...`                  |
| `NEXT_PUBLIC_MAPBOX_TOKEN`      | Yes      | `pk.xxx`                  |

## Troubleshooting

### Build Fails

1. Check build logs in Koyeb dashboard
2. Ensure Dockerfile path is correct
3. Verify all required files are committed to GitHub

### App Crashes on Start

1. Check runtime logs
2. Verify all environment variables are set
3. Check database connection string

### Domain Not Working

1. DNS propagation takes 5-30 minutes
2. Verify CNAME records are correct
3. Check Koyeb domain verification status

### API Returns 502

1. Check if API service is running
2. Verify PORT environment variable matches health check
3. Check API logs for errors

## Costs

**Koyeb Free Tier includes:**

- 1 Nano instance (512MB RAM, shared CPU)
- 1GB outbound bandwidth
- 1GB persistent storage
- Custom domains with SSL

**For Tarsit:**

- You'll need 2 services (API + Web)
- Koyeb allows multiple free apps, but limited resources
- Consider upgrading to Starter ($5.50/mo per service) if you hit limits

## Next Steps

1. Set up monitoring (Koyeb has built-in metrics)
2. Configure automatic deployments from `main` branch
3. Set up environment-specific branches (staging/production)
4. Consider upgrading as traffic grows
