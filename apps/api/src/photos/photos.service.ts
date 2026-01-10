import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePhotoDto, PhotoQueryDto } from './dto';

@Injectable()
export class PhotosService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreatePhotoDto) {
    // Verify business exists and user is the owner
    const business = await this.prisma.business.findUnique({
      where: { id: dto.businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (business.ownerId !== userId) {
      throw new ForbiddenException('You can only add photos to your own business');
    }

    const { businessId, isPrimary, ...photoData } = dto;

    // If setting as featured, unset other featured photos for this business
    if (isPrimary) {
      await this.prisma.photo.updateMany({
        where: { businessId, featured: true },
        data: { featured: false },
      });
    }

    return this.prisma.photo.create({
      data: {
        ...photoData,
        featured: isPrimary || false,
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
          },
        },
      },
    });
  }

  async findAll(query: PhotoQueryDto) {
    const { businessId, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where = businessId ? { businessId } : {};

    const [photos, total] = await Promise.all([
      this.prisma.photo.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        include: {
          business: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      this.prisma.photo.count({ where }),
    ]);

    return {
      photos,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const photo = await this.prisma.photo.findUnique({
      where: { id },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    return photo;
  }

  async update(userId: string, id: string, dto: { featured?: boolean; caption?: string; order?: number }) {
    const photo = await this.prisma.photo.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    if (photo.business.ownerId !== userId) {
      throw new ForbiddenException('You can only update your own photos');
    }

    // If setting as featured, unset other featured photos for this business
    if (dto.featured === true) {
      await this.prisma.photo.updateMany({
        where: { 
          businessId: photo.businessId, 
          featured: true,
          id: { not: id },
        },
        data: { featured: false },
      });
    }

    return this.prisma.photo.update({
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
      },
    });
  }

  async remove(userId: string, id: string) {
    const photo = await this.prisma.photo.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    if (photo.business.ownerId !== userId) {
      throw new ForbiddenException('You can only delete your own photos');
    }

    await this.prisma.photo.delete({ where: { id } });

    return { message: 'Photo deleted successfully' };
  }
}
