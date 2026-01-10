import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditService } from './services/audit.service';
import { EnvironmentService } from './services/environment.service';
import { LoggerService } from './services/logger.service';
import { SpamDetectionService } from './services/spam-detection.service';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [LoggerService, AuditService, SpamDetectionService, EnvironmentService],
  exports: [LoggerService, AuditService, SpamDetectionService, EnvironmentService],
})
export class CommonModule {}
