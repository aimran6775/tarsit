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

    const { businessId, serviceId, ...appointmentData } = dto;

    return this.prisma.appointment.create({
      data: {
        date: new Date(dto.date),
        duration: dto.duration || 60, // Default 60 minutes if not provided
        status: 'PENDING',
        notes: dto.notes,
        ...(serviceId && { serviceId }),
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
}
