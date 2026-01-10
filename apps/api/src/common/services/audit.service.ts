import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggerService } from './logger.service';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  VERIFICATION = 'VERIFICATION',
  SUSPENSION = 'SUSPENSION',
  REPORT = 'REPORT',
  REVIEW = 'REVIEW',
}

export interface AuditLogData {
  userId?: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  metadata?: {
    ip?: string;
    userAgent?: string;
    reason?: string;
    [key: string]: any;
  };
}

@Injectable()
export class AuditService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {}

  async log(data: AuditLogData): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action as any,
          entityType: data.entityType,
          entityId: data.entityId,
          oldValue: data.oldValue || undefined,
          newValue: data.newValue || undefined,
          metadata: data.metadata || undefined,
        },
      });

      // Also log to Winston for immediate visibility
      this.logger.log(
        `Audit: ${data.action} on ${data.entityType}:${data.entityId}`,
        'AuditService',
      );
    } catch (error) {
      // Don't fail the main operation if audit logging fails
      this.logger.error('Failed to create audit log', String(error), 'AuditService');
    }
  }

  // Convenience methods for common operations
  async logCreate(
    userId: string,
    entityType: string,
    entityId: string,
    newValue: any,
    metadata?: AuditLogData['metadata'],
  ) {
    return this.log({
      userId,
      action: AuditAction.CREATE,
      entityType,
      entityId,
      newValue,
      metadata,
    });
  }

  async logUpdate(
    userId: string,
    entityType: string,
    entityId: string,
    oldValue: any,
    newValue: any,
    metadata?: AuditLogData['metadata'],
  ) {
    return this.log({
      userId,
      action: AuditAction.UPDATE,
      entityType,
      entityId,
      oldValue,
      newValue,
      metadata,
    });
  }

  async logDelete(
    userId: string,
    entityType: string,
    entityId: string,
    oldValue: any,
    metadata?: AuditLogData['metadata'],
  ) {
    return this.log({
      userId,
      action: AuditAction.DELETE,
      entityType,
      entityId,
      oldValue,
      metadata,
    });
  }

  async logLogin(
    userId: string,
    metadata?: AuditLogData['metadata'],
  ) {
    return this.log({
      userId,
      action: AuditAction.LOGIN,
      entityType: 'user',
      entityId: userId,
      metadata,
    });
  }

  async logLogout(
    userId: string,
    metadata?: AuditLogData['metadata'],
  ) {
    return this.log({
      userId,
      action: AuditAction.LOGOUT,
      entityType: 'user',
      entityId: userId,
      metadata,
    });
  }

  async logPasswordChange(
    userId: string,
    metadata?: AuditLogData['metadata'],
  ) {
    return this.log({
      userId,
      action: AuditAction.PASSWORD_CHANGE,
      entityType: 'user',
      entityId: userId,
      metadata,
    });
  }

  async logSuspension(
    adminId: string,
    targetUserId: string,
    reason: string,
    metadata?: AuditLogData['metadata'],
  ) {
    return this.log({
      userId: adminId,
      action: AuditAction.SUSPENSION,
      entityType: 'user',
      entityId: targetUserId,
      metadata: { ...metadata, reason },
    });
  }

  // Query audit logs
  async findByEntity(entityType: string, entityId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findByUser(userId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findByAction(action: AuditAction, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { action: action as any },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findRecent(limit = 100) {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getStats(days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [total, byAction, byEntityType] = await Promise.all([
      this.prisma.auditLog.count({
        where: { createdAt: { gte: since } },
      }),
      this.prisma.auditLog.groupBy({
        by: ['action'],
        where: { createdAt: { gte: since } },
        _count: { action: true },
      }),
      this.prisma.auditLog.groupBy({
        by: ['entityType'],
        where: { createdAt: { gte: since } },
        _count: { entityType: true },
      }),
    ]);

    return {
      total,
      byAction: byAction.map(a => ({ action: a.action, count: a._count.action })),
      byEntityType: byEntityType.map(e => ({ entityType: e.entityType, count: e._count.entityType })),
      period: `${days} days`,
    };
  }
}
