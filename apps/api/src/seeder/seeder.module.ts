import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { StartupSeederService } from './startup-seeder.service';

@Module({
  imports: [ConfigModule, PrismaModule, SupabaseModule],
  providers: [StartupSeederService],
  exports: [StartupSeederService],
})
export class SeederModule {}
