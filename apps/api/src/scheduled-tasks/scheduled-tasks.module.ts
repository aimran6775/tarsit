/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SCHEDULED TASKS MODULE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Provides scheduled/cron task functionality for the application.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { Module } from '@nestjs/common';
import { ScheduledTasksService } from './scheduled-tasks.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, MailModule],
  providers: [ScheduledTasksService],
  exports: [ScheduledTasksService],
})
export class ScheduledTasksModule {}
