import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { LoggerService } from '../common/services/logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto, ReportReason, ReportTarget } from './dto/create-report.dto';
import { ReportPriority, ReportStatus, UpdateReportDto } from './dto/update-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {}

  async create(reporterId: string, dto: CreateReportDto, ipAddress?: string) {
    // Check for duplicate reports
    const existingReport = await this.prisma.report.findFirst({
      where: {
        reporterId,
        targetType: dto.targetType as any,
        targetId: dto.targetId,
        status: { in: ['PENDING', 'UNDER_REVIEW'] },
      },
    });

    if (existingReport) {
      throw new BadRequestException('You have already reported this item');
    }

    // Validate target exists
    await this.validateTarget(dto.targetType, dto.targetId);

    // Determine priority based on reason
    const priority = this.calculatePriority(dto.reason);

    const report = await this.prisma.report.create({
      data: {
        reporterId,
        reporterIp: ipAddress,
        targetType: dto.targetType as any,
        targetId: dto.targetId,
        reason: dto.reason as any,
        description: dto.description,
        priority: priority as any,
      },
    });

    this.logger.logSecurityEvent('report_created', {
      reportId: report.id,
      reporterId,
      targetType: dto.targetType,
      targetId: dto.targetId,
      reason: dto.reason,
    });

    return report;
  }

  async findAll(filters?: {
    status?: ReportStatus;
    targetType?: ReportTarget;
    priority?: ReportPriority;
    page?: number;
    limit?: number;
  }) {
    const { status, targetType, priority, page = 1, limit = 20 } = filters || {};

    const where: any = {};
    if (status) where.status = status;
    if (targetType) where.targetType = targetType;
    if (priority) where.priority = priority;

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Get target details
    const targetDetails = await this.getTargetDetails(
      report.targetType as ReportTarget,
      report.targetId,
    );

    return {
      ...report,
      targetDetails,
    };
  }

  async update(id: string, adminId: string, dto: UpdateReportDto) {
    const report = await this.prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    const updateData: any = {
      ...dto,
      reviewedById: adminId,
    };

    // Set resolvedAt if status is RESOLVED or DISMISSED
    if (dto.status === ReportStatus.RESOLVED || dto.status === ReportStatus.DISMISSED) {
      updateData.resolvedAt = new Date();
    }

    const updatedReport = await this.prisma.report.update({
      where: { id },
      data: updateData,
    });

    this.logger.logSecurityEvent('report_updated', {
      reportId: id,
      adminId,
      changes: dto,
      previousStatus: report.status,
      newStatus: dto.status,
    });

    return updatedReport;
  }

  async getStats() {
    const [
      pending,
      underReview,
      resolved,
      dismissed,
      byReason,
      byTarget,
      recentReports,
    ] = await Promise.all([
      this.prisma.report.count({ where: { status: 'PENDING' } }),
      this.prisma.report.count({ where: { status: 'UNDER_REVIEW' } }),
      this.prisma.report.count({ where: { status: 'RESOLVED' } }),
      this.prisma.report.count({ where: { status: 'DISMISSED' } }),
      this.prisma.report.groupBy({
        by: ['reason'],
        _count: { reason: true },
      }),
      this.prisma.report.groupBy({
        by: ['targetType'],
        _count: { targetType: true },
      }),
      this.prisma.report.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    return {
      byStatus: { pending, underReview, resolved, dismissed },
      byReason: byReason.map(r => ({ reason: r.reason, count: r._count.reason })),
      byTarget: byTarget.map(t => ({ target: t.targetType, count: t._count.targetType })),
      recentReports,
    };
  }

  private async validateTarget(targetType: ReportTarget, targetId: string) {
    let exists = false;

    switch (targetType) {
      case ReportTarget.BUSINESS:
        const business = await this.prisma.business.findUnique({
          where: { id: targetId },
        });
        exists = !!business;
        break;

      case ReportTarget.REVIEW:
        const review = await this.prisma.review.findUnique({
          where: { id: targetId },
        });
        exists = !!review;
        break;

      case ReportTarget.USER:
        const user = await this.prisma.user.findUnique({
          where: { id: targetId },
        });
        exists = !!user;
        break;

      case ReportTarget.MESSAGE:
        const message = await this.prisma.message.findUnique({
          where: { id: targetId },
        });
        exists = !!message;
        break;
    }

    if (!exists) {
      throw new BadRequestException(`${targetType} not found`);
    }
  }

  private async getTargetDetails(targetType: ReportTarget, targetId: string) {
    switch (targetType) {
      case ReportTarget.BUSINESS:
        return this.prisma.business.findUnique({
          where: { id: targetId },
          select: { id: true, name: true, slug: true },
        });

      case ReportTarget.REVIEW:
        return this.prisma.review.findUnique({
          where: { id: targetId },
          select: { id: true, rating: true, comment: true, businessId: true },
        });

      case ReportTarget.USER:
        return this.prisma.user.findUnique({
          where: { id: targetId },
          select: { id: true, firstName: true, lastName: true, email: true },
        });

      case ReportTarget.MESSAGE:
        return this.prisma.message.findUnique({
          where: { id: targetId },
          select: { id: true, content: true, createdAt: true },
        });

      default:
        return null;
    }
  }

  private calculatePriority(reason: ReportReason): ReportPriority {
    switch (reason) {
      case ReportReason.SCAM:
      case ReportReason.HARASSMENT:
        return ReportPriority.URGENT;

      case ReportReason.INAPPROPRIATE:
      case ReportReason.COPYRIGHT:
        return ReportPriority.HIGH;

      case ReportReason.FAKE:
      case ReportReason.MISLEADING:
        return ReportPriority.NORMAL;

      case ReportReason.SPAM:
      case ReportReason.OTHER:
      default:
        return ReportPriority.LOW;
    }
  }
}
