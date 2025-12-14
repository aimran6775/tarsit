import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { TarsMemoryService } from './memory/memory.service';
import { TarsActionsService } from './actions/actions.service';
import { TarsDatabaseQueryService } from './database/database-query.service';
import { TarsUsageService } from './usage/usage.service';
import { generatePersonalizedPrompt, TARS_ERROR_MESSAGES } from './prompts';
import OpenAI from 'openai';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface TarsResponse {
    message: string;
    conversationId: string;
    actionRequired?: {
        type: string;
        description: string;
        queueId?: string;
    };
    suggestions?: string[];
    links?: Array<{
        text: string;
        url: string;
        type: 'business' | 'category' | 'page' | 'external';
    }>;
}

export interface TarsContext {
    userId?: string;
    businessId?: string;
    sessionId: string;
    context?: 'general' | 'help' | 'business' | 'booking';
    userName?: string;
    businessName?: string;
}

@Injectable()
export class TarsService {
    private readonly logger = new Logger(TarsService.name);
    private openai: OpenAI;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
        private memoryService: TarsMemoryService,
        private actionsService: TarsActionsService,
        private databaseQuery: TarsDatabaseQueryService,
        private usageService: TarsUsageService,
    ) {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY');
        if (!apiKey) {
            this.logger.warn('OpenAI API key not configured. TARS will operate in limited mode.');
        }
        this.openai = new OpenAI({
            apiKey: apiKey || 'dummy-key',
        });
    }

    /**
     * Main chat method - processes user messages and returns TARS response
     */
    async chat(
        userMessage: string,
        context: TarsContext,
    ): Promise<TarsResponse> {
        const { userId, businessId, sessionId, context: chatContext = 'general' } = context;

        try {
            // Check usage limits first
            const usageCheck = await this.usageService.canMakeRequest();
            if (!usageCheck.allowed) {
                this.logger.warn(`TARS monthly limit reached: $${usageCheck.currentSpend.toFixed(2)}/$10.00`);
                return {
                    message: "I'm taking a brief power nap to conserve energy. My systems will be back online soon! In the meantime, you can browse businesses directly or check back later. Thanks for understanding!",
                    conversationId: '',
                    suggestions: ['Browse businesses', 'View categories', 'Visit help center'],
                };
            }

            // Get or create conversation
            let conversation = await this.prisma.tarsConversation.findFirst({
                where: {
                    sessionId,
                    ...(userId && { userId }),
                },
                include: {
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 20, // Last 20 messages for context
                    },
                },
            });

            if (!conversation) {
                conversation = await this.prisma.tarsConversation.create({
                    data: {
                        userId,
                        businessId,
                        sessionId,
                        context: chatContext,
                    },
                    include: { messages: true },
                });
            }

            // Store user message
            await this.prisma.tarsMessage.create({
                data: {
                    conversationId: conversation.id,
                    role: 'user',
                    content: userMessage,
                },
            });

            // Build context for AI - including real database data
            const memoryContext = await this.memoryService.buildMemoryContext({
                userId,
                businessId,
            });

            // Get relevant database context based on the message
            const databaseContext = await this.buildDatabaseContext(userMessage, chatContext, businessId);

            const systemPrompt = generatePersonalizedPrompt({
                userName: context.userName,
                businessName: context.businessName,
                conversationContext: chatContext,
            }) + memoryContext + databaseContext;

            // Build message history
            const messageHistory: ChatMessage[] = [
                { role: 'system', content: systemPrompt },
                ...conversation.messages
                    .reverse()
                    .map((m) => ({
                        role: m.role as 'user' | 'assistant',
                        content: m.content,
                    })),
                { role: 'user', content: userMessage },
            ];

            // Check for actionable intent
            const actionIntent = this.detectActionIntent(userMessage);

            // Get AI response
            const aiResponse = await this.getAIResponse(messageHistory, actionIntent);

            // Store assistant response
            await this.prisma.tarsMessage.create({
                data: {
                    conversationId: conversation.id,
                    role: 'assistant',
                    content: aiResponse.message,
                    metadata: aiResponse.metadata ? JSON.parse(JSON.stringify(aiResponse.metadata)) : undefined,
                },
            });

            // Handle any required actions
            let actionRequired: TarsResponse['actionRequired'];
            if (actionIntent && this.actionsService.requiresApproval(actionIntent.type)) {
                const queueId = await this.actionsService.submitForApproval({
                    actionType: actionIntent.type,
                    actionData: actionIntent.data,
                    description: actionIntent.description,
                    userId,
                    businessId,
                });

                actionRequired = {
                    type: actionIntent.type,
                    description: actionIntent.description,
                    queueId,
                };
            }

            // Extract any memory-worthy information
            await this.extractAndStoreMemories(userMessage, aiResponse.message, {
                userId,
                businessId,
            });

            // Extract links from response for navigation
            const links = this.extractLinks(aiResponse.message);

            return {
                message: aiResponse.message,
                conversationId: conversation.id,
                actionRequired,
                suggestions: aiResponse.suggestions,
                links,
            };
        } catch (error) {
            this.logger.error(`TARS chat error: ${error}`);
            return {
                message: TARS_ERROR_MESSAGES.generalError,
                conversationId: '',
            };
        }
    }

    /**
     * Build database context based on user message
     */
    private async buildDatabaseContext(
        message: string,
        chatContext: string,
        businessId?: string,
    ): Promise<string> {
        const lowerMessage = message.toLowerCase();
        let context = '\n\n--- REAL-TIME PLATFORM DATA ---\n';

        try {
            // Get platform stats
            const stats = await this.databaseQuery.getPlatformStats();
            context += `\nPlatform Stats: ${stats.totalBusinesses} active businesses, ${stats.totalCategories} categories, ${stats.totalReviews} reviews, serving ${stats.citiesServed} cities.\n`;

            // If asking about categories
            if (lowerMessage.includes('categor') || lowerMessage.includes('type') || lowerMessage.includes('kind')) {
                const categories = await this.databaseQuery.getCategories();
                context += `\nAvailable Categories:\n`;
                categories.slice(0, 10).forEach(c => {
                    context += `- ${c.name} (${c.businessCount} businesses) - link: /categories/${c.slug}\n`;
                });
            }

            // If searching for a business or service
            const searchTerms = this.extractSearchTerms(lowerMessage);
            if (searchTerms.length > 0) {
                const searchResults = await this.databaseQuery.searchBusinesses(searchTerms.join(' '), { limit: 5 });
                if (searchResults.businesses.length > 0) {
                    context += `\nSearch Results for "${searchTerms.join(' ')}":\n`;
                    searchResults.businesses.forEach(b => {
                        context += `- ${b.name} (${b.category}) in ${b.city} - Rating: ${b.rating}/5 (${b.reviewCount} reviews)${b.verified ? ' ✓ Verified' : ''} - Link: /business/${b.slug}\n`;
                    });
                }
            }

            // If asking about featured/top businesses
            if (lowerMessage.includes('best') || lowerMessage.includes('top') || lowerMessage.includes('popular') || lowerMessage.includes('recommend')) {
                const featured = await this.databaseQuery.getFeaturedBusinesses(5);
                if (featured.length > 0) {
                    context += `\nTop Rated Businesses:\n`;
                    featured.forEach(b => {
                        context += `- ${b.name} (${b.category}) in ${b.city} - Rating: ${b.rating}/5${b.verified ? ' ✓ Verified' : ''} - Link: /business/${b.slug}\n`;
                    });
                }
            }

            // If viewing a specific business
            if (businessId) {
                const business = await this.databaseQuery.getBusinessDetails(businessId);
                if (business) {
                    context += `\nCurrent Business Context - ${business.name}:\n`;
                    context += `- Category: ${business.category}\n`;
                    context += `- Location: ${business.city}, ${business.state}\n`;
                    context += `- Rating: ${business.rating}/5 (${business.reviewCount} reviews)\n`;
                    context += `- Appointments: ${business.appointmentsEnabled ? 'Available' : 'Not available'}\n`;
                    if (business.services.length > 0) {
                        context += `- Services: ${business.services.map(s => `${s.name}${s.price ? ` ($${s.price})` : ''}`).join(', ')}\n`;
                    }

                    // Check if open
                    const openStatus = await this.databaseQuery.isBusinessOpen(businessId);
                    context += `- Currently: ${openStatus.isOpen ? 'OPEN' : 'CLOSED'}${openStatus.hours ? ` (Today: ${openStatus.hours.open} - ${openStatus.hours.close})` : ''}\n`;
                }
            }

            context += '\n--- END PLATFORM DATA ---\n';
            context += '\nIMPORTANT: When mentioning businesses, include their link in format [Business Name](/business/slug). When mentioning categories, use [Category Name](/categories/slug). Always provide real data from above.\n';

            return context;
        } catch (error) {
            this.logger.error(`Error building database context: ${error}`);
            return '';
        }
    }

    /**
     * Extract search terms from message
     */
    private extractSearchTerms(message: string): string[] {
        const terms: string[] = [];

        // Common business types to search for
        const businessTypes = [
            'salon', 'restaurant', 'gym', 'spa', 'dentist', 'doctor', 'lawyer',
            'plumber', 'electrician', 'mechanic', 'barber', 'cafe', 'coffee',
            'pizza', 'sushi', 'nail', 'hair', 'massage', 'yoga', 'fitness',
            'bakery', 'florist', 'pet', 'vet', 'clinic', 'therapy', 'auto'
        ];

        businessTypes.forEach(type => {
            if (message.includes(type)) {
                terms.push(type);
            }
        });

        // Extract location mentions
        const locationMatch = message.match(/(?:in|near|around)\s+([a-zA-Z\s]+?)(?:\s|$|,|\.|!|\?)/i);
        if (locationMatch) {
            terms.push(locationMatch[1].trim());
        }

        return terms;
    }

    /**
     * Extract navigation links from AI response
     */
    private extractLinks(message: string): TarsResponse['links'] {
        const links: TarsResponse['links'] = [];

        // Match markdown links: [text](/path)
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        let match;

        while ((match = linkRegex.exec(message)) !== null) {
            const [, text, url] = match;
            let type: 'business' | 'category' | 'page' | 'external' = 'page';

            if (url.startsWith('/business/')) {
                type = 'business';
            } else if (url.startsWith('/categories/') || url.startsWith('/category/')) {
                type = 'category';
            } else if (url.startsWith('http')) {
                type = 'external';
            }

            links.push({ text, url, type });
        }

        return links;
    }

    /**
     * Get AI response from OpenAI
     */
    private async getAIResponse(
        messages: ChatMessage[],
        _actionIntent?: { type: string; data: Record<string, unknown>; description: string } | null,
    ): Promise<{ message: string; metadata?: Record<string, unknown>; suggestions?: string[]; links?: TarsResponse['links'] }> {
        try {
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: messages.map((m) => ({
                    role: m.role,
                    content: m.content,
                })),
                max_tokens: 1000,
                temperature: 0.7,
            });

            const responseContent = completion.choices[0]?.message?.content || TARS_ERROR_MESSAGES.generalError;

            // Track usage
            const usage = completion.usage;
            if (usage) {
                await this.usageService.trackUsage({
                    inputTokens: usage.prompt_tokens,
                    outputTokens: usage.completion_tokens,
                    model: 'gpt-4o-mini',
                });
            }

            // Generate suggestions based on context
            const suggestions = this.generateSuggestions(messages);

            return {
                message: responseContent,
                suggestions,
            };
        } catch (error) {
            this.logger.error(`OpenAI API error: ${error}`);

            // Fallback response if API fails
            return {
                message: "I'm having a bit of trouble connecting to my main systems right now. But don't worry - I can still help! What do you need?",
            };
        }
    }

    /**
     * Detect if the user message contains an actionable intent
     */
    private detectActionIntent(
        message: string,
    ): { type: string; data: Record<string, unknown>; description: string } | null {
        const lowerMessage = message.toLowerCase();

        // Booking intent
        if (
            lowerMessage.includes('book') ||
            lowerMessage.includes('schedule') ||
            lowerMessage.includes('appointment')
        ) {
            return {
                type: 'create_appointment',
                data: { rawMessage: message },
                description: 'User wants to create an appointment',
            };
        }

        // Cancellation intent
        if (
            lowerMessage.includes('cancel') &&
            (lowerMessage.includes('appointment') || lowerMessage.includes('booking'))
        ) {
            return {
                type: 'cancel_appointment',
                data: { rawMessage: message },
                description: 'User wants to cancel an appointment',
            };
        }

        // Business modification intent
        if (
            lowerMessage.includes('update') ||
            lowerMessage.includes('change') ||
            lowerMessage.includes('modify')
        ) {
            if (
                lowerMessage.includes('business') ||
                lowerMessage.includes('profile') ||
                lowerMessage.includes('hours')
            ) {
                return {
                    type: 'update_business_info',
                    data: { rawMessage: message },
                    description: 'User wants to update business information',
                };
            }
        }

        return null;
    }

    /**
     * Extract and store memories from conversation
     */
    private async extractAndStoreMemories(
        userMessage: string,
        _assistantResponse: string,
        context: { userId?: string; businessId?: string },
    ): Promise<void> {
        const lowerMessage = userMessage.toLowerCase();

        // Check for preference expressions
        if (lowerMessage.includes('prefer') || lowerMessage.includes('like') || lowerMessage.includes('favorite')) {
            // Extract preference (simplified - could use NLP for better extraction)
            const preferenceMatch = userMessage.match(/(?:prefer|like|favorite)\s+(.+?)(?:\.|$)/i);
            if (preferenceMatch && context.userId) {
                await this.memoryService.remember(
                    'preference',
                    preferenceMatch[1],
                    { userId: context.userId, category: 'preferences' },
                );
            }
        }

        // Check for location mentions
        if (lowerMessage.includes('near') || lowerMessage.includes('in ') || lowerMessage.includes('around')) {
            const locationMatch = userMessage.match(/(?:near|in|around)\s+(.+?)(?:\.|,|$)/i);
            if (locationMatch && context.userId) {
                await this.memoryService.remember(
                    'location_interest',
                    locationMatch[1],
                    { userId: context.userId, category: 'preferences' },
                );
            }
        }
    }

    /**
     * Generate contextual suggestions
     */
    private generateSuggestions(messages: ChatMessage[]): string[] {
        const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || '';

        if (lastMessage.includes('search') || lastMessage.includes('find')) {
            return [
                'Show me nearby options',
                'Filter by price range',
                'Sort by ratings',
            ];
        }

        if (lastMessage.includes('book') || lastMessage.includes('appointment')) {
            return [
                'Check availability',
                'See other time slots',
                'View cancellation policy',
            ];
        }

        return [
            'Help me find a business',
            'I have a question',
            'Talk to support',
        ];
    }

    /**
     * Get conversation history
     */
    async getConversationHistory(
        conversationId: string,
        limit = 50,
    ): Promise<ChatMessage[]> {
        const messages = await this.prisma.tarsMessage.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
            take: limit,
        });

        return messages.map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
        }));
    }

    /**
     * Clear conversation history
     */
    async clearConversation(conversationId: string): Promise<void> {
        await this.prisma.tarsMessage.deleteMany({
            where: { conversationId },
        });
        this.logger.log(`Cleared conversation: ${conversationId}`);
    }

    /**
     * Get TARS settings for a business
     */
    async getSettings(businessId: string) {
        let settings = await this.prisma.tarsSettings.findUnique({
            where: { businessId },
        });

        if (!settings) {
            settings = await this.prisma.tarsSettings.create({
                data: {
                    businessId,
                    enabled: true,
                    allowMemory: true,
                    personality: 'friendly',
                },
            });
        }

        return settings;
    }

    /**
     * Update TARS settings for a business
     */
    async updateSettings(
        businessId: string,
        updates: {
            enabled?: boolean;
            allowMemory?: boolean;
            personality?: string;
            customPrompt?: string;
            autoRespond?: boolean;
        },
    ) {
        return this.prisma.tarsSettings.upsert({
            where: { businessId },
            create: {
                businessId,
                ...updates,
            },
            update: updates,
        });
    }

    /**
     * Quick response for common queries (without full AI call)
     */
    quickResponse(query: string): string | null {
        const lowerQuery = query.toLowerCase();

        const quickResponses: Record<string, string> = {
            hello: "Hey there! I'm TARS, your friendly AI assistant. How can I help you today?",
            hi: "Hi! I'm TARS. What can I do for you?",
            help: "I can help you find businesses, make bookings, answer questions, and more. What would you like to do?",
            thanks: "You're welcome! Is there anything else I can help with?",
            bye: "See you around! Remember, I'm always here if you need anything.",
        };

        for (const [key, response] of Object.entries(quickResponses)) {
            if (lowerQuery === key || lowerQuery === `${key}!`) {
                return response;
            }
        }

        return null;
    }

    /**
     * Get TARS analytics for admin dashboard
     */
    async getAnalytics(options?: {
        startDate?: Date;
        endDate?: Date;
        businessId?: string;
    }) {
        const { startDate, endDate, businessId } = options || {};

        const dateFilter = {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
        };

        const [
            totalConversations,
            totalMessages,
            uniqueUsers,
            conversationsByContext,
            recentConversations,
            actionStats,
        ] = await Promise.all([
            // Total conversations
            this.prisma.tarsConversation.count({
                where: {
                    ...(businessId && { businessId }),
                    ...(Object.keys(dateFilter).length && { createdAt: dateFilter }),
                },
            }),
            // Total messages
            this.prisma.tarsMessage.count({
                where: {
                    conversation: {
                        ...(businessId && { businessId }),
                    },
                    ...(Object.keys(dateFilter).length && { createdAt: dateFilter }),
                },
            }),
            // Unique users
            this.prisma.tarsConversation.groupBy({
                by: ['userId'],
                where: {
                    userId: { not: null },
                    ...(businessId && { businessId }),
                    ...(Object.keys(dateFilter).length && { createdAt: dateFilter }),
                },
            }),
            // Conversations by context
            this.prisma.tarsConversation.groupBy({
                by: ['context'],
                _count: { id: true },
                where: {
                    ...(businessId && { businessId }),
                    ...(Object.keys(dateFilter).length && { createdAt: dateFilter }),
                },
            }),
            // Recent conversations with message count
            this.prisma.tarsConversation.findMany({
                where: {
                    ...(businessId && { businessId }),
                },
                include: {
                    _count: { select: { messages: true } },
                },
                orderBy: { updatedAt: 'desc' },
                take: 10,
            }),
            // Action queue stats
            this.prisma.tarsActionQueue.groupBy({
                by: ['status'],
                _count: { id: true },
                where: {
                    ...(businessId && { businessId }),
                    ...(Object.keys(dateFilter).length && { createdAt: dateFilter }),
                },
            }),
        ]);

        // Calculate average messages per conversation
        const avgMessagesPerConversation = totalConversations > 0
            ? Math.round(totalMessages / totalConversations * 10) / 10
            : 0;

        return {
            overview: {
                totalConversations,
                totalMessages,
                uniqueUsers: uniqueUsers.length,
                avgMessagesPerConversation,
            },
            contextBreakdown: conversationsByContext.reduce((acc, item) => {
                acc[item.context || 'general'] = item._count.id;
                return acc;
            }, {} as Record<string, number>),
            actionStats: actionStats.reduce((acc, item) => {
                acc[item.status] = item._count.id;
                return acc;
            }, {} as Record<string, number>),
            recentConversations: recentConversations.map(c => ({
                id: c.id,
                context: c.context,
                messageCount: c._count.messages,
                lastUpdated: c.updatedAt,
            })),
        };
    }

    /**
     * Get conversation insights for a specific conversation
     */
    async getConversationInsights(conversationId: string) {
        const conversation = await this.prisma.tarsConversation.findUnique({
            where: { id: conversationId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        if (!conversation) {
            return null;
        }

        const userMessages = conversation.messages.filter(m => m.role === 'user');
        const assistantMessages = conversation.messages.filter(m => m.role === 'assistant');

        // Calculate average response length
        const avgResponseLength = assistantMessages.length > 0
            ? Math.round(assistantMessages.reduce((sum, m) => sum + m.content.length, 0) / assistantMessages.length)
            : 0;

        // Get time between messages
        const responseTimes: number[] = [];
        for (let i = 1; i < conversation.messages.length; i++) {
            const prev = conversation.messages[i - 1];
            const curr = conversation.messages[i];
            if (prev.role === 'user' && curr.role === 'assistant') {
                const diff = new Date(curr.createdAt).getTime() - new Date(prev.createdAt).getTime();
                responseTimes.push(diff);
            }
        }

        const avgResponseTime = responseTimes.length > 0
            ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
            : 0;

        return {
            conversationId,
            context: conversation.context,
            totalMessages: conversation.messages.length,
            userMessages: userMessages.length,
            assistantMessages: assistantMessages.length,
            avgResponseLength,
            avgResponseTimeMs: avgResponseTime,
            startedAt: conversation.createdAt,
            lastMessageAt: conversation.updatedAt,
            duration: new Date(conversation.updatedAt).getTime() - new Date(conversation.createdAt).getTime(),
        };
    }
}
