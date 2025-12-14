import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * TARS Usage Tracking Service
 * Tracks OpenAI API usage and enforces monthly spending limits
 */
@Injectable()
export class TarsUsageService {
    private readonly logger = new Logger(TarsUsageService.name);

    // Pricing per 1K tokens (GPT-4o-mini as of 2024)
    // Input: $0.00015 per 1K tokens
    // Output: $0.0006 per 1K tokens
    private readonly PRICE_PER_1K_INPUT = 0.00015;
    private readonly PRICE_PER_1K_OUTPUT = 0.0006;

    // Monthly limit in dollars
    private readonly MONTHLY_LIMIT_USD = 10.00;

    constructor(private prisma: PrismaService) { }

    /**
     * Check if we're under the monthly limit
     */
    async canMakeRequest(): Promise<{
        allowed: boolean;
        currentSpend: number;
        remainingBudget: number;
        percentUsed: number;
    }> {
        const currentSpend = await this.getCurrentMonthSpend();
        const remainingBudget = Math.max(0, this.MONTHLY_LIMIT_USD - currentSpend);
        const percentUsed = (currentSpend / this.MONTHLY_LIMIT_USD) * 100;

        return {
            allowed: currentSpend < this.MONTHLY_LIMIT_USD,
            currentSpend,
            remainingBudget,
            percentUsed,
        };
    }

    /**
     * Track a completed request
     */
    async trackUsage(params: {
        inputTokens: number;
        outputTokens: number;
        model: string;
        conversationId?: string;
        userId?: string;
    }): Promise<{
        cost: number;
        totalMonthlySpend: number;
    }> {
        const inputCost = (params.inputTokens / 1000) * this.PRICE_PER_1K_INPUT;
        const outputCost = (params.outputTokens / 1000) * this.PRICE_PER_1K_OUTPUT;
        const totalCost = inputCost + outputCost;

        // Get current month key
        const monthKey = this.getCurrentMonthKey();

        // Upsert usage record
        await this.prisma.tarsUsage.upsert({
            where: { monthKey },
            create: {
                monthKey,
                inputTokens: params.inputTokens,
                outputTokens: params.outputTokens,
                totalCost: totalCost,
                requestCount: 1,
            },
            update: {
                inputTokens: { increment: params.inputTokens },
                outputTokens: { increment: params.outputTokens },
                totalCost: { increment: totalCost },
                requestCount: { increment: 1 },
            },
        });

        const totalMonthlySpend = await this.getCurrentMonthSpend();

        // Log warning if approaching limit
        if (totalMonthlySpend > this.MONTHLY_LIMIT_USD * 0.8) {
            this.logger.warn(`TARS usage at ${((totalMonthlySpend / this.MONTHLY_LIMIT_USD) * 100).toFixed(1)}% of monthly limit`);
        }

        return {
            cost: totalCost,
            totalMonthlySpend,
        };
    }

    /**
     * Get current month's total spend
     */
    async getCurrentMonthSpend(): Promise<number> {
        const monthKey = this.getCurrentMonthKey();

        const usage = await this.prisma.tarsUsage.findUnique({
            where: { monthKey },
        });

        return usage?.totalCost || 0;
    }

    /**
     * Get usage statistics
     */
    async getUsageStats(): Promise<{
        currentMonth: {
            spend: number;
            limit: number;
            remaining: number;
            percentUsed: number;
            inputTokens: number;
            outputTokens: number;
            requestCount: number;
        };
        history: Array<{
            month: string;
            spend: number;
            requestCount: number;
        }>;
    }> {
        const monthKey = this.getCurrentMonthKey();

        const currentUsage = await this.prisma.tarsUsage.findUnique({
            where: { monthKey },
        });

        // Get last 6 months of history
        const history = await this.prisma.tarsUsage.findMany({
            orderBy: { monthKey: 'desc' },
            take: 6,
        });

        const currentSpend = currentUsage?.totalCost || 0;

        return {
            currentMonth: {
                spend: currentSpend,
                limit: this.MONTHLY_LIMIT_USD,
                remaining: Math.max(0, this.MONTHLY_LIMIT_USD - currentSpend),
                percentUsed: (currentSpend / this.MONTHLY_LIMIT_USD) * 100,
                inputTokens: currentUsage?.inputTokens || 0,
                outputTokens: currentUsage?.outputTokens || 0,
                requestCount: currentUsage?.requestCount || 0,
            },
            history: history.map(h => ({
                month: h.monthKey,
                spend: h.totalCost,
                requestCount: h.requestCount,
            })),
        };
    }

    /**
     * Estimate cost for a request before making it
     */
    estimateCost(estimatedInputTokens: number, estimatedOutputTokens: number): number {
        return (
            (estimatedInputTokens / 1000) * this.PRICE_PER_1K_INPUT +
            (estimatedOutputTokens / 1000) * this.PRICE_PER_1K_OUTPUT
        );
    }

    /**
     * Get current month key (YYYY-MM format)
     */
    private getCurrentMonthKey(): string {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
}
