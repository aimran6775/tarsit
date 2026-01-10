import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto, UpdateReviewDto, ReviewQueryDto } from './dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto) {
    // Check if business exists
    const business = await this.prisma.business.findUnique({
      where: { id: dto.businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Check if user already reviewed this business
    const existingReview = await this.prisma.review.findFirst({
      where: {
        businessId: dto.businessId,
        userId,
      },
    });

    if (existingReview) {
      throw new ConflictException('You have already reviewed this business');
    }

    // Create review
    const review = await this.prisma.review.create({
      data: {
        ...dto,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
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
    });

    // Update business rating and review count
    await this.updateBusinessRating(dto.businessId);

    return review;
  }

  async findAll(query: ReviewQueryDto) {
    const { businessId, userId, minRating, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (businessId) {
      where.businessId = businessId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (minRating) {
      where.rating = { gte: minRating };
    }

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
              firstName: true,
              lastName: true,
              avatar: true,
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
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
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
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async update(id: string, userId: string, userRole: string, dto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Check ownership
    if (review.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only update your own reviews');
    }

    const updatedReview = await this.prisma.review.update({
      where: { id },
      data: dto,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
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
    });

    // If rating changed, update business rating
    if (dto.rating && dto.rating !== review.rating) {
      await this.updateBusinessRating(review.businessId);
    }

    return updatedReview;
  }

  async remove(id: string, userId: string, userRole: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Check ownership or admin
    if (review.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.prisma.review.delete({
      where: { id },
    });

    // Update business rating and review count
    await this.updateBusinessRating(review.businessId);
  }

  /**
   * Business owner responds to a review
   */
  async respond(id: string, userId: string, userRole: string, responseText: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            ownerId: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Check if user is the business owner or admin
    if (review.business.ownerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only the business owner can respond to reviews');
    }

    // Update the review with the response
    const updatedReview = await this.prisma.review.update({
      where: { id },
      data: {
        response: responseText,
        respondedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
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
    });

    return updatedReview;
  }

  /**
   * Delete a business owner's response to a review
   */
  async deleteResponse(id: string, userId: string, userRole: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        business: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Check if user is the business owner or admin
    if (review.business.ownerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only the business owner can delete responses');
    }

    const updatedReview = await this.prisma.review.update({
      where: { id },
      data: {
        response: null,
        respondedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
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
    });

    return updatedReview;
  }

  private async updateBusinessRating(businessId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { businessId },
      select: { rating: true },
    });

    const reviewCount = reviews.length;
    const averageRating =
      reviewCount > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        : 0;

    await this.prisma.business.update({
      where: { id: businessId },
      data: {
        rating: averageRating,
        reviewCount,
      },
    });
  }
}
