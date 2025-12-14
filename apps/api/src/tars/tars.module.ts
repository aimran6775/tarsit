import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TarsService } from './tars.service';
import { TarsController } from './tars.controller';
import { TarsMemoryService } from './memory/memory.service';
import { TarsActionsService } from './actions/actions.service';
import { TarsDatabaseQueryService } from './database/database-query.service';
import { TarsUsageService } from './usage/usage.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        ConfigModule,
        PrismaModule,
        AuthModule,
    ],
    controllers: [TarsController],
    providers: [
        TarsService,
        TarsMemoryService,
        TarsActionsService,
        TarsDatabaseQueryService,
        TarsUsageService,
    ],
    exports: [TarsService, TarsMemoryService, TarsActionsService, TarsDatabaseQueryService, TarsUsageService],
})
export class TarsModule { }

