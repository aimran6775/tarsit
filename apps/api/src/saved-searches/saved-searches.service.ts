import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSavedSearchDto, UpdateSavedSearchDto } from './dto';

@Injectable()
export class SavedSearchesService {
  private readonly MAX_SAVED_SEARCHES = 20;

  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateSavedSearchDto) {
    // Check limit
    const count = await this.prisma.savedSearch.count({ where: { userId } });
    if (count >= this.MAX_SAVED_SEARCHES) {
      throw new BadRequestException(
        `You can only save up to ${this.MAX_SAVED_SEARCHES} searches`,
      );
    }

    return this.prisma.savedSearch.create({
      data: {
        userId,
        name: dto.name,
        query: dto.query,
        category: dto.category,
        location: dto.location,
        latitude: dto.latitude,
        longitude: dto.longitude,
        radius: dto.radius,
        filters: dto.filters,
        notifyNew: dto.notifyNew || false,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.savedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(userId: string, id: string) {
    const search = await this.prisma.savedSearch.findFirst({
      where: { id, userId },
    });

    if (!search) {
      throw new NotFoundException('Saved search not found');
    }

    return search;
  }

  async update(userId: string, id: string, dto: UpdateSavedSearchDto) {
    // Verify ownership
    await this.findById(userId, id);

    return this.prisma.savedSearch.update({
      where: { id },
      data: dto,
    });
  }

  async delete(userId: string, id: string) {
    // Verify ownership
    await this.findById(userId, id);

    await this.prisma.savedSearch.delete({
      where: { id },
    });
  }

  async executeSearch(userId: string, id: string) {
    const search = await this.findById(userId, id);

    // Build search query
    const where: any = {
      active: true,
    };

    if (search.category) {
      where.category = { slug: search.category };
    }

    if (search.query) {
      where.OR = [
        { name: { contains: search.query, mode: 'insensitive' } },
        { description: { contains: search.query, mode: 'insensitive' } },
      ];
    }

    if (search.location) {
      where.OR = [
        ...(where.OR || []),
        { city: { contains: search.location, mode: 'insensitive' } },
        { state: { contains: search.location, mode: 'insensitive' } },
        { address: { contains: search.location, mode: 'insensitive' } },
      ];
    }

    // Apply additional filters from JSON
    const filters = search.filters as Record<string, any> | null;
    if (filters) {
      if (filters.minRating) {
        where.rating = { gte: filters.minRating };
      }
      if (filters.verified) {
        where.verified = true;
      }
    }

    const businesses = await this.prisma.business.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        city: true,
        state: true,
        rating: true,
        reviewCount: true,
        coverImage: true,
        verified: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      take: 50,
      orderBy: { rating: 'desc' },
    });

    // Update the search's updatedAt to track usage
    await this.prisma.savedSearch.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return {
      search,
      results: businesses,
      count: businesses.length,
    };
  }

  // For notification system - get all searches with notifications enabled
  async getSearchesForNotification() {
    return this.prisma.savedSearch.findMany({
      where: { notifyNew: true },
    });
  }
}
