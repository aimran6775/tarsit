/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SCHEDULED TASKS MODULE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Provides scheduled/cron task functionality for the application.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ScheduledTasksService } from './scheduled-tasks.service';

@Module({
  imports: [PrismaModule, MailModule],
  providers: [ScheduledTasksService],
  exports: [ScheduledTasksService],
})
export class ScheduledTasksModule {}
