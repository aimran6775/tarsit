import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto, ServiceQueryDto, UpdateServiceDto } from './dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateServiceDto) {
    // Verify business exists and user is the owner
    const business = await this.prisma.business.findUnique({
      where: { id: dto.businessId },
      include: {
        region: {
          include: {
            currency: true,
          },
        },
      },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (business.ownerId !== userId) {
      throw new ForbiddenException('You can only add services to your own business');
    }

    const { businessId, ...serviceData } = dto;
    
    // Auto-assign currency from business region if not provided
    const currencyCode = dto.currencyCode || business.region?.currency?.code || 'USD';

    return this.prisma.service.create({
      data: {
        ...serviceData,
        currencyCode,
        business: {
          connect: { id: businessId },
        },
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  async findAll(query: ServiceQueryDto) {
    const { businessId, search, minPrice, maxPrice, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (businessId) {
      where.businessId = businessId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    const [services, total] = await Promise.all([
      this.prisma.service.findMany({
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
              city: true,
              state: true,
            },
          },
        },
      }),
      this.prisma.service.count({ where }),
    ]);

    return {
      services,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            state: true,
            phone: true,
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  async update(userId: string, id: string, dto: UpdateServiceDto) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (service.business.ownerId !== userId) {
      throw new ForbiddenException('You can only update your own services');
    }

    return this.prisma.service.update({
      where: { id },
      data: dto,
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  async remove(userId: string, id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (service.business.ownerId !== userId) {
      throw new ForbiddenException('You can only delete your own services');
    }

    await this.prisma.service.delete({ where: { id } });

    return { message: 'Service deleted successfully' };
  }

  /**
   * Get services for a business with prices converted to the target currency
   */
  async findByBusinessWithConversion(businessId: string, targetCurrencyCode?: string) {
    const services = await this.prisma.service.findMany({
      where: { businessId, active: true },
      orderBy: { order: 'asc' },
    });

    if (!targetCurrencyCode) {
      return services;
    }

    // Get all unique currency codes from services
    const currencyCodes = [...new Set(services.map(s => s.currencyCode || 'USD'))];
    currencyCodes.push(targetCurrencyCode);

    // Fetch all needed currencies
    const currencies = await this.prisma.currency.findMany({
      where: { code: { in: currencyCodes } },
    });

    const currencyMap = new Map(currencies.map(c => [c.code, c]));
    const targetCurrency = currencyMap.get(targetCurrencyCode);

    if (!targetCurrency) {
      return services;
    }

    // Convert prices
    return services.map(service => {
      const fromCurrency = currencyMap.get(service.currencyCode || 'USD');
      
      if (!service.price || !fromCurrency) {
        return {
          ...service,
          convertedPrice: null,
          targetCurrencyCode,
        };
      }

      // Convert through USD as base
      const amountInUSD = service.price * fromCurrency.exchangeRateToUSD;
      const convertedAmount = amountInUSD / targetCurrency.exchangeRateToUSD;

      return {
        ...service,
        originalPrice: service.price,
        originalCurrency: service.currencyCode,
        convertedPrice: Number(convertedAmount.toFixed(targetCurrency.decimalPlaces)),
        targetCurrencyCode,
        targetCurrencySymbol: targetCurrency.symbol,
        formattedPrice: this.formatPrice(service.price, fromCurrency),
        formattedConvertedPrice: this.formatPrice(convertedAmount, targetCurrency),
      };
    });
  }

  /**
   * Format price with currency symbol
   */
  private formatPrice(
    amount: number,
    currency: {
      symbol: string;
      symbolPosition: string;
      decimalPlaces: number;
      thousandSeparator: string;
      decimalSeparator: string;
    },
  ): string {
    const parts = amount.toFixed(currency.decimalPlaces).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandSeparator);
    const formattedNumber = parts.join(currency.decimalSeparator);

    if (currency.symbolPosition === 'before') {
      return `${currency.symbol}${formattedNumber}`;
    } else {
      return `${formattedNumber} ${currency.symbol}`;
    }
  }
}
