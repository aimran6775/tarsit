import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailAdminController } from './email-admin.controller';
import { EmailPreferencesController } from './email-preferences.controller';
import { EmailPreferencesService } from './email-preferences.service';
import { EmailWebhookController } from './email-webhook.controller';
import { MailService } from './mail.service';

@Module({
  imports: [PrismaModule],
  controllers: [EmailAdminController, EmailPreferencesController, EmailWebhookController],
  providers: [MailService, EmailPreferencesService],
  exports: [MailService, EmailPreferencesService],
})
export class MailModule {}
