import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentStatus } from '@prisma/client';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentQueryDto,
} from './dto';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateAppointmentDto) {
    // Verify business exists
    const business = await this.prisma.business.findUnique({
      where: { id: dto.businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Verify service exists if provided
    if (dto.serviceId) {
      const service = await this.prisma.service.findUnique({
        where: { id: dto.serviceId },
      });

      if (!service || service.businessId !== dto.businessId) {
        throw new BadRequestException('Invalid service for this business');
      }
    }

    const { businessId, serviceId } = dto;

    return this.prisma.appointment.create({
      data: {
        date: new Date(dto.date),
        duration: dto.duration || 60, // Default 60 minutes if not provided
        status: 'PENDING',
        notes: dto.notes,
        ...(serviceId && {
          service: {
            connect: { id: serviceId },
          },
        }),
        user: {
          connect: { id: userId },
        },
        business: {
          connect: { id: businessId },
        },
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            phone: true,
            addressLine1: true,
            city: true,
            state: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findAll(query: AppointmentQueryDto) {
    const { businessId, userId, status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(businessId && { businessId }),
      ...(userId && { userId }),
      ...(status && { status }),
    };

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          business: {
            select: {
              id: true,
              name: true,
              slug: true,
              phone: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return {
      appointments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            phone: true,
            addressLine1: true,
            city: true,
            state: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async update(userId: string, id: string, dto: UpdateAppointmentDto) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // User can cancel their own appointment, business owner can update any status
    const isOwner = appointment.business.ownerId === userId;
    const isCustomer = appointment.userId === userId;

    if (!isOwner && !isCustomer) {
      throw new ForbiddenException('Not authorized to update this appointment');
    }

    // Customers can only cancel
    if (isCustomer && !isOwner && dto.status !== AppointmentStatus.CANCELED) {
      throw new ForbiddenException('Customers can only cancel appointments');
    }

    return this.prisma.appointment.update({
      where: { id },
      data: dto,
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async remove(userId: string, id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const isOwner = appointment.business.ownerId === userId;
    const isCustomer = appointment.userId === userId;

    if (!isOwner && !isCustomer) {
      throw new ForbiddenException('Not authorized to delete this appointment');
    }

    await this.prisma.appointment.delete({ where: { id } });

    return { message: 'Appointment deleted successfully' };
  }

  async getMyAppointments(userId: string, status?: AppointmentStatus) {
    const where = {
      userId,
      ...(status && { status }),
    };

    return this.prisma.appointment.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            phone: true,
          },
        },
      },
    });
  }

  async getAvailableSlots(businessId: string, date: string, serviceId?: string) {
    // Get business hours for the day
    const dayOfWeek = new Date(date).getDay();
    const businessHours = await this.prisma.businessHours.findUnique({
      where: {
        businessId_dayOfWeek: { businessId, dayOfWeek },
      },
    });

    if (!businessHours || businessHours.isClosed) {
      return { slots: [], message: 'Business is closed on this day' };
    }

    // Get existing appointments for the day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await this.prisma.appointment.findMany({
      where: {
        businessId,
        date: { gte: startOfDay, lte: endOfDay },
        status: { notIn: ['CANCELED', 'NO_SHOW'] },
      },
    });

    // Generate available slots (simplified - every 30 minutes)
    const slots: string[] = [];
    const openTime = parseInt(businessHours.openTime.split(':')[0]);
    const closeTime = parseInt(businessHours.closeTime.split(':')[0]);

    for (let hour = openTime; hour < closeTime; hour++) {
      for (const minute of [0, 30]) {
        const slotTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const isBooked = existingAppointments.some(apt => {
          const aptHour = new Date(apt.date).getHours();
          const aptMinute = new Date(apt.date).getMinutes();
          return aptHour === hour && aptMinute === minute;
        });
        if (!isBooked) {
          slots.push(slotTime);
        }
      }
    }

    return { slots, date, businessId };
  }

  async getCalendar(userId: string, businessId: string, startDate: string, endDate: string) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business || business.ownerId !== userId) {
      throw new ForbiddenException('Not authorized to view this calendar');
    }

    const appointments = await this.prisma.appointment.findMany({
      where: {
        businessId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: { date: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return { appointments, startDate, endDate };
  }

  async confirm(userId: string, id: string) {
    return this.updateStatus(userId, id, AppointmentStatus.CONFIRMED);
  }

  async cancel(userId: string, id: string, reason?: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const isOwner = appointment.business.ownerId === userId;
    const isCustomer = appointment.userId === userId;

    if (!isOwner && !isCustomer) {
      throw new ForbiddenException('Not authorized to cancel this appointment');
    }

    return this.prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.CANCELED,
        notes: reason ? `${appointment.notes || ''}\nCancellation reason: ${reason}` : appointment.notes,
      },
    });
  }

  async complete(userId: string, id: string) {
    return this.updateStatus(userId, id, AppointmentStatus.COMPLETED);
  }

  async markNoShow(userId: string, id: string) {
    return this.updateStatus(userId, id, AppointmentStatus.NO_SHOW);
  }

  private async updateStatus(userId: string, id: string, status: AppointmentStatus) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.business.ownerId !== userId) {
      throw new ForbiddenException('Only business owners can update appointment status');
    }

    return this.prisma.appointment.update({
      where: { id },
      data: { status },
    });
  }
}
