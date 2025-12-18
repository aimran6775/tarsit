import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.error('❌ .env file not found at', envPath);
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

console.log('🔄 Connecting to Supabase...');
console.log(`   URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
  try {
    // 1. Test Auth (List users - requires service role)
    console.log('\n1️⃣  Testing Auth Connection...');
    const {
      data: { users },
      error: authError,
    } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });

    if (authError) throw authError;
    console.log('   ✅ Auth Service Connected');
    console.log(`   ℹ️  Found ${users.length} users (sample)`);

    // 2. Test Storage (List buckets)
    console.log('\n2️⃣  Testing Storage Connection...');
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();

    if (storageError) throw storageError;
    console.log('   ✅ Storage Service Connected');

    const mediaBucket = buckets.find((b) => b.name === 'tarsit-media');
    if (mediaBucket) {
      console.log('   ✅ "tarsit-media" bucket found');
    } else {
      console.log('   ⚠️  "tarsit-media" bucket NOT found. Attempting to create...');
      const { data: bucket, error: createError } = await supabase.storage.createBucket(
        'tarsit-media',
        {
          public: true,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'application/pdf'],
        }
      );

      if (createError) {
        console.log(`   ❌ Failed to create bucket: ${createError.message}`);
      } else {
        console.log('   ✅ "tarsit-media" bucket created successfully');
      }
    }

    // 3. Test Database (via PostgREST - requires table to exist)
    // We'll try to select from a common table like 'User' or just check health if possible
    console.log('\n3️⃣  Testing Database (PostgREST)...');
    // Note: This depends on RLS policies if using anon key, but we are using service key so we bypass RLS.
    // We assume a 'User' table exists from Prisma migration.
    // Note: Supabase exposes tables via PostgREST, but sometimes case sensitivity matters or schema cache needs refresh.
    // We'll try 'User' and 'user' just in case.

    let dbError;
    let tableData;

    // Try 'User' (Prisma default)
    const { data: data1, error: error1 } = await supabase
      .from('User')
      .select('count', { count: 'exact', head: true });

    if (!error1) {
      tableData = data1;
    } else {
      // Try 'user' (lowercase)
      const { data: data2, error: error2 } = await supabase
        .from('user')
        .select('count', { count: 'exact', head: true });

      if (!error2) {
        tableData = data2;
      } else {
        dbError = error1; // Report the first error usually
      }
    }

    if (dbError) {
      console.log(`   ⚠️  Database check failed: ${dbError.message} (Code: ${dbError.code})`);
      console.log('       This is likely due to the Supabase API Schema Cache being stale.');
      console.log(
        '       ACTION REQUIRED: Go to Supabase Dashboard -> Project Settings -> API -> "Reload schema cache"'
      );
    } else {
      console.log('   ✅ Database Connection (PostgREST) Successful');
    }

    console.log('\n🎉 Supabase Integration Verification Complete!');
  } catch (error) {
    console.error('\n❌ Supabase Test Failed:', error.message);
    process.exit(1);
  }
}

testSupabase();
