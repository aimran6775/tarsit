import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async getDetailedHealth() {
    const checks = {
      database: await this.checkDatabase(),
      memory: this.checkMemory(),
      disk: this.checkDisk(),
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
    };

    const allHealthy = Object.values(checks).every(
      (check) =>
        typeof check === 'string' ||
        typeof check === 'number' ||
        check.status === 'healthy',
    );

    return {
      status: allHealthy ? 'healthy' : 'degraded',
      checks,
    };
  }

  async checkReadiness() {
    const checks = {
      database: await this.checkDatabase(),
    };

    const isReady = checks.database.status === 'healthy';

    if (!isReady) {
      return {
        status: 'not ready',
        checks,
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      };
    }

    return {
      status: 'ready',
      checks,
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabase() {
    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const duration = Date.now() - start;

      return {
        status: 'healthy',
        responseTime: `${duration}ms`,
        connected: true,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        connected: false,
      };
    }
  }

  private checkMemory() {
    const used = process.memoryUsage();
    return {
      status: 'healthy',
      rss: `${Math.round(used.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(used.external / 1024 / 1024)}MB`,
    };
  }

  private checkDisk() {
    // Simple disk check - in production you'd want more sophisticated monitoring
    return {
      status: 'healthy',
      note: 'Disk monitoring requires additional setup in production',
    };
  }
}
