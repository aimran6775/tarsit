import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import {
  CreateVerificationRequestDto,
} from './dto/create-verification-request.dto';
import {
  UpdateVerificationRequestDto,
  VerificationStatus,
} from './dto/update-verification-request.dto';

@Injectable()
export class VerificationRequestsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(userId: string, dto: CreateVerificationRequestDto) {
    // Check if business exists and belongs to the user
    const business = await this.prisma.business.findUnique({
      where: { id: dto.businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (business.ownerId !== userId) {
      throw new ForbiddenException(
        'You can only request verification for your own businesses',
      );
    }

    if (business.verified) {
      throw new BadRequestException('Business is already verified');
    }

    // Check if there's already a pending request
    const existingRequest =
      await this.prisma.verificationRequest.findFirst({
        where: {
          businessId: dto.businessId,
          status: 'PENDING',
        },
      });

    if (existingRequest) {
      throw new BadRequestException(
        'A verification request is already pending for this business',
      );
    }

    return this.prisma.verificationRequest.create({
      data: {
        businessId: dto.businessId,
        userId,
        notes: dto.notes,
        documents: dto.documents || [],
        status: 'PENDING',
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            verified: true,
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

  async findAll(
    userId: string,
    isAdmin: boolean,
    status?: VerificationStatus,
  ) {
    const where: any = {};

    // Regular users can only see their own requests
    if (!isAdmin) {
      where.userId = userId;
    }

    // Filter by status if provided
    if (status) {
      where.status = status;
    }

    return this.prisma.verificationRequest.findMany({
      where,
      include: {
        business: {
          select: {
            id: true,
            name: true,
            verified: true,
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
        reviewedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
              lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string, isAdmin: boolean) {
    const request = await this.prisma.verificationRequest.findUnique({
      where: { id },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            verified: true,
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
        reviewedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
              lastName: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Verification request not found');
    }

    // Regular users can only see their own requests
    if (!isAdmin && request.userId !== userId) {
      throw new ForbiddenException(
        'You can only view your own verification requests',
      );
    }

    return request;
  }

  async approve(id: string, adminId: string, adminNotes?: string) {
    const request = await this.prisma.verificationRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Verification request not found');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException(
        'Only pending requests can be approved',
      );
    }

    // Update verification request and business in a transaction
    const [updatedRequest] = await this.prisma.$transaction([
      this.prisma.verificationRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          reviewedById: adminId,
          reviewedAt: new Date(),
          adminNotes,
        },
        include: {
          business: {
            select: {
              id: true,
            name: true,
              verified: true,
              owner: {
                select: {
                  email: true,
                },
              },
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
          reviewedBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      // Mark the business as verified
      this.prisma.business.update({
        where: { id: request.businessId },
        data: { 
          verified: true,
          verifiedAt: new Date(),
        },
      }),
    ]);

    // Send approval email
    try {
      await this.mailService.sendVerificationStatusEmail(
        updatedRequest.user.email,
        updatedRequest.user.firstName,
        updatedRequest.business.name,
        'approved',
        adminNotes,
      );
    } catch (error) {
      // Log error but don't fail the request
      console.error('Failed to send verification approval email:', error);
    }

    return updatedRequest;
  }

  async reject(id: string, adminId: string, adminNotes?: string) {
    const request = await this.prisma.verificationRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Verification request not found');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException(
        'Only pending requests can be rejected',
      );
    }

    const updatedRequest = await this.prisma.verificationRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedById: adminId,
        reviewedAt: new Date(),
        adminNotes,
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            verified: true,
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
        reviewedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Send rejection email
    try {
      await this.mailService.sendVerificationStatusEmail(
        updatedRequest.user.email,
        updatedRequest.user.firstName,
        updatedRequest.business.name,
        'rejected',
        adminNotes,
      );
    } catch (error) {
      // Log error but don't fail the request
      console.error('Failed to send verification rejection email:', error);
    }

    return updatedRequest;
  }

  async update(
    id: string,
    adminId: string,
    dto: UpdateVerificationRequestDto,
  ) {
    const request = await this.prisma.verificationRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Verification request not found');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException(
        'Only pending requests can be updated',
      );
    }

    // If approving, also verify the business
    if (dto.status === VerificationStatus.APPROVED) {
      return this.approve(id, adminId, dto.adminNotes);
    }

    // If rejecting
    if (dto.status === VerificationStatus.REJECTED) {
      return this.reject(id, adminId, dto.adminNotes);
    }

    // Otherwise just update notes
    return this.prisma.verificationRequest.update({
      where: { id },
      data: {
        adminNotes: dto.adminNotes,
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            verified: true,
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
        reviewedBy: {
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
}
