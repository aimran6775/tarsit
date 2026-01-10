import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll() {
    // Try to get from cache first
    const cacheKey = 'categories:all';
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }
    const categories = await this.prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            description: true,
          },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            businesses: true,
          },
        },
      },
    });

    // Store in cache for 10 minutes
    await this.cacheManager.set(cacheKey, categories, 600000);

    return categories;
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            description: true,
          },
          orderBy: { order: 'asc' },
        },
        businesses: {
          take: 10,
          orderBy: { rating: 'desc' },
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            state: true,
            rating: true,
            reviewCount: true,
            priceRange: true,
            verified: true,
          },
        },
        _count: {
          select: {
            businesses: true,
          },
        },
      },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            description: true,
          },
          orderBy: { order: 'asc' },
        },
        businesses: {
          take: 10,
          orderBy: { rating: 'desc' },
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            state: true,
            rating: true,
            reviewCount: true,
            priceRange: true,
            verified: true,
          },
        },
        _count: {
          select: {
            businesses: true,
          },
        },
      },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  }
}
