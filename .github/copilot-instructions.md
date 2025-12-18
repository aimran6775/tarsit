# GitHub Copilot Instructions for Tarsit

## Project Overview

Tarsit is a monorepo containing a Next.js frontend (`apps/web`) and a NestJS backend (`apps/api`).
The platform connects users with local businesses, featuring an AI assistant named "Tars".
Documentation is located in the `docs/` directory.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, Shadcn UI, Lucide Icons.
- **Backend:** NestJS, Prisma (PostgreSQL), Supabase (Auth, Storage, Realtime).
- **AI:** OpenAI API (GPT-4/3.5).
- **Package Manager:** pnpm (TurboRepo).

## Key Architecture Rules

1.  **Supabase Only:** Use Supabase for Authentication, File Storage (Buckets), and Realtime (WebSockets). Do NOT use Cloudinary or Socket.io.
2.  **Strict Typing:** All code must be strictly typed. Avoid `any`. Use DTOs for API requests/responses.
3.  **Component Structure:**
    - UI components: `apps/web/src/components/ui`
    - Feature components: `apps/web/src/components/features`
    - Tars AI components: `apps/web/src/components/tars`
    - Map components: `apps/web/src/components/map`
4.  **API Structure:**
    - Feature modules in `apps/api/src/<feature>`
    - DTOs in `apps/api/src/<feature>/dto`
    - Guards in `apps/api/src/auth/guards`

## Coding Standards

- **Frontend:** Use functional components with hooks. Use `zod` for form validation.
- **Backend:** Use NestJS decorators (`@Controller`, `@Get`, `@Post`). Use `class-validator` for DTOs.
- **Testing:** Write unit tests for backend services. Write E2E tests with Playwright for critical flows.

## Common Tasks

- **New Feature:** Create a new module in API and a new route group in Web.
- **Database Change:** Modify `apps/api/prisma/schema.prisma` and run `pnpm prisma:migrate`.
- **AI Logic:** Implement AI logic in `apps/api/src/tars` or `apps/web/src/lib/ai`.

## Forbidden Libraries

- `cloudinary` (Use Supabase Storage)
- `socket.io` (Use Supabase Realtime)
- `pages` router (Use App Router)
