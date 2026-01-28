# GitHub Copilot Instructions for Tarsit

## Architecture Overview

Tarsit is a **TurboRepo monorepo** with two apps:
- **`apps/api`** – NestJS backend (PostgreSQL via Prisma, Supabase Auth/Storage)
- **`apps/web`** – Next.js 14 frontend (App Router, React Query, Tailwind/Shadcn)

The platform connects users with local businesses and features "Tars", an AI assistant powered by OpenAI.

## Critical Commands

```bash
pnpm install                          # Install all dependencies
pnpm dev                              # Start both apps (web:3001, api:4000)
cd apps/api && pnpm prisma:migrate    # Run database migrations
cd apps/api && pnpm prisma:studio     # Open Prisma Studio
cd apps/api && pnpm prisma:seed:demo  # Seed demo data
pnpm test:tarsit                      # Run full test suite
```

## Data Flow & Auth Pattern

1. Frontend stores JWT in `localStorage` (`accessToken`, `refreshToken`)
2. `apiClient` ([apps/web/src/lib/api-client.ts](apps/web/src/lib/api-client.ts)) auto-attaches Bearer token via interceptor
3. Backend validates with `JwtAuthGuard` – combine with `RolesGuard` or `AdminGuard` for protected routes:
   ```typescript
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles('ADMIN', 'BUSINESS_OWNER')
   ```
4. Supabase handles auth state; `AuthContext` ([apps/web/src/contexts/auth-context.tsx](apps/web/src/contexts/auth-context.tsx)) syncs tokens

## Frontend Patterns

**API Layer:** Create typed functions in `apps/web/src/lib/api/<feature>.api.ts`, then wrap with React Query hooks in `apps/web/src/hooks/use-<feature>.ts`:
```typescript
// lib/api/business.api.ts
export const businessApi = { getById: (id) => apiClient.get(`/businesses/${id}`) }

// hooks/use-businesses.ts
export const useBusinessBySlug = (slug: string) =>
  useQuery({ queryKey: ['business', slug], queryFn: () => businessApi.getBySlug(slug) });
```

**Component Organization:**
- `components/ui/` – Shadcn primitives (Button, Card, Dialog)
- `components/features/` – Domain components (BusinessCard, ReviewCard)
- `components/tars/` – AI assistant widgets (TarsChat, TarsNudge)
- `components/map/` – Map-related components

**Form Validation:** Use `zod` with `@hookform/resolvers` (see existing forms)

## Backend Patterns

**Module Structure:** Each feature is a NestJS module at `apps/api/src/<feature>/`:
```
businesses/
├── businesses.module.ts
├── businesses.controller.ts
├── businesses.service.ts
└── dto/
    ├── create-business.dto.ts
    └── update-business.dto.ts
```

**DTOs:** Always use `class-validator` decorators for request validation:
```typescript
@IsString() @IsNotEmpty() @MinLength(2) name!: string;
```

**Database:** Schema at [apps/api/prisma/schema.prisma](apps/api/prisma/schema.prisma). Key models: `User`, `Business`, `Review`, `Region`, `Currency`

## Tars AI Integration

- Backend service: [apps/api/src/tars/tars.service.ts](apps/api/src/tars/tars.service.ts) – handles OpenAI calls, memory, actions
- Frontend widget: [apps/web/src/components/tars/TarsChat.tsx](apps/web/src/components/tars/TarsChat.tsx) – chat UI
- Context-aware personas: `general`, `help`, `business`, `booking`, `analytics`

## Forbidden Patterns

- ❌ `cloudinary` → Use Supabase Storage (`SupabaseService.uploadImage()`)
- ❌ `socket.io` → Use Supabase Realtime
- ❌ `pages/` router → Use App Router only
- ❌ `any` type → Use proper TypeScript types or DTOs

## Testing

```bash
cd apps/web && pnpm test:smoke      # Quick Playwright smoke test
cd tarsit-testing && ./quick-start.sh  # Interactive test agent
```

## Environment Setup

Required env files: `apps/web/.env.local`, `apps/api/.env`
Key variables: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `JWT_SECRET`, `OPENAI_API_KEY`
See [docs/technical/ENVIRONMENT_SETUP.md](docs/technical/ENVIRONMENT_SETUP.md) for full list.
