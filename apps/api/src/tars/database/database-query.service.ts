import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * TARS Database Query Service
 * Provides read-only access to public business data for TARS AI
 * NO access to: user passwords, personal info, private messages, payment data
 */
@Injectable()
export class TarsDatabaseQueryService {
    private readonly logger = new Logger(TarsDatabaseQueryService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Search businesses by query - public data only
     */
    async searchBusinesses(query: string, options?: {
        city?: string;
        categoryId?: string;
        limit?: number;
    }): Promise<{
        businesses: Array<{
            id: string;
            name: string;
            slug: string;
            description: string | null;
            city: string;
            state: string;
            rating: number;
            reviewCount: number;
            priceRange: string;
            category: string;
            verified: boolean;
        }>;
        total: number;
    }> {
        const limit = Math.min(options?.limit || 5, 10); // Max 10 results

        const where = {
            active: true,
            OR: [
                { name: { contains: query, mode: 'insensitive' as const } },
                { description: { contains: query, mode: 'insensitive' as const } },
                { city: { contains: query, mode: 'insensitive' as const } },
            ],
            ...(options?.city && { city: { contains: options.city, mode: 'insensitive' as const } }),
            ...(options?.categoryId && { categoryId: options.categoryId }),
        };

        const [businesses, total] = await Promise.all([
            this.prisma.business.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    city: true,
                    state: true,
                    rating: true,
                    reviewCount: true,
                    priceRange: true,
                    verified: true,
                    category: {
                        select: { name: true },
                    },
                },
                orderBy: [
                    { verified: 'desc' },
                    { rating: 'desc' },
                ],
                take: limit,
            }),
            this.prisma.business.count({ where }),
        ]);

        return {
            businesses: businesses.map(b => ({
                ...b,
                category: b.category.name,
            })),
            total,
        };
    }

    /**
     * Get business details by slug or ID - public data only
     */
    async getBusinessDetails(slugOrId: string): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        address: string;
        city: string;
        state: string;
        phone: string;
        website: string | null;
        rating: number;
        reviewCount: number;
        priceRange: string;
        category: string;
        verified: boolean;
        hours: unknown;
        services: Array<{
            name: string;
            description: string | null;
            price: number | null;
            duration: number | null;
        }>;
        appointmentsEnabled: boolean;
    } | null> {
        const business = await this.prisma.business.findFirst({
            where: {
                active: true,
                OR: [
                    { slug: slugOrId },
                    { id: slugOrId },
                ],
            },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                addressLine1: true,
                addressLine2: true,
                city: true,
                state: true,
                zipCode: true,
                phone: true,
                website: true,
                rating: true,
                reviewCount: true,
                priceRange: true,
                verified: true,
                hours: true,
                appointmentsEnabled: true,
                category: {
                    select: { name: true },
                },
                services: {
                    where: { active: true },
                    select: {
                        name: true,
                        description: true,
                        price: true,
                        duration: true,
                    },
                    orderBy: { order: 'asc' },
                    take: 10,
                },
            },
        });

        if (!business) return null;

        return {
            id: business.id,
            name: business.name,
            slug: business.slug,
            description: business.description,
            address: [business.addressLine1, business.addressLine2, `${business.city}, ${business.state} ${business.zipCode}`]
                .filter(Boolean)
                .join(', '),
            city: business.city,
            state: business.state,
            phone: business.phone,
            website: business.website,
            rating: business.rating,
            reviewCount: business.reviewCount,
            priceRange: business.priceRange,
            category: business.category.name,
            verified: business.verified,
            hours: business.hours,
            services: business.services,
            appointmentsEnabled: business.appointmentsEnabled,
        };
    }

    /**
     * Get all categories
     */
    async getCategories(): Promise<Array<{
        id: string;
        name: string;
        slug: string;
        businessCount: number;
    }>> {
        const categories = await this.prisma.category.findMany({
            where: { active: true },
            select: {
                id: true,
                name: true,
                slug: true,
                _count: {
                    select: { businesses: true },
                },
            },
            orderBy: { name: 'asc' },
        });

        return categories.map(c => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            businessCount: c._count.businesses,
        }));
    }

    /**
     * Get recent public reviews for a business
     */
    async getBusinessReviews(businessId: string, limit = 5): Promise<Array<{
        rating: number;
        comment: string | null;
        createdAt: Date;
        userName: string;
    }>> {
        const reviews = await this.prisma.review.findMany({
            where: {
                businessId,
            },
            select: {
                rating: true,
                comment: true,
                createdAt: true,
                user: {
                    select: { firstName: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: Math.min(limit, 10),
        });

        return reviews.map(r => ({
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt,
            userName: r.user.firstName,
        }));
    }

    /**
     * Get businesses by category
     */
    async getBusinessesByCategory(categorySlug: string, options?: {
        city?: string;
        limit?: number;
    }): Promise<Array<{
        id: string;
        name: string;
        slug: string;
        city: string;
        rating: number;
        reviewCount: number;
        priceRange: string;
        verified: boolean;
    }>> {
        const limit = Math.min(options?.limit || 5, 10);

        const businesses = await this.prisma.business.findMany({
            where: {
                active: true,
                category: { slug: categorySlug },
                ...(options?.city && { city: { contains: options.city, mode: 'insensitive' as const } }),
            },
            select: {
                id: true,
                name: true,
                slug: true,
                city: true,
                rating: true,
                reviewCount: true,
                priceRange: true,
                verified: true,
            },
            orderBy: [
                { verified: 'desc' },
                { rating: 'desc' },
            ],
            take: limit,
        });

        return businesses;
    }

    /**
     * Get featured/top businesses
     */
    async getFeaturedBusinesses(limit = 5): Promise<Array<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        city: string;
        rating: number;
        category: string;
        verified: boolean;
    }>> {
        const businesses = await this.prisma.business.findMany({
            where: {
                active: true,
                OR: [
                    { featured: true },
                    { verified: true, rating: { gte: 4 } },
                ],
            },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                city: true,
                rating: true,
                verified: true,
                category: {
                    select: { name: true },
                },
            },
            orderBy: [
                { featured: 'desc' },
                { rating: 'desc' },
            ],
            take: Math.min(limit, 10),
        });

        return businesses.map(b => ({
            ...b,
            category: b.category.name,
        }));
    }

    /**
     * Get platform statistics - public aggregate data only
     */
    async getPlatformStats(): Promise<{
        totalBusinesses: number;
        totalCategories: number;
        totalReviews: number;
        citiesServed: number;
    }> {
        const [totalBusinesses, totalCategories, totalReviews, cities] = await Promise.all([
            this.prisma.business.count({ where: { active: true } }),
            this.prisma.category.count({ where: { active: true } }),
            this.prisma.review.count(),
            this.prisma.business.findMany({
                where: { active: true },
                select: { city: true },
                distinct: ['city'],
            }),
        ]);

        return {
            totalBusinesses,
            totalCategories,
            totalReviews,
            citiesServed: cities.length,
        };
    }

    /**
     * Check if a business is open now
     */
    async isBusinessOpen(businessId: string): Promise<{
        isOpen: boolean;
        currentDay: string;
        hours: { open: string; close: string } | null;
    }> {
        const business = await this.prisma.business.findUnique({
            where: { id: businessId },
            select: { hours: true },
        });

        if (!business?.hours) {
            return { isOpen: false, currentDay: '', hours: null };
        }

        const now = new Date();
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const currentDay = days[now.getDay()];
        const hours = business.hours as Record<string, { open: string; close: string; closed?: boolean }>;
        const todayHours = hours[currentDay];

        if (!todayHours || todayHours.closed) {
            return { isOpen: false, currentDay, hours: null };
        }

        const currentTime = now.getHours() * 100 + now.getMinutes();
        const openTime = parseInt(todayHours.open.replace(':', ''));
        const closeTime = parseInt(todayHours.close.replace(':', ''));

        return {
            isOpen: currentTime >= openTime && currentTime <= closeTime,
            currentDay,
            hours: { open: todayHours.open, close: todayHours.close },
        };
    }

    /**
     * Search services across all businesses
     */
    async searchServices(query: string, options?: {
        maxPrice?: number;
        city?: string;
        limit?: number;
    }): Promise<Array<{
        serviceName: string;
        serviceDescription: string | null;
        price: number | null;
        duration: number | null;
        businessName: string;
        businessSlug: string;
        businessCity: string;
        businessRating: number;
    }>> {
        const limit = Math.min(options?.limit || 5, 10);

        const services = await this.prisma.service.findMany({
            where: {
                active: true,
                name: { contains: query, mode: 'insensitive' },
                ...(options?.maxPrice && { price: { lte: options.maxPrice } }),
                business: {
                    active: true,
                    ...(options?.city && { city: { contains: options.city, mode: 'insensitive' } }),
                },
            },
            select: {
                name: true,
                description: true,
                price: true,
                duration: true,
                business: {
                    select: {
                        name: true,
                        slug: true,
                        city: true,
                        rating: true,
                    },
                },
            },
            take: limit,
        });

        return services.map(s => ({
            serviceName: s.name,
            serviceDescription: s.description,
            price: s.price,
            duration: s.duration,
            businessName: s.business.name,
            businessSlug: s.business.slug,
            businessCity: s.business.city,
            businessRating: s.business.rating,
        }));
    }
}
