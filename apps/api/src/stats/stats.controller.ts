import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StatsService } from './stats.service';

@ApiTags('stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('public')
  @ApiOperation({ summary: 'Get public platform statistics' })
  @ApiResponse({ status: 200, description: 'Returns platform statistics' })
  async getPublicStats() {
    return this.statsService.getPublicStats();
  }
}
