import { Module } from '@nestjs/common';
import { BusinessHoursService } from './business-hours.service';
import { BusinessHoursController } from './business-hours.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TeamModule } from '../team/team.module';

@Module({
  imports: [PrismaModule, TeamModule],
  controllers: [BusinessHoursController],
  providers: [BusinessHoursService],
  exports: [BusinessHoursService],
})
export class BusinessHoursModule {}
