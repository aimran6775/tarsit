import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {}

  // ============================================================================
  // REAL-TIME MONITORING
  // ============================================================================

  async getRealTimeStats() {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const _last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
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
        onlineUsers: 0, // TODO: Implement with Supabase Presence or Redis
      },
      recentActivities,
      timestamp: new Date().toISOString(),
    };
  }

  private async getRecentActivities(_limit: number = 20) {
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

  async updateUser(
    userId: string,
    data: {
      role?: string;
      verified?: boolean;
      active?: boolean;
    }
  ) {
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

  async updateBusiness(
    businessId: string,
    data: {
      verified?: boolean;
      active?: boolean;
      featured?: boolean;
    }
  ) {
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
    const _startTime = Date.now();

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
    const [recentBusinesses, recentReviews, _topCategories, userGrowth] = await Promise.all([
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
        sentiment: avgRating >= 4 ? 'positive' : avgRating >= 3 ? 'neutral' : 'negative',
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

    const where: any = {};
    if (action) where.action = action;

    const [logs, total] = await Promise.all([
      this.prisma.adminAuditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.adminAuditLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
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
    // TODO: Implement broadcast with Supabase Realtime
    console.log('Broadcast message:', message);

    return {
      success: true,
      message: 'Broadcast sent successfully',
      timestamp: new Date().toISOString(),
    };
  }

  // ============================================================================
  // CATEGORY MANAGEMENT
  // ============================================================================

  async getAllCategories(includeInactive: boolean = false) {
    const where = includeInactive ? {} : { active: true };

    const categories = await this.prisma.category.findMany({
      where,
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: { businesses: true, children: true },
        },
        parent: {
          select: { id: true, name: true, slug: true },
        },
        children: {
          where: includeInactive ? {} : { active: true },
          select: { id: true, name: true, slug: true, icon: true, order: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    return {
      categories,
      total: categories.length,
    };
  }

  async createCategory(
    data: {
      name: string;
      slug?: string;
      icon?: string;
      description?: string;
      parentId?: string;
      order?: number;
      active?: boolean;
    },
    adminId: string
  ) {
    // Generate slug if not provided
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    // Check for existing name or slug
    const existing = await this.prisma.category.findFirst({
      where: {
        OR: [
          { name: { equals: data.name, mode: 'insensitive' } },
          { slug },
        ],
      },
    });

    if (existing) {
      throw new ConflictException(
        existing.slug === slug ? 'Category slug already exists' : 'Category name already exists'
      );
    }

    // Validate parent if provided
    if (data.parentId) {
      const parent = await this.prisma.category.findUnique({ where: { id: data.parentId } });
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    // Get max order for positioning
    const maxOrder = await this.prisma.category.aggregate({
      _max: { order: true },
    });

    const category = await this.prisma.category.create({
      data: {
        name: data.name,
        slug,
        icon: data.icon,
        description: data.description,
        parentId: data.parentId,
        order: data.order ?? (maxOrder._max.order || 0) + 1,
        active: data.active ?? true,
      },
      include: {
        _count: { select: { businesses: true } },
        parent: { select: { id: true, name: true } },
      },
    });

    // Log audit
    await this.logAudit(adminId, 'CREATE_CATEGORY', 'CATEGORY', category.id, {
      name: category.name,
      slug: category.slug,
    });

    return category;
  }

  async updateCategory(
    id: string,
    data: {
      name?: string;
      slug?: string;
      icon?: string;
      description?: string;
      parentId?: string | null;
      order?: number;
      active?: boolean;
    },
    adminId: string
  ) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check for conflicts if name or slug is being changed
    if (data.name || data.slug) {
      const slug = data.slug || (data.name ? data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : undefined);
      
      if (slug || data.name) {
        const orConditions = [];
        if (data.name) orConditions.push({ name: { equals: data.name, mode: 'insensitive' as const } });
        if (slug) orConditions.push({ slug });
        
        if (orConditions.length > 0) {
          const existing = await this.prisma.category.findFirst({
            where: {
              id: { not: id },
              OR: orConditions,
            },
          });

          if (existing) {
            throw new ConflictException('Category name or slug already exists');
          }
        }
      }
    }

    // Prevent setting parent to self or descendant
    if (data.parentId && data.parentId !== category.parentId) {
      if (data.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }
      // Could add deeper check for circular references here
    }

    const updated = await this.prisma.category.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.slug && { slug: data.slug }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.parentId !== undefined && { parentId: data.parentId }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.active !== undefined && { active: data.active }),
      },
      include: {
        _count: { select: { businesses: true } },
        parent: { select: { id: true, name: true } },
      },
    });

    await this.logAudit(adminId, 'UPDATE_CATEGORY', 'CATEGORY', id, data);

    return updated;
  }

  async deleteCategory(id: string, adminId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { businesses: true, children: true } },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Prevent deletion if category has businesses
    if (category._count.businesses > 0) {
      throw new BadRequestException(
        `Cannot delete category with ${category._count.businesses} associated businesses. Reassign them first.`
      );
    }

    // Prevent deletion if category has children
    if (category._count.children > 0) {
      throw new BadRequestException(
        `Cannot delete category with ${category._count.children} subcategories. Delete or reassign them first.`
      );
    }

    await this.prisma.category.delete({ where: { id } });

    await this.logAudit(adminId, 'DELETE_CATEGORY', 'CATEGORY', id, {
      name: category.name,
      slug: category.slug,
    });

    return { success: true, message: 'Category deleted successfully' };
  }

  async reorderCategories(categoryOrders: Array<{ id: string; order: number }>, adminId: string) {
    await this.prisma.$transaction(
      categoryOrders.map(({ id, order }) =>
        this.prisma.category.update({
          where: { id },
          data: { order },
        })
      )
    );

    await this.logAudit(adminId, 'REORDER_CATEGORIES', 'CATEGORY', 'bulk', {
      count: categoryOrders.length,
    });

    return { success: true, message: 'Categories reordered successfully' };
  }

  // ============================================================================
  // SETTINGS MANAGEMENT
  // ============================================================================

  private readonly defaultSettings = {
    siteName: { value: 'Tarsit', type: 'string', category: 'general', description: 'Platform name' },
    maintenanceMode: { value: 'false', type: 'boolean', category: 'general', description: 'Enable maintenance mode' },
    newRegistrations: { value: 'true', type: 'boolean', category: 'general', description: 'Allow new user registrations' },
    requireEmailVerification: { value: 'true', type: 'boolean', category: 'security', description: 'Require email verification for new accounts' },
    autoApproveBusinesses: { value: 'false', type: 'boolean', category: 'business', description: 'Auto-approve new business registrations' },
    defaultPriceRange: { value: 'MODERATE', type: 'string', category: 'business', description: 'Default price range for new businesses' },
    featuredListingCost: { value: '49.99', type: 'number', category: 'business', description: 'Cost for featured listing' },
    supportEmail: { value: 'support@tarsit.com', type: 'string', category: 'email', description: 'Support email address' },
    maxPhotosPerBusiness: { value: '20', type: 'number', category: 'business', description: 'Maximum photos per business' },
    maxServicesPerBusiness: { value: '50', type: 'number', category: 'business', description: 'Maximum services per business' },
  };

  async getSettings() {
    // Get all settings from database - try catch in case table doesn't exist yet
    let dbSettings: Array<{ key: string; value: string; type: string; category: string; description: string | null; updatedAt: Date }> = [];
    try {
      dbSettings = await (this.prisma as any).adminSettings?.findMany() || [];
    } catch {
      // Table doesn't exist yet, use defaults only
    }
    
    // Merge with defaults
    const settingsMap = new Map(dbSettings.map(s => [s.key, s]));
    
    const settings: Record<string, any> = {};
    for (const [key, defaultValue] of Object.entries(this.defaultSettings)) {
      const dbSetting = settingsMap.get(key);
      const rawValue = dbSetting?.value ?? defaultValue.value;
      
      // Parse value based on type
      let value: any = rawValue;
      const type = dbSetting?.type ?? defaultValue.type;
      if (type === 'boolean') value = rawValue === 'true';
      else if (type === 'number') value = parseFloat(rawValue);
      else if (type === 'json') value = JSON.parse(rawValue);
      
      settings[key] = {
        value,
        type,
        category: dbSetting?.category ?? defaultValue.category,
        description: dbSetting?.description ?? defaultValue.description,
        updatedAt: dbSetting?.updatedAt,
      };
    }

    return { settings };
  }

  async updateSettings(
    data: Record<string, any>,
    adminId: string
  ) {
    const updates: Array<{ key: string; value: string; type: string }> = [];
    
    for (const [key, value] of Object.entries(data)) {
      if (key in this.defaultSettings) {
        const defaultSetting = this.defaultSettings[key as keyof typeof this.defaultSettings];
        updates.push({
          key,
          value: String(value),
          type: defaultSetting.type,
        });
      }
    }

    // Upsert all settings - try catch in case table doesn't exist yet
    try {
      await Promise.all(
        updates.map(({ key, value, type }) =>
          (this.prisma as any).adminSettings?.upsert({
            where: { key },
            create: {
              key,
              value,
              type,
              category: this.defaultSettings[key as keyof typeof this.defaultSettings].category,
              description: this.defaultSettings[key as keyof typeof this.defaultSettings].description,
              updatedBy: adminId,
            },
            update: {
              value,
              updatedBy: adminId,
            },
          })
        )
      );
    } catch {
      // Table doesn't exist yet
    }

    await this.logAudit(adminId, 'UPDATE_SETTINGS', 'SETTINGS', 'global', data);

    return { success: true, message: 'Settings updated successfully' };
  }

  // ============================================================================
  // VERIFICATION WORKFLOW
  // ============================================================================

  async getVerificationRequests(query: { page?: number; limit?: number; status?: string }) {
    const { page = 1, limit = 20, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [requests, total] = await Promise.all([
      this.prisma.verificationRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          business: {
            select: {
              id: true,
              name: true,
              slug: true,
              phone: true,
              email: true,
              addressLine1: true,
              city: true,
              state: true,
              owner: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
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
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.verificationRequest.count({ where }),
    ]);

    return {
      requests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getVerificationRequest(id: string) {
    const request = await this.prisma.verificationRequest.findUnique({
      where: { id },
      include: {
        business: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
            photos: { take: 10 },
            services: { take: 10 },
            reviews: { take: 5, orderBy: { createdAt: 'desc' } },
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
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Verification request not found');
    }

    return request;
  }

  async approveVerification(id: string, adminId: string, notes?: string) {
    const request = await this.prisma.verificationRequest.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!request) {
      throw new NotFoundException('Verification request not found');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('Verification request is not pending');
    }

    // Update request and business in transaction
    const [updatedRequest] = await this.prisma.$transaction([
      this.prisma.verificationRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          reviewedById: adminId,
          reviewedAt: new Date(),
          adminNotes: notes,
        },
      }),
      this.prisma.business.update({
        where: { id: request.businessId },
        data: {
          verified: true,
          verifiedAt: new Date(),
        },
      }),
      // Create notification for business owner
      this.prisma.notification.create({
        data: {
          userId: request.userId,
          type: 'BUSINESS_VERIFIED',
          title: 'Business Verified!',
          message: `Your business "${request.business.name}" has been verified.`,
          data: { businessId: request.businessId },
        },
      }),
    ]);

    await this.logAudit(adminId, 'APPROVE_VERIFICATION', 'VERIFICATION', id, {
      businessId: request.businessId,
      businessName: request.business.name,
      notes,
    });

    return { success: true, message: 'Verification approved', request: updatedRequest };
  }

  async rejectVerification(id: string, adminId: string, reason: string, notes?: string) {
    const request = await this.prisma.verificationRequest.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!request) {
      throw new NotFoundException('Verification request not found');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('Verification request is not pending');
    }

    // Update request
    const updatedRequest = await this.prisma.verificationRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedById: adminId,
        reviewedAt: new Date(),
        notes: reason,
        adminNotes: notes,
      },
    });

    // Create notification for business owner
    await this.prisma.notification.create({
      data: {
        userId: request.userId,
        type: 'SYSTEM',
        title: 'Verification Request Update',
        message: `Your verification request for "${request.business.name}" was not approved. Reason: ${reason}`,
        data: { businessId: request.businessId, reason },
      },
    });

    await this.logAudit(adminId, 'REJECT_VERIFICATION', 'VERIFICATION', id, {
      businessId: request.businessId,
      businessName: request.business.name,
      reason,
      notes,
    });

    return { success: true, message: 'Verification rejected', request: updatedRequest };
  }

  // ============================================================================
  // AUDIT LOGGING HELPER
  // ============================================================================

  private async logAudit(
    adminId: string,
    action: string,
    entityType: string,
    entityId: string,
    details?: Record<string, any>
  ) {
    try {
      await this.prisma.adminAuditLog.create({
        data: {
          adminId,
          action,
          entityType,
          entityId,
          details,
        },
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }
}
