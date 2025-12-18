import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiResponse } from '@nestjs/swagger';
import { BusinessHoursService } from './business-hours.service';
import { SetBusinessHoursDto, BusinessHourDto, UpdateAppointmentSettingsDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';

@ApiTags('business-hours')
@Controller('businesses/:businessId')
export class BusinessHoursController {
  constructor(private readonly businessHoursService: BusinessHoursService) { }

  @Get('hours')
  @ApiOperation({ summary: 'Get business hours for a business' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiResponse({ status: 200, description: 'Business hours retrieved' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async getBusinessHours(@Param('businessId') businessId: string) {
    return this.businessHoursService.getBusinessHours(businessId);
  }

  @Post('hours')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set business hours (replace all)' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiResponse({ status: 200, description: 'Business hours updated' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  async setBusinessHours(
    @Req() req: AuthenticatedRequest,
    @Param('businessId') businessId: string,
    @Body() dto: SetBusinessHoursDto,
  ) {
    return this.businessHoursService.setBusinessHours(req.user.id, businessId, dto);
  }

  @Put('hours/:dayOfWeek')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update hours for a specific day' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiParam({ name: 'dayOfWeek', description: 'Day of week (0-6)' })
  @ApiResponse({ status: 200, description: 'Day hours updated' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  async updateDayHours(
    @Req() req: AuthenticatedRequest,
    @Param('businessId') businessId: string,
    @Param('dayOfWeek') dayOfWeek: string,
    @Body() dto: BusinessHourDto,
  ) {
    return this.businessHoursService.updateDayHours(
      req.user.id,
      businessId,
      parseInt(dayOfWeek, 10),
      dto,
    );
  }

  @Post('hours/initialize')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initialize default business hours' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiResponse({ status: 200, description: 'Default hours initialized' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  async initializeDefaultHours(
    @Req() req: AuthenticatedRequest,
    @Param('businessId') businessId: string,
  ) {
    // First verify permission - the service will check this
    return this.businessHoursService.initializeDefaultHours(businessId);
  }

  @Get('appointment-settings')
  @ApiOperation({ summary: 'Get appointment settings for a business' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiResponse({ status: 200, description: 'Appointment settings retrieved' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async getAppointmentSettings(@Param('businessId') businessId: string) {
    return this.businessHoursService.getAppointmentSettings(businessId);
  }

  @Put('appointment-settings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update appointment settings' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiResponse({ status: 200, description: 'Appointment settings updated' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  async updateAppointmentSettings(
    @Req() req: AuthenticatedRequest,
    @Param('businessId') businessId: string,
    @Body() dto: UpdateAppointmentSettingsDto,
  ) {
    return this.businessHoursService.updateAppointmentSettings(
      req.user.id,
      businessId,
      dto,
    );
  }
}
