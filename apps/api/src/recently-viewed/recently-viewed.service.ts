import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecentlyViewedService {
  private readonly MAX_RECENT_ITEMS = 20;

  constructor(private prisma: PrismaService) {}

  async recordView(userId: string, businessId: string): Promise<void> {
    // Upsert to update viewedAt if already exists
    await this.prisma.recentlyViewed.upsert({
      where: {
        userId_businessId: {
          userId,
          businessId,
        },
      },
      update: {
        viewedAt: new Date(),
      },
      create: {
        userId,
        businessId,
      },
    });

    // Clean up old entries (keep only MAX_RECENT_ITEMS)
    await this.cleanupOldEntries(userId);
  }

  async getRecentlyViewed(userId: string, limit = 10) {
    const recentlyViewed = await this.prisma.recentlyViewed.findMany({
      where: { userId },
      orderBy: { viewedAt: 'desc' },
      take: limit,
    });

    // Get business details
    const businessIds = recentlyViewed.map((rv) => rv.businessId);
    const businesses = await this.prisma.business.findMany({
      where: {
        id: { in: businessIds },
        active: true,
      },
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
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Map businesses back to recently viewed order
    const businessMap = new Map(businesses.map((b) => [b.id, b]));
    return recentlyViewed
      .map((rv) => ({
        viewedAt: rv.viewedAt,
        business: businessMap.get(rv.businessId),
      }))
      .filter((item) => item.business);
  }

  async clearHistory(userId: string): Promise<void> {
    await this.prisma.recentlyViewed.deleteMany({
      where: { userId },
    });
  }

  async removeItem(userId: string, businessId: string): Promise<void> {
    await this.prisma.recentlyViewed.delete({
      where: {
        userId_businessId: {
          userId,
          businessId,
        },
      },
    });
  }

  private async cleanupOldEntries(userId: string): Promise<void> {
    const count = await this.prisma.recentlyViewed.count({
      where: { userId },
    });

    if (count > this.MAX_RECENT_ITEMS) {
      // Get IDs of entries to delete
      const toDelete = await this.prisma.recentlyViewed.findMany({
        where: { userId },
        orderBy: { viewedAt: 'desc' },
        skip: this.MAX_RECENT_ITEMS,
        select: { id: true },
      });

      await this.prisma.recentlyViewed.deleteMany({
        where: {
          id: { in: toDelete.map((d) => d.id) },
        },
      });
    }
  }
}
