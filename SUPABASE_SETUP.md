# 🗄️ Supabase Database Setup Guide

## Step 1: Create Free Supabase Account

1. **Open Supabase:** https://supabase.com
2. Click **"Start your project"** or **"Sign Up"**
3. Sign up with **GitHub** (recommended) or email
4. Verify your email if needed

## Step 2: Create New Project

1. Click **"New Project"**
2. Fill in the details:
   - **Name:** `tarsit` or `tarsit-dev`
   - **Database Password:** Choose a strong password (save this!)
   - **Region:** Choose closest to you (US West, US East, Europe, etc.)
   - **Pricing Plan:** Select **"Free"** tier
3. Click **"Create new project"**
4. ⏳ Wait 2-3 minutes for project to be created

## Step 3: Get Your Connection Details

Once project is ready:

### 3a. Get Database URL
1. In Supabase dashboard, click **"Project Settings"** (gear icon, bottom left)
2. Click **"Database"** in the sidebar
3. Scroll to **"Connection string"** section
4. Select **"URI"** tab
5. Click **"Use connection pooling"** toggle (recommended)
6. Copy the connection string that looks like:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
7. **IMPORTANT:** Replace `[YOUR-PASSWORD]` with your actual database password

### 3b. Get API Keys
1. Still in **"Project Settings"**, click **"API"**
2. You'll see:
   - **Project URL:** Copy this (starts with `https://`)
   - **anon public key:** Copy this (long string)
   - **service_role key:** Copy this (different long string)

## Step 4: Update Your .env Files

### Backend (.env) - `/apps/api/.env`
Replace these lines:
```env
DATABASE_URL="your-connection-string-here"
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

### Frontend (.env.local) - `/apps/web/.env.local`
Create this file and add:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
OPENAI_API_KEY=your_openai_api_key_hereproj-YFNRGTC2FawMtJvlvBDB7mqo6K3aTnADOWYMyt057H8mnV3JNumi2tiBesqOOa76NtHA6TTj-vT3BlbkFJ9fbsEpldjNn8qhYm406QrOVwbVWhWhRRRTPDWIcjZyhkb19sIdVm9Jadz79SpwTjospESCCb4A
```

## Step 5: Test Connection

After updating `.env` files, run:

```bash
cd /Users/abdullahimran/Documents/tarsit/apps/api
pnpm prisma db push
```

If successful, you'll see:
```
✅ Database connected
🚀 Your database is now in sync with your Prisma schema
```

## Step 6: Generate Prisma Client

```bash
pnpm prisma generate
```

This creates the TypeScript types for your database.

## Step 7: Run Migrations

```bash
pnpm prisma migrate dev --name init
```

This will:
- Create all 12 tables
- Set up relationships
- Add indexes

## Step 8: Seed Database (Optional)

```bash
pnpm prisma:seed
```

This will add:
- 20 categories (Electronics, Automotive, Beauty, etc.)
- 10 test users
- 50 test businesses
- Sample reviews

---

## 📋 Quick Reference

### Useful Prisma Commands

```bash
# Open Prisma Studio (visual database editor)
pnpm prisma studio

# Push schema without migration
pnpm prisma db push

# Create new migration
pnpm prisma migrate dev --name migration_name

# Generate Prisma Client
pnpm prisma generate

# Reset database (WARNING: deletes all data)
pnpm prisma migrate reset

# Seed database
pnpm prisma:seed
```

### Database Info

**What we created:**
- ✅ 12 tables (Users, Businesses, Categories, Services, Photos, Reviews, Chats, Messages, Appointments, Favorites, Notifications, Analytics)
- ✅ All relationships (foreign keys)
- ✅ Indexes for performance
- ✅ Enums for type safety

**Free Tier Limits:**
- 500 MB database storage
- 2 GB bandwidth/month
- Unlimited API requests
- Auto-pause after 1 week of inactivity (free tier)

---

## 🆘 Troubleshooting

**"Can't reach database server"**
- Check your DATABASE_URL is correct
- Make sure password is correct (no special characters causing issues)
- Try using connection pooling URL

**"SSL error"**
- Add `?sslmode=require` to end of DATABASE_URL

**"Authentication failed"**
- Double-check your password
- Make sure you're using the pooler URL (port 6543)

**Still not working?**
- Let me know and I'll help debug!

---

## ✅ Checklist

- [ ] Created Supabase account
- [ ] Created new project
- [ ] Copied DATABASE_URL
- [ ] Copied SUPABASE_URL
- [ ] Copied SUPABASE_ANON_KEY  
- [ ] Copied SUPABASE_SERVICE_KEY
- [ ] Updated `/apps/api/.env`
- [ ] Created `/apps/web/.env.local`
- [ ] Ran `prisma db push`
- [ ] Ran `prisma generate`
- [ ] Ran `prisma migrate dev`
- [ ] Database is ready! 🎉

---

**Once you complete these steps, tell me "Database is set up" and I'll continue with creating the seed data and testing the connection!**
