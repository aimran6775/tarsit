import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { CreateAnalyticsEventDto, AnalyticsQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('analytics')
@Controller('api/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('events')
  @ApiOperation({ summary: 'Track analytics event' })
  @ApiResponse({ status: 201, description: 'Event tracked successfully' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  trackEvent(@Body() dto: CreateAnalyticsEventDto) {
    return this.analyticsService.trackEvent(dto);
  }

  @Get('business/:id')
  @ApiOperation({ summary: 'Get business analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  getBusinessAnalytics(@Param('id') id: string, @Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getBusinessAnalytics(id, query);
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get platform dashboard (admin only)' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  getPlatformDashboard() {
    return this.analyticsService.getPlatformDashboard();
  }

  @Get('business/:id/insights')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get detailed business insights (peak hours, ratings, conversions)' })
  @ApiResponse({ status: 200, description: 'Insights retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  getBusinessInsights(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getBusinessInsights(id, { startDate, endDate });
  }

  @Get('trends')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get platform trends (category popularity, growth metrics, top users)' })
  @ApiResponse({ status: 200, description: 'Trends retrieved successfully' })
  getPlatformTrends(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getPlatformTrends({ startDate, endDate });
  }

  @Get('business/:id/report')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate comprehensive business report (JSON or CSV)' })
  @ApiResponse({ status: 200, description: 'Report generated successfully' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  generateReport(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('format') format?: 'json' | 'csv',
  ) {
    return this.analyticsService.generateReport(id, { startDate, endDate, format });
  }
}
