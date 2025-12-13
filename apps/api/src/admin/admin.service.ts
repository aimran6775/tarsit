import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from '../chat/chat.gateway';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private chatGateway: ChatGateway,
  ) {}

  // ============================================================================
  // REAL-TIME MONITORING
  // ============================================================================

  async getRealTimeStats() {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalBusinesses,
      totalReviews,
      totalAppointments,
      activeUsers24h,
      newBusinesses24h,
      newUsers24h,
      activeChats,
      pendingVerifications,
      recentActivities,
      // Previous period counts for growth calculation
      users30DaysAgo,
      businesses30DaysAgo,
      reviews30DaysAgo,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.business.count(),
      this.prisma.review.count(),
      this.prisma.appointment.count(),
      this.prisma.user.count({
        where: { lastLoginAt: { gte: last24Hours } },
      }),
      this.prisma.business.count({
        where: { createdAt: { gte: last24Hours } },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: last24Hours } },
      }),
      this.prisma.chat.count({
        where: { updatedAt: { gte: last24Hours } },
      }),
      this.prisma.verificationRequest.count({
        where: { status: 'PENDING' },
      }),
      this.getRecentActivities(20),
      // Count users from 30 days ago (for growth calculation)
      this.prisma.user.count({
        where: { createdAt: { lt: last30Days } },
      }),
      this.prisma.business.count({
        where: { createdAt: { lt: last30Days } },
      }),
      this.prisma.review.count({
        where: { createdAt: { lt: last30Days } },
      }),
    ]);

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      overview: {
        totalUsers,
        totalBusinesses,
        totalReviews,
        totalAppointments,
      },
      growth: {
        userGrowth: calculateGrowth(totalUsers, users30DaysAgo),
        businessGrowth: calculateGrowth(totalBusinesses, businesses30DaysAgo),
        reviewGrowth: calculateGrowth(totalReviews, reviews30DaysAgo),
      },
      realTime: {
        activeUsers24h,
        newBusinesses24h,
        newUsers24h,
        activeChats,
        pendingVerifications,
        onlineUsers: this.chatGateway ? Array.from((this.chatGateway as any).onlineUsers?.keys() || []).length : 0,
      },
      recentActivities,
      timestamp: new Date().toISOString(),
    };
  }

  private async getRecentActivities(limit: number = 20) {
    const [users, businesses, reviews, appointments] = await Promise.all([
      this.prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
        },
      }),
      this.prisma.business.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          createdAt: true,
          owner: {
            select: { firstName: true, lastName: true },
          },
        },
      }),
      this.prisma.review.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          rating: true,
          createdAt: true,
          user: {
            select: { firstName: true, lastName: true },
          },
          business: {
            select: { name: true },
          },
        },
      }),
      this.prisma.appointment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          date: true,
          createdAt: true,
          business: {
            select: { name: true },
          },
        },
      }),
    ]);

    return {
      newUsers: users,
      newBusinesses: businesses,
      recentReviews: reviews,
      recentAppointments: appointments,
    };
  }

  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  async getAllUsers(query: { page?: number; limit?: number; role?: string; search?: string }) {
    const { page = 1, limit = 20, role, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(role && { role }),
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          verified: true,
          active: true,
          provider: true,
          lastLoginAt: true,
          createdAt: true,
          _count: {
            select: {
              businesses: true,
              reviews: true,
              appointments: true,
              favorites: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateUser(userId: string, data: {
    role?: string;
    verified?: boolean;
    active?: boolean;
  }) {
    const updateData: any = {
      ...(data.verified !== undefined && { verified: data.verified }),
      ...(data.active !== undefined && { active: data.active }),
    };
    
    // Cast role to UserRole enum if provided
    if (data.role) {
      updateData.role = data.role as any;
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        verified: true,
        active: true,
      },
    });
  }

  async deleteUser(userId: string) {
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { success: true, message: 'User deleted successfully' };
  }

  // ============================================================================
  // BUSINESS MANAGEMENT
  // ============================================================================

  async getAllBusinesses(query: {
    page?: number;
    limit?: number;
    verified?: boolean;
    active?: boolean;
    search?: string;
  }) {
    const { page = 1, limit = 20, verified, active, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(verified !== undefined && { verified }),
      ...(active !== undefined && { active }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [businesses, total] = await Promise.all([
      this.prisma.business.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              reviews: true,
              appointments: true,
              favorites: true,
              photos: true,
            },
          },
        },
      }),
      this.prisma.business.count({ where }),
    ]);

    return {
      businesses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateBusiness(businessId: string, data: {
    verified?: boolean;
    active?: boolean;
    featured?: boolean;
  }) {
    return this.prisma.business.update({
      where: { id: businessId },
      data,
    });
  }

  async deleteBusiness(businessId: string) {
    await this.prisma.business.delete({
      where: { id: businessId },
    });

    return { success: true, message: 'Business deleted successfully' };
  }

  // ============================================================================
  // CONTENT MODERATION
  // ============================================================================

  async getAllReviews(query: {
    page?: number;
    limit?: number;
    rating?: number;
    hasResponse?: boolean;
  }) {
    const { page = 1, limit = 20, rating, hasResponse } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(rating && { rating }),
      ...(hasResponse !== undefined && {
        response: hasResponse ? { not: null } : null,
      }),
    };

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          business: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async deleteReview(reviewId: string) {
    await this.prisma.review.delete({
      where: { id: reviewId },
    });

    return { success: true, message: 'Review deleted successfully' };
  }

  // ============================================================================
  // SYSTEM HEALTH
  // ============================================================================

  async getSystemHealth() {
    const startTime = Date.now();

    // Database health check
    let databaseStatus = 'healthy';
    let databaseLatency = 0;
    try {
      const dbStart = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      databaseLatency = Date.now() - dbStart;
    } catch (error) {
      databaseStatus = 'unhealthy';
    }

    // Get process metrics
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    return {
      status: databaseStatus === 'healthy' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
      database: {
        status: databaseStatus,
        latency: `${databaseLatency}ms`,
      },
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      },
      node: {
        version: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      environment: process.env.NODE_ENV || 'development',
    };
  }

  // ============================================================================
  // AI-POWERED INSIGHTS (Using OpenAI)
  // ============================================================================

  async generateAIInsights() {
    // Get recent data for analysis
    const [
      recentBusinesses,
      recentReviews,
      topCategories,
      userGrowth,
    ] = await Promise.all([
      this.prisma.business.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: { name: true, category: { select: { name: true } } },
      }),
      this.prisma.review.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        select: { rating: true, comment: true },
      }),
      this.prisma.business.groupBy({
        by: ['categoryId'],
        _count: true,
        orderBy: { _count: { categoryId: 'desc' } },
        take: 5,
      }),
      this.prisma.user.groupBy({
        by: ['createdAt'],
        _count: true,
        orderBy: { createdAt: 'desc' },
        take: 7,
      }),
    ]);

    const avgRating =
      recentReviews.reduce((sum, r) => sum + r.rating, 0) / recentReviews.length || 0;

    // Generate insights without AI for now (can add OpenAI later)
    const insights = {
      businessTrends: {
        totalRecent: recentBusinesses.length,
        topCategory: recentBusinesses[0]?.category?.name || 'N/A',
        insight: `Recently added businesses are primarily in the ${recentBusinesses[0]?.category?.name || 'various'} category.`,
      },
      customerSentiment: {
        averageRating: parseFloat(avgRating.toFixed(2)),
        totalReviews: recentReviews.length,
        sentiment:
          avgRating >= 4
            ? 'positive'
            : avgRating >= 3
            ? 'neutral'
            : 'negative',
        insight:
          avgRating >= 4
            ? 'Customer satisfaction is high. Keep up the great work!'
            : avgRating >= 3
            ? 'Customer satisfaction is moderate. Consider areas for improvement.'
            : 'Customer satisfaction needs attention. Review feedback and take action.',
      },
      growth: {
        trend: userGrowth.length > 0 ? 'growing' : 'stable',
        insight: `Platform has ${userGrowth[0]?._count || 0} new signups recently.`,
      },
      recommendations: [
        'Monitor pending verification requests',
        'Engage with businesses that have low ratings',
        'Promote top-performing categories',
        'Send re-engagement emails to inactive users',
      ],
    };

    return insights;
  }

  // ============================================================================
  // AUDIT LOGS
  // ============================================================================

  async getAuditLogs(query: { page?: number; limit?: number; action?: string }) {
    const { page = 1, limit = 50, action } = query;
    const skip = (page - 1) * limit;

    // TODO: Implement audit log table in Prisma schema
    // For now, return mock data structure
    return {
      logs: [],
      pagination: {
        total: 0,
        page,
        limit,
        totalPages: 0,
      },
      note: 'Audit logs feature coming soon. Add AuditLog model to Prisma schema.',
    };
  }

  // ============================================================================
  // REPORTS GENERATION
  // ============================================================================

  async generateReport(type: string, startDate?: Date, endDate?: Date) {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
    const end = endDate || new Date();

    switch (type) {
      case 'user-activity':
        return this.generateUserActivityReport(start, end);
      case 'business-performance':
        return this.generateBusinessPerformanceReport(start, end);
      case 'appointment-analytics':
        return this.generateAppointmentAnalyticsReport(start, end);
      case 'review-summary':
        return this.generateReviewSummaryReport(start, end);
      default:
        throw new Error(`Unknown report type: ${type}`);
    }
  }

  private async generateUserActivityReport(startDate: Date, endDate: Date) {
    const [newUsers, activeUsers, usersByRole] = await Promise.all([
      this.prisma.user.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      this.prisma.user.count({
        where: { lastLoginAt: { gte: startDate, lte: endDate } },
      }),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: true,
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
    ]);

    return {
      type: 'user-activity',
      period: { start: startDate, end: endDate },
      summary: {
        newUsers,
        activeUsers,
        usersByRole: usersByRole.map((u) => ({
          role: u.role,
          count: u._count,
        })),
      },
    };
  }

  private async generateBusinessPerformanceReport(startDate: Date, endDate: Date) {
    const [newBusinesses, verifiedBusinesses, businessesByCategory] = await Promise.all([
      this.prisma.business.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      this.prisma.business.count({
        where: {
          verified: true,
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.business.groupBy({
        by: ['categoryId'],
        _count: true,
        where: { createdAt: { gte: startDate, lte: endDate } },
        orderBy: { _count: { categoryId: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      type: 'business-performance',
      period: { start: startDate, end: endDate },
      summary: {
        newBusinesses,
        verifiedBusinesses,
        verificationRate: newBusinesses > 0 ? (verifiedBusinesses / newBusinesses) * 100 : 0,
        businessesByCategory,
      },
    };
  }

  private async generateAppointmentAnalyticsReport(startDate: Date, endDate: Date) {
    const [totalAppointments, appointmentsByStatus] = await Promise.all([
      this.prisma.appointment.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      this.prisma.appointment.groupBy({
        by: ['status'],
        _count: true,
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
    ]);

    return {
      type: 'appointment-analytics',
      period: { start: startDate, end: endDate },
      summary: {
        totalAppointments,
        appointmentsByStatus: appointmentsByStatus.map((a) => ({
          status: a.status,
          count: a._count,
        })),
      },
    };
  }

  private async generateReviewSummaryReport(startDate: Date, endDate: Date) {
    const [totalReviews, reviewsByRating, avgRating] = await Promise.all([
      this.prisma.review.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      this.prisma.review.groupBy({
        by: ['rating'],
        _count: true,
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      this.prisma.review.aggregate({
        where: { createdAt: { gte: startDate, lte: endDate } },
        _avg: { rating: true },
      }),
    ]);

    return {
      type: 'review-summary',
      period: { start: startDate, end: endDate },
      summary: {
        totalReviews,
        averageRating: avgRating._avg.rating || 0,
        reviewsByRating: reviewsByRating.map((r) => ({
          rating: r.rating,
          count: r._count,
        })),
      },
    };
  }

  // ============================================================================
  // BROADCAST MESSAGING
  // ============================================================================

  async broadcastMessage(message: {
    title: string;
    content: string;
    type: 'info' | 'warning' | 'alert';
    recipients: 'all' | 'businesses' | 'customers';
  }) {
    // Send to all online users via WebSocket
    if (this.chatGateway) {
      (this.chatGateway.server as any).emit('admin:broadcast', {
        title: message.title,
        content: message.content,
        type: message.type,
        timestamp: new Date().toISOString(),
      });
    }

    return {
      success: true,
      message: 'Broadcast sent successfully',
      timestamp: new Date().toISOString(),
    };
  }
}
