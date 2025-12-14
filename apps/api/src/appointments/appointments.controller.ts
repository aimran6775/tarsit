import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto, AppointmentQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AppointmentStatus } from '@prisma/client';

@ApiTags('appointments')
@Controller('appointments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) { }

  @Post()
  @ApiOperation({ summary: 'Book appointment' })
  @ApiResponse({ status: 201, description: 'Appointment created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid service for business or time slot not available' })
  @ApiResponse({ status: 404, description: 'Business or service not found' })
  create(@GetUser('id') userId: string, @Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List appointments with filters' })
  @ApiResponse({ status: 200, description: 'Appointments retrieved successfully' })
  findAll(@Query() query: AppointmentQueryDto) {
    return this.appointmentsService.findAll(query);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user appointments' })
  @ApiQuery({ name: 'status', required: false, enum: AppointmentStatus })
  @ApiResponse({ status: 200, description: 'User appointments retrieved successfully' })
  getMyAppointments(
    @GetUser('id') userId: string,
    @Query('status') status?: AppointmentStatus,
  ) {
    return this.appointmentsService.getMyAppointments(userId, status);
  }

  @Get('business/:businessId/slots')
  @ApiOperation({ summary: 'Get available time slots for a business on a date' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiQuery({ name: 'date', required: true, description: 'Date in YYYY-MM-DD format' })
  @ApiQuery({ name: 'serviceId', required: false, description: 'Service ID for duration' })
  @ApiResponse({ status: 200, description: 'Available slots retrieved successfully' })
  getAvailableSlots(
    @Param('businessId') businessId: string,
    @Query('date') date: string,
    @Query('serviceId') serviceId?: string,
  ) {
    return this.appointmentsService.getAvailableSlots(businessId, date, serviceId);
  }

  @Get('business/:businessId/calendar')
  @ApiOperation({ summary: 'Get calendar view of appointments for business' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiQuery({ name: 'startDate', required: true, description: 'Start date' })
  @ApiQuery({ name: 'endDate', required: true, description: 'End date' })
  @ApiResponse({ status: 200, description: 'Calendar retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  getCalendar(
    @GetUser('id') userId: string,
    @Param('businessId') businessId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.appointmentsService.getCalendar(userId, businessId, startDate, endDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment by ID' })
  @ApiResponse({ status: 200, description: 'Appointment retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm a pending appointment' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiResponse({ status: 200, description: 'Appointment confirmed successfully' })
  @ApiResponse({ status: 400, description: 'Only pending appointments can be confirmed' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  confirm(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.appointmentsService.confirm(userId, id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel an appointment' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiQuery({ name: 'reason', required: false, description: 'Cancellation reason' })
  @ApiResponse({ status: 200, description: 'Appointment cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Cannot cancel this appointment' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  cancel(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Query('reason') reason?: string,
  ) {
    return this.appointmentsService.cancel(userId, id, reason);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark an appointment as completed' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiResponse({ status: 200, description: 'Appointment marked as completed' })
  @ApiResponse({ status: 400, description: 'Only confirmed appointments can be completed' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  complete(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.appointmentsService.complete(userId, id);
  }

  @Post(':id/no-show')
  @ApiOperation({ summary: 'Mark an appointment as no-show' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiResponse({ status: 200, description: 'Appointment marked as no-show' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  markNoShow(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.appointmentsService.markNoShow(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update appointment (legacy)' })
  @ApiResponse({ status: 200, description: 'Appointment updated successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  update(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete appointment' })
  @ApiResponse({ status: 200, description: 'Appointment deleted successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to delete this appointment' })
  remove(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.appointmentsService.remove(userId, id);
  }
}
