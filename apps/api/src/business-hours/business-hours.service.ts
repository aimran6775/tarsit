import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TeamService } from '../team/team.service';
import { SetBusinessHoursDto, UpdateAppointmentSettingsDto, BusinessHourDto } from './dto';

@Injectable()
export class BusinessHoursService {
  constructor(
    private prisma: PrismaService,
    private teamService: TeamService,
  ) {}

  /**
   * Get business hours for a business
   */
  async getBusinessHours(businessId: string) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const hours = await this.prisma.businessHours.findMany({
      where: { businessId },
      orderBy: { dayOfWeek: 'asc' },
    });

    // Return hours with day names
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return hours.map(h => ({
      ...h,
      dayName: dayNames[h.dayOfWeek],
    }));
  }

  /**
   * Set business hours for a business (replace all)
   */
  async setBusinessHours(userId: string, businessId: string, dto: SetBusinessHoursDto) {
    // Verify permissions
    const hasPermission = await this.checkPermission(userId, businessId, 'canManageHours');
    if (!hasPermission) {
      throw new ForbiddenException('Not authorized to manage business hours');
    }

    // Validate hours
    this.validateHours(dto.hours);

    // Delete existing hours and create new ones
    await this.prisma.$transaction(async (tx) => {
      await tx.businessHours.deleteMany({
        where: { businessId },
      });

      await tx.businessHours.createMany({
        data: dto.hours.map(h => ({
          businessId,
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime,
          closeTime: h.closeTime,
          isClosed: h.isClosed ?? false,
        })),
      });
    });

    return this.getBusinessHours(businessId);
  }

  /**
   * Update a single day's hours
   */
  async updateDayHours(userId: string, businessId: string, dayOfWeek: number, dto: BusinessHourDto) {
    // Verify permissions
    const hasPermission = await this.checkPermission(userId, businessId, 'canManageHours');
    if (!hasPermission) {
      throw new ForbiddenException('Not authorized to manage business hours');
    }

    // Validate single day hours
    this.validateHours([dto]);

    const existingHours = await this.prisma.businessHours.findUnique({
      where: {
        businessId_dayOfWeek: { businessId, dayOfWeek },
      },
    });

    if (existingHours) {
      return this.prisma.businessHours.update({
        where: { id: existingHours.id },
        data: {
          openTime: dto.openTime,
          closeTime: dto.closeTime,
          isClosed: dto.isClosed ?? false,
        },
      });
    } else {
      return this.prisma.businessHours.create({
        data: {
          businessId,
          dayOfWeek,
          openTime: dto.openTime,
          closeTime: dto.closeTime,
          isClosed: dto.isClosed ?? false,
        },
      });
    }
  }

  /**
   * Get appointment settings for a business
   */
  async getAppointmentSettings(businessId: string) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: {
        id: true,
        appointmentsEnabled: true,
        appointmentDuration: true,
        appointmentBuffer: true,
        advanceBookingDays: true,
      },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return business;
  }

  /**
   * Update appointment settings
   */
  async updateAppointmentSettings(
    userId: string,
    businessId: string,
    dto: UpdateAppointmentSettingsDto,
  ) {
    // Verify permissions
    const hasPermission = await this.checkPermission(userId, businessId, 'canManageAppointments');
    if (!hasPermission) {
      throw new ForbiddenException('Not authorized to manage appointment settings');
    }

    return this.prisma.business.update({
      where: { id: businessId },
      data: {
        appointmentsEnabled: dto.appointmentsEnabled,
        appointmentDuration: dto.appointmentDuration,
        appointmentBuffer: dto.appointmentBuffer,
        advanceBookingDays: dto.advanceBookingDays,
      },
      select: {
        id: true,
        appointmentsEnabled: true,
        appointmentDuration: true,
        appointmentBuffer: true,
        advanceBookingDays: true,
      },
    });
  }

  /**
   * Initialize default business hours (Mon-Fri 9-5, Sat 10-2, Sun closed)
   */
  async initializeDefaultHours(businessId: string) {
    const defaultHours = [
      { dayOfWeek: 0, openTime: '00:00', closeTime: '00:00', isClosed: true }, // Sunday
      { dayOfWeek: 1, openTime: '09:00', closeTime: '17:00', isClosed: false }, // Monday
      { dayOfWeek: 2, openTime: '09:00', closeTime: '17:00', isClosed: false }, // Tuesday
      { dayOfWeek: 3, openTime: '09:00', closeTime: '17:00', isClosed: false }, // Wednesday
      { dayOfWeek: 4, openTime: '09:00', closeTime: '17:00', isClosed: false }, // Thursday
      { dayOfWeek: 5, openTime: '09:00', closeTime: '17:00', isClosed: false }, // Friday
      { dayOfWeek: 6, openTime: '10:00', closeTime: '14:00', isClosed: false }, // Saturday
    ];

    await this.prisma.businessHours.createMany({
      data: defaultHours.map(h => ({
        businessId,
        ...h,
      })),
      skipDuplicates: true,
    });

    return this.getBusinessHours(businessId);
  }

  /**
   * Check if user has permission to manage the business
   */
  private async checkPermission(
    userId: string,
    businessId: string,
    permission: 'canManageHours' | 'canManageAppointments',
  ): Promise<boolean> {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Owner always has permission
    if (business.ownerId === userId) return true;

    // Check team member permission
    return this.teamService.hasPermission(userId, businessId, permission);
  }

  /**
   * Validate business hours
   */
  private validateHours(hours: BusinessHourDto[]) {
    for (const h of hours) {
      if (h.isClosed) continue;

      // Parse times
      const [openHour, openMin] = h.openTime.split(':').map(Number);
      const [closeHour, closeMin] = h.closeTime.split(':').map(Number);

      const openMinutes = openHour * 60 + openMin;
      const closeMinutes = closeHour * 60 + closeMin;

      if (closeMinutes <= openMinutes) {
        throw new BadRequestException(
          `Closing time must be after opening time for day ${h.dayOfWeek}`,
        );
      }
    }
  }
}
