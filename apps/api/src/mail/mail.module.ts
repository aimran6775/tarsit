import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailAdminController } from './email-admin.controller';
import { MailService } from './mail.service';

@Module({
  imports: [PrismaModule],
  controllers: [EmailAdminController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
