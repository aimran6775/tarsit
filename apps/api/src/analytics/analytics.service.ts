import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnalyticsEventDto, AnalyticsQueryDto } from './dto';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async trackEvent(dto: CreateAnalyticsEventDto) {
    const { businessId, eventType } = dto;

    // Verify business exists
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Get today's date (without time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Map event type to analytics field
    const fieldToIncrement = this.getAnalyticsField(eventType);

    // Upsert analytics record for today
    return this.prisma.analytics.upsert({
      where: {
        businessId_date: {
          businessId,
          date: today,
        },
      },
      update: {
        [fieldToIncrement]: {
          increment: 1,
        },
      },
      create: {
        businessId,
        date: today,
        [fieldToIncrement]: 1,
      },
    });
  }

  private getAnalyticsField(eventType: string): string {
    switch (eventType) {
      case 'BUSINESS_VIEW':
        return 'views';
      case 'BUSINESS_SEARCH':
        return 'searches';
      case 'BUSINESS_CONTACT':
        return 'messages';
      case 'BUSINESS_DIRECTION':
      case 'BUSINESS_WEBSITE':
        return 'views'; // These also count as views
      default:
        return 'views';
    }
  }

  async getBusinessAnalytics(businessId: string, query: AnalyticsQueryDto) {
    const { startDate, endDate } = query;

    // Verify business exists
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      include: {
        _count: {
          select: {
            reviews: true,
            favorites: true,
            services: true,
            photos: true,
            appointments: true,
          },
        },
      },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const where = {
      businessId,
      ...(startDate || endDate
        ? {
            date: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          }
        : {}),
    };

    const [analyticsRecords, totalViews, totalSearches, totalMessages, totalBookings] = await Promise.all([
      this.prisma.analytics.findMany({
        where,
        orderBy: { date: 'desc' },
        take: 30, // Last 30 days
      }),
      this.prisma.analytics.aggregate({
        where,
        _sum: { views: true },
      }),
      this.prisma.analytics.aggregate({
        where,
        _sum: { searches: true },
      }),
      this.prisma.analytics.aggregate({
        where,
        _sum: { messages: true },
      }),
      this.prisma.analytics.aggregate({
        where,
        _sum: { bookings: true },
      }),
    ]);

    return {
      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
        rating: business.rating,
        reviewCount: business._count.reviews,
        favoriteCount: business._count.favorites,
        serviceCount: business._count.services,
        photoCount: business._count.photos,
        appointmentCount: business._count.appointments,
      },
      analytics: {
        totals: {
          views: totalViews._sum.views || 0,
          searches: totalSearches._sum.searches || 0,
          messages: totalMessages._sum.messages || 0,
          bookings: totalBookings._sum.bookings || 0,
        },
        daily: analyticsRecords,
      },
    };
  }

  async getPlatformDashboard() {
    const [
      totalBusinesses,
      totalUsers,
      totalReviews,
      totalAppointments,
      recentBusinesses,
      topBusinesses,
    ] = await Promise.all([
      this.prisma.business.count(),
      this.prisma.user.count(),
      this.prisma.review.count(),
      this.prisma.appointment.count(),
      this.prisma.business.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          owner: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.business.findMany({
        take: 10,
        orderBy: { rating: 'desc' },
        where: {
          rating: { not: null },
        },
        include: {
          category: true,
          _count: {
            select: {
              reviews: true,
              favorites: true,
            },
          },
        },
      }),
    ]);

    return {
      overview: {
        totalBusinesses,
        totalUsers,
        totalReviews,
        totalAppointments,
      },
      recentBusinesses,
      topBusinesses: topBusinesses.map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        rating: b.rating,
        reviewCount: b._count.reviews,
        favoriteCount: b._count.favorites,
        category: b.category.name,
      })),
    };
  }

  async getBusinessInsights(businessId: string, query: { startDate?: string; endDate?: string }) {
    const { startDate, endDate } = query;

    // Verify business exists
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const dateFilter = {
      ...(startDate && { gte: new Date(startDate) }),
      ...(endDate && { lte: new Date(endDate) }),
    };

    // Get appointment data for peak hours analysis
    const appointments = await this.prisma.appointment.findMany({
      where: {
        businessId,
        ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
      },
      select: {
        date: true,
        status: true,
      },
    });

    // Analyze peak hours
    const hourCounts: Record<number, number> = {};
    appointments.forEach((apt) => {
      const hour = new Date(apt.date).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const peakHours = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour, count]) => ({
        hour: parseInt(hour),
        appointments: count,
        timeRange: `${hour}:00 - ${parseInt(hour) + 1}:00`,
      }));

    // Get review insights
    const reviews = await this.prisma.review.findMany({
      where: {
        businessId,
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
      },
      select: {
        rating: true,
        createdAt: true,
      },
    });

    const ratingDistribution = {
      1: reviews.filter((r) => r.rating === 1).length,
      2: reviews.filter((r) => r.rating === 2).length,
      3: reviews.filter((r) => r.rating === 3).length,
      4: reviews.filter((r) => r.rating === 4).length,
      5: reviews.filter((r) => r.rating === 5).length,
    };

    // Get appointment status breakdown
    const appointmentStats = {
      total: appointments.length,
      confirmed: appointments.filter((a) => a.status === 'CONFIRMED').length,
      pending: appointments.filter((a) => a.status === 'PENDING').length,
      canceled: appointments.filter((a) => a.status === 'CANCELED').length,
      completed: appointments.filter((a) => a.status === 'COMPLETED').length,
      noShow: appointments.filter((a) => a.status === 'NO_SHOW').length,
    };

    // Calculate conversion rate (confirmed / total)
    const conversionRate =
      appointments.length > 0
        ? ((appointmentStats.confirmed + appointmentStats.completed) / appointments.length) * 100
        : 0;

    // Get favorite trend
    const favorites = await this.prisma.favorite.count({
      where: {
        businessId,
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
      },
    });

    return {
      businessId,
      period: {
        startDate: startDate || 'all-time',
        endDate: endDate || 'now',
      },
      peakHours,
      ratingDistribution,
      appointmentStats,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      favorites,
      avgRating:
        reviews.length > 0
          ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2))
          : 0,
    };
  }

  async getPlatformTrends(query: { startDate?: string; endDate?: string }) {
    const { startDate, endDate } = query;

    const dateFilter = {
      ...(startDate && { gte: new Date(startDate) }),
      ...(endDate && { lte: new Date(endDate) }),
    };

    // Get category popularity
    const categoryCounts = await this.prisma.business.groupBy({
      by: ['categoryId'],
      _count: true,
      orderBy: {
        _count: {
          categoryId: 'desc',
        },
      },
      take: 10,
    });

    const categoryDetails = await Promise.all(
      categoryCounts.map(async (cat) => {
        const category = await this.prisma.category.findUnique({
          where: { id: cat.categoryId },
          select: { name: true, slug: true },
        });
        return {
          ...category,
          businessCount: cat._count,
        };
      }),
    );

    // Get growth metrics
    const [newBusinesses, newUsers, newReviews] = await Promise.all([
      this.prisma.business.count({
        where: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {},
      }),
      this.prisma.user.count({
        where: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {},
      }),
      this.prisma.review.count({
        where: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {},
      }),
    ]);

    // Get most active users
    const topReviewers = await this.prisma.user.findMany({
      take: 10,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        _count: {
          select: {
            reviews: true,
            appointments: true,
            favorites: true,
          },
        },
      },
      orderBy: {
        reviews: {
          _count: 'desc',
        },
      },
    });

    return {
      period: {
        startDate: startDate || 'all-time',
        endDate: endDate || 'now',
      },
      growth: {
        newBusinesses,
        newUsers,
        newReviews,
      },
      topCategories: categoryDetails,
      topReviewers: topReviewers.map((user) => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        reviewCount: user._count.reviews,
        appointmentCount: user._count.appointments,
        favoriteCount: user._count.favorites,
      })),
    };
  }

  async generateReport(businessId: string, query: { startDate?: string; endDate?: string; format?: 'json' | 'csv' }) {
    const { startDate, endDate, format = 'json' } = query;

    // Get comprehensive business data
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      include: {
        category: true,
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const dateFilter = {
      ...(startDate && { gte: new Date(startDate) }),
      ...(endDate && { lte: new Date(endDate) }),
    };

    const [reviews, appointments, favorites, analytics] = await Promise.all([
      this.prisma.review.findMany({
        where: {
          businessId,
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.appointment.findMany({
        where: {
          businessId,
          ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
        },
      }),
      this.prisma.favorite.findMany({
        where: {
          businessId,
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        },
      }),
      this.prisma.analytics.findMany({
        where: {
          businessId,
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        },
      }),
    ]);

    const report = {
      metadata: {
        generatedAt: new Date().toISOString(),
        period: {
          startDate: startDate || 'all-time',
          endDate: endDate || 'now',
        },
      },
      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
        category: business.category.name,
        rating: business.rating,
        reviewCount: business.reviewCount,
        verified: business.verified,
        owner: `${business.owner.firstName} ${business.owner.lastName}`,
      },
      summary: {
        totalReviews: reviews.length,
        avgRating:
          reviews.length > 0
            ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2))
            : 0,
        totalAppointments: appointments.length,
        totalFavorites: favorites.length,
        totalAnalyticsEvents: analytics.length,
      },
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        user: `${r.user.firstName} ${r.user.lastName}`,
        createdAt: r.createdAt,
      })),
      appointments: appointments.map((a) => ({
        id: a.id,
        date: a.date,
        status: a.status,
        duration: a.duration,
      })),
    };

    if (format === 'csv') {
      // Convert to CSV format (simplified)
      const csvHeader = 'Type,Date,Value,Details\n';
      const csvRows = [
        ...reviews.map((r) => `Review,${r.createdAt.toISOString()},${r.rating},"${r.comment?.replace(/"/g, '""')}"`),
        ...appointments.map((a) => `Appointment,${a.date.toISOString()},${a.status},"${a.duration} minutes"`),
      ].join('\n');

      return {
        format: 'csv',
        data: csvHeader + csvRows,
      };
    }

    return {
      format: 'json',
      data: report,
    };
  }
}
