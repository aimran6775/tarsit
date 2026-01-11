import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessQueryDto, CreateBusinessDto, UpdateBusinessDto } from './dto';

// Country to region code mapping
const COUNTRY_TO_REGION: Record<string, string> = {
  'USA': 'US',
  'United States': 'US',
  'US': 'US',
  'UAE': 'UAE',
  'United Arab Emirates': 'UAE',
  'Saudi Arabia': 'SAU',
  'KSA': 'SAU',
  'United Kingdom': 'UK',
  'UK': 'UK',
  'GB': 'UK',
  'Canada': 'CA',
  'Australia': 'AU',
  'Germany': 'DE',
  'France': 'FR',
  'Spain': 'ES',
  'Pakistan': 'PK',
  'India': 'IN',
};

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

    // Auto-detect region from country if not provided
    let regionId = dto.regionId;
    if (!regionId && dto.country) {
      const regionCode = COUNTRY_TO_REGION[dto.country] || COUNTRY_TO_REGION[dto.country.toUpperCase()];
      if (regionCode) {
        const region = await this.prisma.region.findUnique({
          where: { code: regionCode },
        });
        if (region) {
          regionId = region.id;
        }
      }
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
      return this.createBusiness(userId, dto, uniqueSlug, regionId);
    }

    return this.createBusiness(userId, dto, slug, regionId);
  }

  private async createBusiness(userId: string, dto: CreateBusinessDto, slug: string, regionId?: string) {
    const { categoryId, hours, amenities, regionId: _dtoRegionId, defaultLanguage, ...businessData } = dto;

    return this.prisma.business.create({
      data: {
        ...businessData,
        slug,
        ...(hours && { hours: hours as Prisma.InputJsonValue }),
        ...(amenities && { amenities: amenities as Prisma.InputJsonValue }),
        ...(regionId && { region: { connect: { id: regionId } } }),
        ...(defaultLanguage && { defaultLanguage }),
        owner: {
          connect: { id: userId },
        },
        category: {
          connect: { id: categoryId },
        },
      },
      include: {
        category: true,
        region: true,
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
      regionCode,
      regionId,
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

    // Region filtering - by ID or by code
    if (regionId) {
      where.regionId = regionId;
    } else if (regionCode) {
      const region = await this.prisma.region.findUnique({
        where: { code: regionCode },
      });
      if (region) {
        where.regionId = region.id;
      }
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
        region: true,
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
        region: true,
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
        region: true,
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

    // Slug rules:
    // - If dto.slug is provided, treat it as the explicit public URL slug.
    // - Otherwise, if name changes, regenerate slug automatically.
    let slug = business.slug;

    if (dto.slug && dto.slug !== business.slug) {
      const desired = this.normalizeSlug(dto.slug);
      if (!desired) {
        throw new BadRequestException('Invalid slug');
      }

      const existingBusiness = await this.prisma.business.findFirst({
        where: { slug: desired, id: { not: id } },
      });
      if (existingBusiness) {
        throw new BadRequestException('That URL is already taken');
      }

      slug = desired;
    } else if (dto.name && dto.name !== business.name) {
      slug = this.generateSlug(dto.name);

      const existingBusiness = await this.prisma.business.findFirst({
        where: { slug, id: { not: id } },
      });

      if (existingBusiness) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { categoryId, slug: _slug, ...businessData } = dto;
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

  private normalizeSlug(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
