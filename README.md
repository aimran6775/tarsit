# 🚀 Tarsit - Connecting Small Businesses to the World

A modern, production-ready platform to help small brick-and-mortar service businesses get discovered, connect with customers, and grow their business online.

## ✨ Features

- 🔐 **Secure Authentication** - JWT-based auth with OAuth, email verification, password reset
- 🏢 **Business Directory** - Comprehensive business profiles with photos, hours, services
- 🔍 **Advanced Search** - Location-based search with filters, map view, and sorting
- ⭐ **Reviews & Ratings** - Complete review system with business owner responses
- 💬 **Real-Time Messaging** - WebSocket-powered chat between customers and businesses
- 📅 **Appointment Booking** - Schedule and manage appointments
- 🗺️ **Interactive Maps** - Mapbox integration with directions and location search
- 📸 **Image Management** - Cloudinary-powered image uploads and optimization
- 📊 **Analytics Dashboard** - Business insights and platform analytics
- 👑 **Admin Panel** - Complete admin dashboard for platform management
- 🔒 **Enterprise Security** - Rate limiting, CSRF protection, input sanitization
- ⚡ **High Performance** - Optimized queries, caching, code splitting

## 🏗️ Architecture

This is a monorepo built with:
- **Turborepo** - Monorepo build system
- **Next.js 14** - Frontend (React, TypeScript, Tailwind, App Router)
- **NestJS** - Backend API (TypeScript, Prisma, PostgreSQL)
- **Supabase** - PostgreSQL database + Auth
- **Cloudinary** - Image storage and optimization
- **Mapbox** - Interactive maps
- **Upstash Redis** - Caching layer
- **Socket.io** - Real-time communication

## 📁 Project Structure

```
tarsit/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
├── packages/
│   ├── types/        # Shared TypeScript types
│   ├── config/       # Shared configs
│   └── ui/           # Shared UI components
└── docker/           # Docker configs for services
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+
- PostgreSQL (via Supabase)
- Redis (via Upstash)

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env

# Run database migrations
cd apps/api
pnpm prisma migrate dev

# Start development servers
pnpm dev
```

### Development URLs
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **API Docs:** http://localhost:4000/api

## 📦 Tech Stack Details

### Frontend (Next.js)
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** React Query + Zustand
- **Forms:** React Hook Form + Zod
- **Maps:** Leaflet / Google Maps

### Backend (NestJS)
- **Framework:** NestJS
- **Database:** PostgreSQL (Prisma ORM)
- **Auth:** Supabase Auth + JWT
- **Validation:** class-validator
- **Documentation:** Swagger/OpenAPI

### Infrastructure
- **Hosting:** Vercel (frontend) + Railway/Render (backend)
- **Database:** Supabase PostgreSQL (Prisma ORM)
- **Cache:** Upstash Redis
- **Storage:** Cloudinary (images)
- **Maps:** Mapbox
- **Real-time:** Socket.io
- **Email:** SMTP (Gmail/SendGrid)

## 🔐 Environment Variables

See `.env.example` files in each app for required environment variables.

## 📚 Documentation

- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference
- **[User Guide](./USER_GUIDE.md)** - User and business owner guides
- **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment instructions
- **[Environment Setup](./ENVIRONMENT_SETUP.md)** - Development environment setup
- **[Testing Guide](./TESTING_GUIDE.md)** - Testing documentation
- **[Launch Checklist](./LAUNCH_CHECKLIST.md)** - Pre-launch checklist
- **[Production Readiness](./PRODUCTION_READINESS.md)** - Production readiness review

## 📝 Development Phases

- [x] Phase 1: Foundation Fixes
- [x] Phase 2: Business Registration Flow
- [x] Phase 3: Reviews System
- [x] Phase 4: Image Upload System
- [x] Phase 5: Messaging System
- [x] Phase 6: Map Integration
- [x] Phase 7: Authentication & Security
- [x] Phase 8: Performance & Polish
- [x] Phase 9: Admin Dashboard
- [x] Phase 10: Testing & QA
- [x] Phase 11: Documentation & Launch Prep

## 📄 License

Proprietary - All Rights Reserved

## 👥 Team

Built with ❤️ for small business owners worldwide.
