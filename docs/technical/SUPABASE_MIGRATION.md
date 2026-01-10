# Supabase Migration Guide

## 1. Environment Setup
Ensure your `apps/api/.env` and `apps/web/.env.local` have the following:

```env
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_KEY="your-service-role-key" # Backend only
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
DATABASE_URL="postgresql://postgres:[password]@db.project.supabase.co:5432/postgres"
```

## 2. Authentication
The backend is now equipped to handle Supabase Auth.
- **Backend**: `AuthService` has `registerWithSupabase`. `SupabaseAuthGuard` can protect routes.
- **Frontend**: You need to update `apps/web/src/contexts/auth-context.tsx` to use `@supabase/auth-helpers-nextjs` or `@supabase/supabase-js`.

## 3. Storage
`UploadsService` in the backend already uses Supabase Storage.
- Ensure you have a bucket named `tarsit-media` in your Supabase Storage.
- Set the policy to allow public read access.

## 4. Chat (Realtime)
To migrate Chat to Supabase:
1. **Database**: Ensure your `Message` table exists in Supabase (via Prisma).
2. **Realtime**: Enable Realtime for the `Message` table in Supabase Dashboard (Database -> Replication).
3. **Frontend**:
   - Remove `socket.io-client`.
   - Use `supabase.channel('room1').on('postgres_changes', ...)` to listen for new messages.
   - When sending a message, you can still call the Backend API (which saves to DB), and Supabase will notify all clients.

## 5. Database Migration
1. Update `DATABASE_URL` in `.env`.
2. Run `npx prisma migrate deploy` to push your schema to Supabase.
