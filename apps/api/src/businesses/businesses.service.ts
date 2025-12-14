import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessDto, UpdateBusinessDto, BusinessQueryDto } from './dto';

@Injectable()
export class BusinessesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateBusinessDto) {
    // Verify user is a business owner
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || (user.role !== 'BUSINESS_OWNER' && user.role !== 'ADMIN')) {
      throw new ForbiddenException('Only business owners can create businesses');
    }

    // Verify category exists
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    // Generate slug from name
    const slug = this.generateSlug(dto.name);

    // Check if slug already exists
    const existingBusiness = await this.prisma.business.findUnique({
      where: { slug },
    });

    if (existingBusiness) {
      // Add random suffix to make it unique
      const uniqueSlug = `${slug}-${Date.now().toString(36)}`;
      return this.createBusiness(userId, dto, uniqueSlug);
    }

    return this.createBusiness(userId, dto, slug);
  }

  private async createBusiness(
    userId: string,
    dto: CreateBusinessDto,
    slug: string,
  ) {
    const { categoryId, hours, amenities, ...businessData } = dto;
    
    return this.prisma.business.create({
      data: {
        ...businessData,
        slug,
        ...(hours && { hours: hours as Prisma.InputJsonValue }),
        ...(amenities && { amenities: amenities as Prisma.InputJsonValue }),
        owner: {
          connect: { id: userId },
        },
        category: {
          connect: { id: categoryId },
        },
      },
      include: {
        category: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(query: BusinessQueryDto) {
    const {
      search,
      categoryId,
      city,
      state,
      priceRange,
      latitude,
      longitude,
      radius = 10,
      verified,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (city) {
      where.city = { equals: city, mode: 'insensitive' };
    }

    if (state) {
      where.state = { equals: state, mode: 'insensitive' };
    }

    if (priceRange) {
      where.priceRange = priceRange;
    }

    if (verified !== undefined) {
      where.verified = verified === true;
    }

    // Geospatial search (simplified - in production use PostGIS)
    if (latitude !== undefined && longitude !== undefined) {
      // Calculate bounding box for the radius
      const latDelta = radius / 111; // Rough approximation: 1 degree ≈ 111 km
      const lngDelta = radius / (111 * Math.cos((latitude * Math.PI) / 180));

      where.latitude = {
        gte: latitude - latDelta,
        lte: latitude + latDelta,
      };
      where.longitude = {
        gte: longitude - lngDelta,
        lte: longitude + lngDelta,
      };
    }

    // Get total count
    const total = await this.prisma.business.count({ where });

    // Get businesses
    const businesses = await this.prisma.business.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        category: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            photos: true,
            services: true,
          },
        },
      },
    });

    return {
      data: businesses,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const business = await this.prisma.business.findUnique({
      where: { id },
      include: {
        category: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        services: {
          orderBy: { order: 'asc' },
        },
        photos: {
          orderBy: { order: 'asc' },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            reviews: true,
            photos: true,
            services: true,
            favorites: true,
          },
        },
      },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return business;
  }

  async findBySlug(slug: string) {
    const business = await this.prisma.business.findUnique({
      where: { slug },
      include: {
        category: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        services: {
          orderBy: { order: 'asc' },
        },
        photos: {
          orderBy: { order: 'asc' },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            reviews: true,
            photos: true,
            services: true,
            favorites: true,
          },
        },
      },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return business;
  }

  async update(id: string, userId: string, userRole: string, dto: UpdateBusinessDto) {
    const business = await this.prisma.business.findUnique({
      where: { id },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Check ownership or admin
    if (business.ownerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only update your own businesses');
    }

    // If name is being changed, regenerate slug
    let slug = business.slug;
    if (dto.name && dto.name !== business.name) {
      slug = this.generateSlug(dto.name);
      
      // Check if new slug exists
      const existingBusiness = await this.prisma.business.findFirst({
        where: { slug, id: { not: id } },
      });

      if (existingBusiness) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }
    }

    const { categoryId, ...businessData } = dto;
    const updateData: Record<string, unknown> = {
      ...businessData,
      slug,
    };

    if (categoryId) {
      updateData.category = {
        connect: { id: categoryId },
      };
    }

    return this.prisma.business.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string, userRole: string) {
    const business = await this.prisma.business.findUnique({
      where: { id },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Check ownership or admin
    if (business.ownerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only delete your own businesses');
    }

    // Soft delete by marking as inactive
    return this.prisma.business.delete({
      where: { id },
    });
  }

  async findByOwnerId(ownerId: string) {
    const business = await this.prisma.business.findFirst({
      where: { ownerId },
      include: {
        category: true,
        photos: {
          orderBy: { order: 'asc' },
          take: 5,
        },
        services: {
          where: { active: true },
        },
        _count: {
          select: {
            reviews: true,
            photos: true,
            services: true,
          },
        },
      },
    });

    if (!business) {
      throw new NotFoundException('No business found for this user');
    }

    return business;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
