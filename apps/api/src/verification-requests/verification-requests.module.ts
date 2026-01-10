import { Module } from '@nestjs/common';
import { VerificationRequestsService } from './verification-requests.service';
import { VerificationRequestsController } from './verification-requests.controller';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [VerificationRequestsController],
  providers: [VerificationRequestsService],
})
export class VerificationRequestsModule {}
