import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface MemoryEntry {
    key: string;
    value: string;
    category: string;
}

@Injectable()
export class TarsMemoryService {
    private readonly logger = new Logger(TarsMemoryService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Store a memory for a user or business
     */
    async remember(
        key: string,
        value: string,
        options: {
            userId?: string;
            businessId?: string;
            category?: string;
        },
    ): Promise<void> {
        const { userId, businessId, category = 'general' } = options;

        try {
            await this.prisma.tarsMemory.upsert({
                where: {
                    userId_businessId_key: {
                        userId: userId || null,
                        businessId: businessId || null,
                        key,
                    },
                },
                create: {
                    userId,
                    businessId,
                    key,
                    value,
                    category,
                },
                update: {
                    value,
                    category,
                    updatedAt: new Date(),
                },
            });

            this.logger.log(`Memory stored: ${key} for user=${userId}, business=${businessId}`);
        } catch (error) {
            this.logger.error(`Failed to store memory: ${error}`);
            throw error;
        }
    }

    /**
     * Recall a specific memory
     */
    async recall(
        key: string,
        options: {
            userId?: string;
            businessId?: string;
        },
    ): Promise<string | null> {
        const { userId, businessId } = options;

        const memory = await this.prisma.tarsMemory.findFirst({
            where: {
                key,
                OR: [
                    { userId: userId || undefined },
                    { businessId: businessId || undefined },
                ],
            },
        });

        return memory?.value || null;
    }

    /**
     * Get all memories for a user or business
     */
    async recallAll(options: {
        userId?: string;
        businessId?: string;
        category?: string;
    }): Promise<MemoryEntry[]> {
        const { userId, businessId, category } = options;

        const memories = await this.prisma.tarsMemory.findMany({
            where: {
                ...(userId && { userId }),
                ...(businessId && { businessId }),
                ...(category && { category }),
            },
            orderBy: { updatedAt: 'desc' },
        });

        return memories.map((m) => ({
            key: m.key,
            value: m.value,
            category: m.category,
        }));
    }

    /**
     * Forget a specific memory
     */
    async forget(
        key: string,
        options: {
            userId?: string;
            businessId?: string;
        },
    ): Promise<void> {
        const { userId, businessId } = options;

        await this.prisma.tarsMemory.deleteMany({
            where: {
                key,
                userId: userId || null,
                businessId: businessId || null,
            },
        });

        this.logger.log(`Memory forgotten: ${key}`);
    }

    /**
     * Forget all memories for a user or business
     */
    async forgetAll(options: {
        userId?: string;
        businessId?: string;
    }): Promise<number> {
        const { userId, businessId } = options;

        const result = await this.prisma.tarsMemory.deleteMany({
            where: {
                ...(userId && { userId }),
                ...(businessId && { businessId }),
            },
        });

        this.logger.log(`Cleared ${result.count} memories`);
        return result.count;
    }

    /**
     * Build context from memories for the AI prompt
     */
    async buildMemoryContext(options: {
        userId?: string;
        businessId?: string;
    }): Promise<string> {
        const memories = await this.recallAll(options);

        if (memories.length === 0) {
            return '';
        }

        const grouped = memories.reduce((acc, mem) => {
            if (!acc[mem.category]) {
                acc[mem.category] = [];
            }
            acc[mem.category].push(mem);
            return acc;
        }, {} as Record<string, MemoryEntry[]>);

        let context = '\n## REMEMBERED CONTEXT\n';

        for (const [category, items] of Object.entries(grouped)) {
            context += `### ${category.charAt(0).toUpperCase() + category.slice(1)}\n`;
            for (const item of items) {
                context += `- ${item.key}: ${item.value}\n`;
            }
        }

        return context;
    }
}
