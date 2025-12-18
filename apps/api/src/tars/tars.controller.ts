import {
    Controller,
    Post,
    Get,
    Put,
    Body,
    Param,
    Query,
    UseGuards,
    Req,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { IsString, IsOptional, IsArray, IsIn, IsBoolean } from 'class-validator';
import { TarsService, TarsContext } from './tars.service';
import { TarsActionsService } from './actions/actions.service';
import { TarsMemoryService } from './memory/memory.service';
import { TarsUsageService } from './usage/usage.service';
import { TarsDatabaseQueryService } from './database/database-query.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';

// DTOs with class-validator decorators
class ChatDto {
    @IsString()
    message!: string;

    @IsOptional()
    @IsString()
    sessionId?: string;

    @IsOptional()
    @IsIn(['general', 'help', 'business', 'booking'])
    context?: 'general' | 'help' | 'business' | 'booking';

    @IsOptional()
    @IsString()
    businessId?: string;
}

class ReviewActionDto {
    @IsArray()
    @IsString({ each: true })
    actionIds!: string[];

    @IsIn(['approve', 'reject'])
    decision!: 'approve' | 'reject';

    @IsOptional()
    @IsString()
    notes?: string;
}

class UpdateSettingsDto {
    @IsOptional()
    @IsBoolean()
    enabled?: boolean;

    @IsOptional()
    @IsBoolean()
    allowMemory?: boolean;

    @IsOptional()
    @IsString()
    personality?: string;

    @IsOptional()
    @IsString()
    customPrompt?: string;

    @IsOptional()
    @IsBoolean()
    autoRespond?: boolean;
}

class RememberDto {
    @IsString()
    key!: string;

    @IsString()
    value!: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    businessId?: string;
}

@Controller('tars')
export class TarsController {
    constructor(
        private readonly tarsService: TarsService,
        private readonly actionsService: TarsActionsService,
        private readonly memoryService: TarsMemoryService,
        private readonly usageService: TarsUsageService,
        private readonly databaseQuery: TarsDatabaseQueryService,
    ) { }

    /**
     * Main chat endpoint - available to all users (with optional auth)
     */
    @Post('chat')
    @UseGuards(OptionalAuthGuard)
    @HttpCode(HttpStatus.OK)
    async chat(@Body() body: ChatDto, @Req() req: AuthenticatedRequest) {
        const sessionId = body.sessionId || uuidv4();

        // Check for quick response first
        const quickResponse = this.tarsService.quickResponse(body.message);
        if (quickResponse) {
            return {
                message: quickResponse,
                sessionId,
                isQuickResponse: true,
            };
        }

        const context: TarsContext = {
            userId: req.user?.id,
            businessId: body.businessId,
            sessionId,
            context: body.context || 'general',
        };

        const response = await this.tarsService.chat(body.message, context);

        return {
            ...response,
            sessionId,
        };
    }

    /**
     * Get conversation history
     */
    @Get('conversation/:conversationId')
    @UseGuards(JwtAuthGuard)
    async getConversation(
        @Param('conversationId') conversationId: string,
        @Query('limit') limit?: number,
    ) {
        const messages = await this.tarsService.getConversationHistory(
            conversationId,
            limit,
        );
        return { messages };
    }

    /**
     * Clear conversation history
     */
    @Post('conversation/:conversationId/clear')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async clearConversation(@Param('conversationId') conversationId: string) {
        await this.tarsService.clearConversation(conversationId);
        return { success: true, message: 'Conversation cleared' };
    }

    // ============================================================================
    // ADMIN ENDPOINTS - Action Queue Management
    // ============================================================================

    /**
     * Get pending actions for admin review
     */
    @Get('admin/actions/pending')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async getPendingActions(
        @Query('businessId') businessId?: string,
        @Query('limit') limit?: number,
        @Query('offset') offset?: number,
    ) {
        return this.actionsService.getPendingActions({
            businessId,
            limit: limit ? Number(limit) : undefined,
            offset: offset ? Number(offset) : undefined,
        });
    }

    /**
     * Approve a single action
     */
    @Post('admin/actions/:actionId/approve')
    @UseGuards(JwtAuthGuard, AdminGuard)
    @HttpCode(HttpStatus.OK)
    async approveAction(
        @Param('actionId') actionId: string,
        @Query('notes') notes: string,
        @Req() req: AuthenticatedRequest,
    ) {
        return this.actionsService.approveAction(actionId, req.user!.id, notes);
    }

    /**
     * Reject a single action
     */
    @Post('admin/actions/:actionId/reject')
    @UseGuards(JwtAuthGuard, AdminGuard)
    @HttpCode(HttpStatus.OK)
    async rejectAction(
        @Param('actionId') actionId: string,
        @Body('reason') reason: string,
        @Req() req: AuthenticatedRequest,
    ) {
        await this.actionsService.rejectAction(actionId, req.user!.id, reason);
        return { success: true, message: 'Action rejected' };
    }

    /**
     * Bulk approve/reject actions
     */
    @Post('admin/actions/bulk-review')
    @UseGuards(JwtAuthGuard, AdminGuard)
    @HttpCode(HttpStatus.OK)
    async bulkReviewActions(
        @Body() body: ReviewActionDto,
        @Req() req: AuthenticatedRequest,
    ) {
        return this.actionsService.bulkReview(
            body.actionIds,
            body.decision,
            req.user!.id,
            body.notes,
        );
    }

    /**
     * Get action history
     */
    @Get('admin/actions/history')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async getActionHistory(
        @Query('userId') userId?: string,
        @Query('businessId') businessId?: string,
        @Query('status') status?: string,
        @Query('limit') limit?: number,
    ) {
        return this.actionsService.getActionHistory({
            userId,
            businessId,
            status: status as any,
            limit: limit ? Number(limit) : undefined,
        });
    }

    // ============================================================================
    // BUSINESS ENDPOINTS - TARS Settings
    // ============================================================================

    /**
     * Get TARS settings for a business
     */
    @Get('settings/:businessId')
    @UseGuards(JwtAuthGuard)
    async getSettings(@Param('businessId') businessId: string) {
        return this.tarsService.getSettings(businessId);
    }

    /**
     * Update TARS settings for a business
     */
    @Put('settings/:businessId')
    @UseGuards(JwtAuthGuard)
    async updateSettings(
        @Param('businessId') businessId: string,
        @Body() body: UpdateSettingsDto,
    ) {
        return this.tarsService.updateSettings(businessId, body);
    }

    // ============================================================================
    // MEMORY ENDPOINTS
    // ============================================================================

    /**
     * Store a memory (user preference, etc.)
     */
    @Post('memory')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async remember(@Body() body: RememberDto, @Req() req: AuthenticatedRequest) {
        await this.memoryService.remember(body.key, body.value, {
            userId: req.user?.id,
            businessId: body.businessId,
            category: body.category,
        });
        return { success: true, message: 'Memory stored' };
    }

    /**
     * Get all memories for current user
     */
    @Get('memory')
    @UseGuards(JwtAuthGuard)
    async getMemories(
        @Req() req: AuthenticatedRequest,
        @Query('businessId') businessId?: string,
        @Query('category') category?: string,
    ) {
        return this.memoryService.recallAll({
            userId: req.user?.id,
            businessId,
            category,
        });
    }

    /**
     * Delete a specific memory
     */
    @Post('memory/forget')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async forget(@Body('key') key: string, @Req() req: AuthenticatedRequest) {
        await this.memoryService.forget(key, { userId: req.user?.id });
        return { success: true, message: 'Memory forgotten' };
    }

    /**
     * Clear all memories
     */
    @Post('memory/clear')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async clearMemories(@Req() req: AuthenticatedRequest) {
        const count = await this.memoryService.forgetAll({ userId: req.user?.id });
        return { success: true, message: `Cleared ${count} memories` };
    }

    // ============================================================================
    // ANALYTICS ENDPOINTS (Admin)
    // ============================================================================

    /**
     * Get TARS analytics overview
     */
    @Get('admin/analytics')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async getAnalytics(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('businessId') businessId?: string,
    ) {
        return this.tarsService.getAnalytics({
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            businessId,
        });
    }

    /**
     * Get detailed insights for a specific conversation
     */
    @Get('admin/analytics/conversation/:conversationId')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async getConversationInsights(@Param('conversationId') conversationId: string) {
        return this.tarsService.getConversationInsights(conversationId);
    }

    // ============================================================================
    // HEALTH CHECK
    // ============================================================================

    /**
     * TARS status endpoint
     */
    @Get('status')
    getStatus() {
        return {
            status: 'online',
            name: 'TARS',
            version: '1.0.0',
            humor: '75%',
            message: "All systems operational. What can I help you with?",
        };
    }

    // ============================================================================
    // USAGE TRACKING ENDPOINTS (Admin)
    // ============================================================================

    /**
     * Get OpenAI usage statistics
     */
    @Get('admin/usage')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async getUsageStats() {
        return this.usageService.getUsageStats();
    }

    /**
     * Check if TARS can make requests (within budget)
     */
    @Get('admin/usage/status')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async getUsageStatus() {
        return this.usageService.canMakeRequest();
    }

    // ============================================================================
    // PUBLIC DATA ENDPOINTS (No auth required)
    // ============================================================================

    /**
     * Search businesses (public data only)
     */
    @Get('search/businesses')
    async searchBusinesses(
        @Query('q') query: string,
        @Query('city') city?: string,
        @Query('limit') limit?: number,
    ) {
        if (!query) {
            return { businesses: [], total: 0 };
        }
        return this.databaseQuery.searchBusinesses(query, {
            city,
            limit: limit ? Number(limit) : 5,
        });
    }

    /**
     * Get categories list
     */
    @Get('data/categories')
    async getCategories() {
        return this.databaseQuery.getCategories();
    }

    /**
     * Get featured businesses
     */
    @Get('data/featured')
    async getFeaturedBusinesses(@Query('limit') limit?: number) {
        return this.databaseQuery.getFeaturedBusinesses(limit ? Number(limit) : 5);
    }

    /**
     * Get platform stats
     */
    @Get('data/stats')
    async getPlatformStats() {
        return this.databaseQuery.getPlatformStats();
    }
}
