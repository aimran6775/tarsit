import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromotionDto, DiscountType, UpdatePromotionDto, UsePromotionDto, ValidatePromoCodeDto } from './dto';

@Injectable()
export class PromotionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(businessId: string, dto: CreatePromotionDto) {
    // Normalize code to uppercase
    const normalizedCode = dto.code.toUpperCase().trim();

    // Check if code already exists for this business
    const existing = await this.prisma.promotion.findUnique({
      where: { businessId_code: { businessId, code: normalizedCode } },
    });

    if (existing) {
      throw new BadRequestException('Promo code already exists for this business');
    }

    return this.prisma.promotion.create({
      data: {
        businessId,
        code: normalizedCode,
        name: dto.name,
        description: dto.description,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        minOrderValue: dto.minOrderValue,
        maxDiscount: dto.maxDiscount,
        usageLimit: dto.usageLimit,
        perUserLimit: dto.perUserLimit ?? 1,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : new Date(),
        validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
        serviceIds: dto.serviceIds ?? [],
      },
    });
  }

  async findAllByBusiness(businessId: string) {
    return this.prisma.promotion.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { usages: true },
        },
      },
    });
  }

  async findOne(id: string, businessId?: string) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
      include: {
        business: { select: { id: true, name: true } },
        usages: {
          take: 10,
          orderBy: { usedAt: 'desc' },
        },
        _count: {
          select: { usages: true },
        },
      },
    });

    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    if (businessId && promotion.businessId !== businessId) {
      throw new ForbiddenException('You do not have access to this promotion');
    }

    return promotion;
  }

  async update(id: string, businessId: string, dto: UpdatePromotionDto) {
    const promotion = await this.prisma.promotion.findUnique({ where: { id } });

    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    if (promotion.businessId !== businessId) {
      throw new ForbiddenException('You do not have access to this promotion');
    }

    return this.prisma.promotion.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        minOrderValue: dto.minOrderValue,
        maxDiscount: dto.maxDiscount,
        usageLimit: dto.usageLimit,
        perUserLimit: dto.perUserLimit,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
        serviceIds: dto.serviceIds,
        active: dto.active,
      },
    });
  }

  async delete(id: string, businessId: string) {
    const promotion = await this.prisma.promotion.findUnique({ where: { id } });

    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    if (promotion.businessId !== businessId) {
      throw new ForbiddenException('You do not have access to this promotion');
    }

    await this.prisma.promotion.delete({ where: { id } });
    return { message: 'Promotion deleted successfully' };
  }

  async validateCode(businessId: string, dto: ValidatePromoCodeDto, userId?: string) {
    const normalizedCode = dto.code.toUpperCase().trim();
    const now = new Date();

    const promotion = await this.prisma.promotion.findUnique({
      where: { businessId_code: { businessId, code: normalizedCode } },
    });

    if (!promotion) {
      return { valid: false, error: 'Invalid promo code' };
    }

    if (!promotion.active) {
      return { valid: false, error: 'This promo code is no longer active' };
    }

    if (promotion.validFrom > now) {
      return { valid: false, error: 'This promo code is not yet valid' };
    }

    if (promotion.validUntil && promotion.validUntil < now) {
      return { valid: false, error: 'This promo code has expired' };
    }

    if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
      return { valid: false, error: 'This promo code has reached its usage limit' };
    }

    // Check per-user limit if user is logged in
    if (userId && promotion.perUserLimit) {
      const userUsageCount = await this.prisma.promotionUsage.count({
        where: { promotionId: promotion.id, userId },
      });
      if (userUsageCount >= promotion.perUserLimit) {
        return { valid: false, error: 'You have already used this promo code' };
      }
    }

    // Check service restriction
    if (dto.serviceId && promotion.serviceIds.length > 0) {
      if (!promotion.serviceIds.includes(dto.serviceId)) {
        return { valid: false, error: 'This promo code does not apply to this service' };
      }
    }

    // Check minimum order value
    if (promotion.minOrderValue && dto.orderTotal && dto.orderTotal < promotion.minOrderValue) {
      return {
        valid: false,
        error: `Minimum order value of $${promotion.minOrderValue.toFixed(2)} required`,
      };
    }

    // Calculate discount
    let discount = 0;
    if (dto.orderTotal) {
      if (promotion.discountType === DiscountType.PERCENTAGE) {
        discount = (dto.orderTotal * promotion.discountValue) / 100;
        if (promotion.maxDiscount) {
          discount = Math.min(discount, promotion.maxDiscount);
        }
      } else {
        discount = promotion.discountValue;
      }
    }

    return {
      valid: true,
      promotion: {
        id: promotion.id,
        name: promotion.name,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        maxDiscount: promotion.maxDiscount,
      },
      calculatedDiscount: discount,
    };
  }

  async usePromotion(businessId: string, dto: UsePromotionDto, userId?: string) {
    const normalizedCode = dto.code.toUpperCase().trim();

    // First validate
    const validation = await this.validateCode(businessId, { code: normalizedCode }, userId);
    if (!validation.valid) {
      throw new BadRequestException(validation.error);
    }

    const promotion = await this.prisma.promotion.findUnique({
      where: { businessId_code: { businessId, code: normalizedCode } },
    });

    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    // Create usage record and increment count in a transaction
    return this.prisma.$transaction(async (tx) => {
      await tx.promotionUsage.create({
        data: {
          promotionId: promotion.id,
          userId,
          appointmentId: dto.appointmentId,
          discountAmount: dto.discountAmount,
        },
      });

      return tx.promotion.update({
        where: { id: promotion.id },
        data: { usageCount: { increment: 1 } },
      });
    });
  }

  async getStats(businessId: string) {
    const [totalPromotions, activePromotions, totalUsages, recentUsages] = await Promise.all([
      this.prisma.promotion.count({ where: { businessId } }),
      this.prisma.promotion.count({
        where: {
          businessId,
          active: true,
          OR: [{ validUntil: null }, { validUntil: { gt: new Date() } }],
        },
      }),
      this.prisma.promotionUsage.count({
        where: { promotion: { businessId } },
      }),
      this.prisma.promotionUsage.findMany({
        where: { promotion: { businessId } },
        take: 5,
        orderBy: { usedAt: 'desc' },
        include: {
          promotion: { select: { code: true, name: true } },
        },
      }),
    ]);

    return {
      totalPromotions,
      activePromotions,
      totalUsages,
      recentUsages,
    };
  }
}
