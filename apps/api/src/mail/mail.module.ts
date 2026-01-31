import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailAdminController } from './email-admin.controller';
import { EmailPreferencesController } from './email-preferences.controller';
import { EmailPreferencesService } from './email-preferences.service';
import { MailService } from './mail.service';

@Module({
  imports: [PrismaModule],
  controllers: [EmailAdminController, EmailPreferencesController],
  providers: [MailService, EmailPreferencesService],
  exports: [MailService, EmailPreferencesService],
})
export class MailModule {}
