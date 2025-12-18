import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { SearchQueryDto } from './dto';

@Injectable()
export class SearchService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async search(query: SearchQueryDto) {
    const {
      q,
      categoryId,
      categorySlug,
      latitude,
      longitude,
      radius = 25,
      minRating,
      priceRange,
      verified,
      featured,
      openNow,
      city,
      state,
      sortBy = 'relevance',
      page = 1,
      limit = 20,
    } = query;

    const skip = (page - 1) * limit;

    // Resolve categorySlug to categoryId if provided
    let resolvedCategoryId = categoryId;
    if (!categoryId && categorySlug) {
      const category = await this.prisma.category.findUnique({
        where: { slug: categorySlug },
        select: { id: true },
      });
      if (category) {
        resolvedCategoryId = category.id;
      }
    }

    // Build where clause
    const where: Record<string, unknown> = {
      active: true,
      ...(resolvedCategoryId && { categoryId: resolvedCategoryId }),
      ...(minRating && { rating: { gte: minRating } }),
      ...(priceRange && { priceRange }),
      ...(verified !== undefined && { verified }),
      ...(featured !== undefined && { featured }),
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
      ...(state && { state: { contains: state, mode: 'insensitive' } }),
    };

    // Full-text search on name and description
    if (q && q.trim()) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Get businesses with all filters
    let businesses = await this.prisma.business.findMany({
      where,
      skip,
      take: limit,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        photos: {
          take: 1,
          where: { featured: true },
          select: {
            id: true,
            url: true,
            featured: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            services: true,
            favorites: true,
          },
        },
      },
    });

    // Calculate distance if coordinates provided
    if (latitude !== undefined && longitude !== undefined) {
      businesses = businesses
        .map((business) => {
          const distance = this.calculateDistance(
            latitude,
            longitude,
            business.latitude,
            business.longitude,
          );
          return { ...business, distance };
        })
        .filter((business) => business.distance <= radius);
    }

    // Filter by open now
    if (openNow && businesses.length > 0) {
      businesses = businesses.filter((business) => 
        this.isOpenNow(business.hours)
      );
    }

    // Sort results
    const sortedBusinesses: any[] = this.sortBusinesses(businesses, sortBy, q);

    // Get total count (for pagination)
    const total = await this.prisma.business.count({ where });

    // Calculate relevance scores if search query exists
    let finalBusinesses = sortedBusinesses;
    if (q && q.trim()) {
      finalBusinesses = sortedBusinesses.map((business) => ({
        ...business,
        relevanceScore: this.calculateRelevance(business, q),
      }));
    }

    return {
      businesses: finalBusinesses.map((business: any) => ({
        id: business.id,
        name: business.name,
        slug: business.slug,
        description: business.description,
        category: business.category,
        city: business.city,
        state: business.state,
        latitude: business.latitude,
        longitude: business.longitude,
        rating: business.rating,
        reviewCount: business.reviewCount,
        priceRange: business.priceRange,
        verified: business.verified,
        featured: business.featured,
        primaryPhoto: business.photos?.[0] || null,
        distance: business.distance || null,
        stats: {
          reviews: business._count?.reviews || 0,
          services: business._count?.services || 0,
          favorites: business._count?.favorites || 0,
        },
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        hasLocation: latitude !== undefined && longitude !== undefined,
        radius: latitude !== undefined && longitude !== undefined ? radius : null,
      },
    };
  }

  async getSuggestions(query: string) {
    if (!query || query.trim().length < 2) {
      return { suggestions: [] };
    }

    // Get business name suggestions
    const businessSuggestions = await this.prisma.business.findMany({
      where: {
        active: true,
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      take: 5,
      select: {
        name: true,
        slug: true,
      },
    });

    // Get category suggestions
    const categorySuggestions = await this.prisma.category.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 3,
      select: {
        name: true,
        slug: true,
      },
    });

    return {
      suggestions: [
        ...businessSuggestions.map((b) => ({
          type: 'business',
          text: b.name,
          slug: b.slug,
        })),
        ...categorySuggestions.map((c) => ({
          type: 'category',
          text: c.name,
          slug: c.slug,
        })),
      ],
    };
  }

  async getTrending() {
    // Get trending businesses (most viewed in last 7 days)
    const businesses = await this.prisma.business.findMany({
      where: {
        active: true,
      },
      orderBy: [
        { viewCount: 'desc' },
        { rating: 'desc' },
      ],
      take: 10,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        photos: {
          take: 1,
          where: { featured: true },
          select: {
            id: true,
            url: true,
          },
        },
      },
    });

    return {
      businesses: businesses.map((b: any) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        category: b.category,
        rating: b.rating,
        reviewCount: b.reviewCount,
        viewCount: b.viewCount,
        primaryPhoto: b.photos?.[0] || null,
      })),
    };
  }

  async getPopularNearby(latitude: number, longitude: number, radius: number = 10) {
    const businesses = await this.prisma.business.findMany({
      where: {
        active: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        photos: {
          take: 1,
          where: { featured: true },
          select: {
            id: true,
            url: true,
          },
        },
      },
    });

    // Calculate distances and filter
    const nearby = businesses
      .map((business) => {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          business.latitude,
          business.longitude,
        );
        return { ...business, distance };
      })
      .filter((business) => business.distance <= radius)
      .sort((a, b) => {
        // Sort by rating first, then distance
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        return a.distance - b.distance;
      })
      .slice(0, 10);

    return {
      businesses: nearby.map((b: any) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        category: b.category,
        rating: b.rating,
        reviewCount: b.reviewCount,
        distance: b.distance,
        primaryPhoto: b.photos?.[0] || null,
      })),
    };
  }

  // Helper: Calculate distance between two coordinates (Haversine formula)
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Helper: Check if business is open now
  private isOpenNow(hours: unknown): boolean {
    if (!hours || typeof hours !== 'object') return false;

    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight

    const todayHours = (hours as any)[dayOfWeek];
    if (!todayHours || !todayHours.open || !todayHours.close) return false;

    // Parse time strings like "09:00" to minutes
    const [openHour, openMin] = todayHours.open.split(':').map(Number);
    const [closeHour, closeMin] = todayHours.close.split(':').map(Number);
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;

    return currentTime >= openTime && currentTime <= closeTime;
  }

  // Helper: Sort businesses
  private sortBusinesses(businesses: Array<Record<string, any>>, sortBy: string, query?: string) {
    switch (sortBy) {
      case 'rating':
        return businesses.sort((a, b) => b.rating - a.rating);
      case 'distance':
        return businesses.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      case 'reviewCount':
        return businesses.sort((a, b) => b.reviewCount - a.reviewCount);
      case 'name':
        return businesses.sort((a, b) => a.name.localeCompare(b.name));
      case 'relevance':
      default:
        // If there's a query, sort by relevance
        if (query) {
          return businesses.sort((a, b) => {
            const scoreA = this.calculateRelevance(a, query);
            const scoreB = this.calculateRelevance(b, query);
            return scoreB - scoreA;
          });
        }
        // Default to rating if no query
        return businesses.sort((a, b) => b.rating - a.rating);
    }
  }

  // Helper: Calculate relevance score
  private calculateRelevance(business: Record<string, any>, query: string): number {
    const q = query.toLowerCase();
    const name = business.name.toLowerCase();
    const description = (business.description || '').toLowerCase();

    let score = 0;

    // Exact match in name gets highest score
    if (name === q) score += 100;
    // Name starts with query
    else if (name.startsWith(q)) score += 50;
    // Name contains query
    else if (name.includes(q)) score += 25;

    // Description contains query
    if (description.includes(q)) score += 10;

    // Boost score by rating
    score += business.rating * 5;

    // Boost score by review count
    score += Math.min(business.reviewCount, 20);

    // Boost verified businesses
    if (business.verified) score += 15;

    // Boost featured businesses
    if (business.featured) score += 10;

    return score;
  }
}
