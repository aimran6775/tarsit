import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const testPassword = 'abdullah1234!';

const testUsers = [
  { email: 'admin@tarsit.com', firstName: 'Admin', lastName: 'Tarsit', role: 'ADMIN' as const },
  { email: 'testcustomer@tarsit.com', firstName: 'Test', lastName: 'Customer', role: 'CUSTOMER' as const },
  { email: 'testowner@tarsit.com', firstName: 'Test', lastName: 'Owner', role: 'BUSINESS_OWNER' as const, phone: '+14155550001' },
];

async function main() {
  console.log('🌱 Seeding users in Supabase Auth and Database...\n');
  
  for (const user of testUsers) {
    console.log(`\n📧 Processing ${user.email}...`);
    
    // Check if user exists in database
    let dbUser = await prisma.user.findUnique({ where: { email: user.email } });
    
    // Try to find or create in Supabase
    let supabaseUserId: string | null = null;
    
    // Try sign in first
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: testPassword,
    });
    
    if (!signInError && signInData.user) {
      supabaseUserId = signInData.user.id;
      console.log(`  ✅ User exists in Supabase Auth`);
    } else {
      console.log(`  ℹ️ User not in Supabase, creating...`);
      
      // Create user in Supabase
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: testPassword,
        email_confirm: true,
        user_metadata: {
          first_name: user.firstName,
          last_name: user.lastName,
          role: user.role,
        },
      });
      
      if (createError) {
        if (createError.message?.includes('already')) {
          // User exists but with different password - update password
          const { data: listData } = await supabase.auth.admin.listUsers();
          const existing = listData?.users?.find(u => u.email === user.email);
          if (existing) {
            supabaseUserId = existing.id;
            await supabase.auth.admin.updateUserById(existing.id, { password: testPassword });
            console.log(`  🔄 Updated password in Supabase`);
          }
        } else {
          console.error(`  ❌ Failed to create in Supabase:`, createError.message);
          continue;
        }
      } else if (createData.user) {
        supabaseUserId = createData.user.id;
        console.log(`  ✅ Created in Supabase Auth`);
      }
    }
    
    // Create or update in database
    const passwordHash = await bcrypt.hash(testPassword, 10);
    
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email: user.email,
          passwordHash,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          phone: user.phone,
          verified: true,
          provider: 'supabase',
          providerId: supabaseUserId,
        },
      });
      console.log(`  ✅ Created in Database`);
    } else {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { passwordHash, providerId: supabaseUserId || dbUser.providerId },
      });
      console.log(`  ✅ Updated in Database`);
    }
  }
  
  console.log('\n✨ Seeding complete!\n');
  console.log('Test accounts:');
  console.log('  - admin@tarsit.com / abdullah1234!');
  console.log('  - testcustomer@tarsit.com / abdullah1234!');
  console.log('  - testowner@tarsit.com / abdullah1234!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
