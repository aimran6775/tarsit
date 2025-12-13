import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Basic health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    };
  }

  @Get('detailed')
  @ApiOperation({ summary: 'Detailed health check with all services' })
  @ApiResponse({ status: 200, description: 'Detailed health status' })
  async detailedCheck() {
    return this.healthService.getDetailedHealth();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check for all critical services' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  @ApiResponse({ status: 503, description: 'Service is not ready' })
  async readiness() {
    return this.healthService.checkReadiness();
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness check' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  async liveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }
}
