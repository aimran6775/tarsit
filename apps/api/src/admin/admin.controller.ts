import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Admin Dashboard')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ============================================================================
  // REAL-TIME MONITORING
  // ============================================================================

  @Get('dashboard/real-time')
  @ApiOperation({
    summary: 'Get real-time dashboard stats (Admin only)',
    description:
      'Real-time overview: total stats, 24h activity, online users, pending verifications, recent activities',
  })
  @ApiResponse({ status: 200, description: 'Real-time stats retrieved' })
  getRealTimeStats() {
    return this.adminService.getRealTimeStats();
  }

  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  @Get('users')
  @ApiOperation({ summary: 'Get all users with filters (Admin only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  getAllUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('role') role?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllUsers({ page, limit, role, search });
  }

  @Patch('users/:id')
  @ApiOperation({
    summary: 'Update user (role, verified, active) (Admin only)',
  })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  updateUser(
    @Param('id') id: string,
    @Body()
    data: {
      role?: string;
      verified?: boolean;
      active?: boolean;
    },
  ) {
    return this.adminService.updateUser(id, data);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  // ============================================================================
  // BUSINESS MANAGEMENT
  // ============================================================================

  @Get('businesses')
  @ApiOperation({
    summary: 'Get all businesses with filters (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Businesses retrieved successfully',
  })
  getAllBusinesses(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('verified') verified?: boolean,
    @Query('active') active?: boolean,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllBusinesses({
      page,
      limit,
      verified,
      active,
      search,
    });
  }

  @Patch('businesses/:id')
  @ApiOperation({
    summary: 'Update business (verified, active, featured) (Admin only)',
  })
  @ApiResponse({ status: 200, description: 'Business updated successfully' })
  updateBusiness(
    @Param('id') id: string,
    @Body()
    data: {
      verified?: boolean;
      active?: boolean;
      featured?: boolean;
    },
  ) {
    return this.adminService.updateBusiness(id, data);
  }

  @Delete('businesses/:id')
  @ApiOperation({ summary: 'Delete business (Admin only)' })
  @ApiResponse({ status: 200, description: 'Business deleted successfully' })
  deleteBusiness(@Param('id') id: string) {
    return this.adminService.deleteBusiness(id);
  }

  // ============================================================================
  // CONTENT MODERATION
  // ============================================================================

  @Get('reviews')
  @ApiOperation({ summary: 'Get all reviews with filters (Admin only)' })
  @ApiResponse({ status: 200, description: 'Reviews retrieved successfully' })
  getAllReviews(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('rating') rating?: number,
    @Query('hasResponse') hasResponse?: boolean,
  ) {
    return this.adminService.getAllReviews({
      page,
      limit,
      rating,
      hasResponse,
    });
  }

  @Delete('reviews/:id')
  @ApiOperation({ summary: 'Delete review (Admin only)' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  deleteReview(@Param('id') id: string) {
    return this.adminService.deleteReview(id);
  }

  // ============================================================================
  // SYSTEM HEALTH
  // ============================================================================

  @Get('system/health')
  @ApiOperation({
    summary: 'Get system health metrics (Admin only)',
    description:
      'Database status, memory usage, uptime, Node.js version, environment',
  })
  @ApiResponse({ status: 200, description: 'System health retrieved' })
  getSystemHealth() {
    return this.adminService.getSystemHealth();
  }

  // ============================================================================
  // AI-POWERED INSIGHTS
  // ============================================================================

  @Get('insights/ai')
  @ApiOperation({
    summary: 'Get AI-powered business insights (Admin only)',
    description:
      'Business trends, customer sentiment, growth analysis, recommendations',
  })
  @ApiResponse({ status: 200, description: 'AI insights generated' })
  generateAIInsights() {
    return this.adminService.generateAIInsights();
  }

  // ============================================================================
  // AUDIT LOGS
  // ============================================================================

  @Get('audit-logs')
  @ApiOperation({
    summary: 'Get audit logs (Admin only)',
    description: 'Track all admin actions and system changes',
  })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved' })
  getAuditLogs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('action') action?: string,
  ) {
    return this.adminService.getAuditLogs({ page, limit, action });
  }

  // ============================================================================
  // BROADCAST MESSAGING
  // ============================================================================

  @Post('broadcast')
  @ApiOperation({
    summary: 'Broadcast message to users (Admin only)',
    description:
      'Send real-time message to all online users or specific groups',
  })
  @ApiResponse({ status: 200, description: 'Broadcast sent successfully' })
  broadcastMessage(
    @Body()
    data: {
      title: string;
      content: string;
      type: 'info' | 'warning' | 'alert';
      recipients: 'all' | 'businesses' | 'customers';
    },
  ) {
    return this.adminService.broadcastMessage(data);
  }

  // ============================================================================
  // REPORTS
  // ============================================================================

  @Post('reports/generate')
  @ApiOperation({
    summary: 'Generate admin report (Admin only)',
    description: 'Generate various types of reports (user activity, business performance, etc.)',
  })
  @ApiResponse({ status: 200, description: 'Report generated successfully' })
  generateReport(
    @Body()
    data: {
      type: string;
      startDate?: string;
      endDate?: string;
      format?: string;
    },
  ) {
    const startDate = data.startDate ? new Date(data.startDate) : undefined;
    const endDate = data.endDate ? new Date(data.endDate) : undefined;
    return this.adminService.generateReport(data.type, startDate, endDate);
  }
}
