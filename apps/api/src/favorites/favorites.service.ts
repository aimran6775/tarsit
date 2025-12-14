import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFavoriteDto, FavoriteQueryDto } from './dto';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateFavoriteDto) {
    // Check if business exists
    const business = await this.prisma.business.findUnique({
      where: { id: dto.businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Check if already favorited
    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_businessId: {
          userId,
          businessId: dto.businessId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Business already in favorites');
    }

    return this.prisma.favorite.create({
      data: {
        user: {
          connect: { id: userId },
        },
        business: {
          connect: { id: dto.businessId },
        },
      },
      include: {
        business: {
          include: {
            category: true,
            _count: {
              select: {
                reviews: true,
                photos: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(userId: string, query: FavoriteQueryDto) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [favorites, total] = await Promise.all([
      this.prisma.favorite.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          business: {
            include: {
              category: true,
              _count: {
                select: {
                  reviews: true,
                  photos: true,
                  services: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.favorite.count({ where: { userId } }),
    ]);

    return {
      favorites,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async remove(userId: string, id: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: { id },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    if (favorite.userId !== userId) {
      throw new ForbiddenException('You can only remove your own favorites');
    }

    await this.prisma.favorite.delete({ where: { id } });

    return { message: 'Favorite removed successfully' };
  }

  async removeByBusinessId(userId: string, businessId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_businessId: {
          userId,
          businessId,
        },
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.prisma.favorite.delete({
      where: {
        userId_businessId: {
          userId,
          businessId,
        },
      },
    });

    return { message: 'Favorite removed successfully' };
  }
}
