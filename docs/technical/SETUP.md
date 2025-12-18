# 🚀 Tarsit Development Environment Setup Guide

## ⚠️ Prerequisites Installation Required

Your system is missing **Node.js** which is required for this project. Follow these steps:

### Step 1: Install Node.js (Required)

**Option A: Using Homebrew (Recommended for macOS)**
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js (LTS version)
brew install node@20
```

**Option B: Using Node Version Manager (nvm) - Better for managing multiple Node versions**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Restart terminal or run:
source ~/.zshrc

# Install Node.js LTS
nvm install --lts
nvm use --lts
```

**Option C: Direct Download**
- Visit: https://nodejs.org/
- Download the **LTS version** (v20.x.x)
- Run the installer

### Step 2: Verify Installation
```bash
node --version   # Should show v20.x.x
npm --version    # Should show 10.x.x
```

### Step 3: Install pnpm
```bash
npm install -g pnpm@8.14.0
```

### Step 4: Verify pnpm
```bash
pnpm --version   # Should show 8.14.0
```

---

## 📦 Project Setup (After Node.js is installed)

### 1. Install Dependencies
```bash
cd /Users/abdullahimran/Documents/tarsit
pnpm install
```

### 2. Set Up Environment Variables

**Frontend (.env.local):**
```bash
cp apps/web/.env.example apps/web/.env.local
```

Edit `apps/web/.env.local` with your keys:
- Supabase URL and keys (we'll set up together)
- Google Maps API key (optional for now)
- OpenAI API key (already provided)

**Backend (.env):**
```bash
cp apps/api/.env.example apps/api/.env
```

### 3. Set Up PostgreSQL Database (Supabase)

We'll do this together in **Phase 1**, but here's what we'll need:
1. Create a free Supabase account at https://supabase.com
2. Create a new project
3. Get your database URL and API keys
4. Add them to `.env` files

### 4. Run Development Servers
```bash
# Start both frontend and backend
pnpm dev

# Frontend will be at: http://localhost:3000
# Backend will be at: http://localhost:4000
```

---

## 🛠️ Additional Tools to Install (Optional but Recommended)

### VS Code Extensions
1. **ESLint** - Code linting
2. **Prettier** - Code formatting
3. **Prisma** - Database schema syntax highlighting
4. **Tailwind CSS IntelliSense** - Tailwind autocomplete
5. **Error Lens** - Better error highlighting

### Recommended Terminal Tools
```bash
# Git (if not installed)
brew install git

# GitHub CLI (optional, but useful)
brew install gh
```

---

## 📋 Quick Start After Installation

Once Node.js and pnpm are installed:

```bash
# 1. Navigate to project
cd /Users/abdullahimran/Documents/tarsit

# 2. Install dependencies
pnpm install

# 3. We'll set up Supabase together (Phase 1)

# 4. Start development
pnpm dev
```

---

## 🆘 Troubleshooting

### "command not found: node"
- Node.js not installed or not in PATH
- Solution: Follow Step 1 above

### "command not found: pnpm"
- pnpm not installed
- Solution: Run `npm install -g pnpm`

### "Cannot find module"
- Dependencies not installed
- Solution: Run `pnpm install` in project root

### Permission errors on macOS
```bash
# If you get EACCES errors
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

---

## 📞 Next Steps

**STOP HERE and:**

1. **Install Node.js** using one of the options above
2. **Verify** with `node --version`
3. **Install pnpm** with `npm install -g pnpm`
4. **Let me know** and I'll continue with the setup!

After you've installed Node.js and pnpm, I will:
- Install all project dependencies
- Set up the backend (NestJS)
- Create the database schema (Prisma)
- Initialize Supabase
- Get everything running!

---

## 🎯 What We're Building

Once setup is complete, you'll have:
- ✅ Modern monorepo structure
- ✅ Next.js 14 frontend (TypeScript + Tailwind)
- ✅ NestJS backend (TypeScript + Prisma)
- ✅ Hot reload for development
- ✅ ESLint + Prettier configured
- ✅ Ready for Phase 1 (Database Schema)!

**Please install Node.js now, then let me know when it's done! 🚀**
