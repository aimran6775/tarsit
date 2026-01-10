import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from apps/api/.env if present
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function getSupabaseAdminClient(): SupabaseClient {
  const supabaseUrl = requireEnv('SUPABASE_URL');
  const supabaseServiceKey = requireEnv('SUPABASE_SERVICE_KEY');

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function deleteAllAuthUsers(supabase: SupabaseClient): Promise<number> {
  const perPage = 200;
  let deletedCount = 0;

  for (let page = 1; page < 1000; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    for (const user of data.users) {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      if (deleteError) throw deleteError;
      deletedCount += 1;
    }

    if (data.users.length < perPage) break;
  }

  return deletedCount;
}

async function main(): Promise<void> {
  if (process.env.ALLOW_DESTRUCTIVE_SUPABASE_RESET !== 'true') {
    throw new Error(
      'Refusing to run: set ALLOW_DESTRUCTIVE_SUPABASE_RESET=true to delete ALL Supabase Auth users.'
    );
  }

  const supabase = getSupabaseAdminClient();

  console.log('🧨 Supabase Auth reset starting...');
  const deleted = await deleteAllAuthUsers(supabase);
  console.log(`✅ Deleted ${deleted} Supabase Auth users`);

  console.log('Done.');
}

main().catch((e) => {
  console.error('❌ Supabase reset failed:', e);
  process.exitCode = 1;
});
