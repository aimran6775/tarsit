import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface PublicStats {
  totalBusinesses: number;
  totalReviews: number;
  totalBookings: number;
  totalUsers: number;
}

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getPublicStats(): Promise<PublicStats> {
    const [totalBusinesses, totalReviews, totalBookings, totalUsers] = await Promise.all([
      this.prisma.business.count({
        where: { status: 'ACTIVE' },
      }),
      this.prisma.review.count(),
      this.prisma.appointment.count(),
      this.prisma.user.count(),
    ]);

    return {
      totalBusinesses,
      totalReviews,
      totalBookings,
      totalUsers,
    };
  }
}
