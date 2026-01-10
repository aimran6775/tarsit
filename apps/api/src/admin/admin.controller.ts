import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { AdminService } from './admin.service';

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
  // CATEGORY MANAGEMENT
  // ============================================================================

  @Get('categories')
  @ApiOperation({ summary: 'Get all categories with hierarchy (Admin only)' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  getAllCategories(
    @Query('includeInactive') includeInactive?: boolean,
  ) {
    return this.adminService.getAllCategories(includeInactive === true);
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create a new category (Admin only)' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 409, description: 'Category name or slug already exists' })
  createCategory(
    @Req() req: AuthenticatedRequest,
    @Body()
    data: {
      name: string;
      slug?: string;
      icon?: string;
      description?: string;
      parentId?: string;
      order?: number;
      active?: boolean;
    },
  ) {
    return this.adminService.createCategory(data, req.user!.id);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update a category (Admin only)' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  updateCategory(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body()
    data: {
      name?: string;
      slug?: string;
      icon?: string;
      description?: string;
      parentId?: string | null;
      order?: number;
      active?: boolean;
    },
  ) {
    return this.adminService.updateCategory(id, data, req.user!.id);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete a category (Admin only)' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete category with businesses' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  deleteCategory(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.adminService.deleteCategory(id, req.user!.id);
  }

  @Patch('categories/reorder')
  @ApiOperation({ summary: 'Reorder categories (Admin only)' })
  @ApiResponse({ status: 200, description: 'Categories reordered successfully' })
  reorderCategories(
    @Req() req: AuthenticatedRequest,
    @Body()
    data: {
      categoryOrders: Array<{ id: string; order: number }>;
    },
  ) {
    return this.adminService.reorderCategories(data.categoryOrders, req.user!.id);
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

  // ============================================================================
  // SETTINGS MANAGEMENT (Persistent)
  // ============================================================================

  @Get('settings')
  @ApiOperation({ summary: 'Get all admin settings (Admin only)' })
  @ApiResponse({ status: 200, description: 'Settings retrieved successfully' })
  getSettings() {
    return this.adminService.getSettings();
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Update admin settings (Admin only)' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  updateSettings(
    @Req() req: AuthenticatedRequest,
    @Body()
    data: {
      siteName?: string;
      maintenanceMode?: boolean;
      newRegistrations?: boolean;
      requireEmailVerification?: boolean;
      autoApproveBusinesses?: boolean;
      defaultPriceRange?: string;
      featuredListingCost?: number;
      supportEmail?: string;
      maxPhotosPerBusiness?: number;
      maxServicesPerBusiness?: number;
    },
  ) {
    return this.adminService.updateSettings(data, req.user!.id);
  }

  // ============================================================================
  // VERIFICATION WORKFLOW
  // ============================================================================

  @Get('verifications')
  @ApiOperation({ summary: 'Get all verification requests (Admin only)' })
  @ApiResponse({ status: 200, description: 'Verification requests retrieved' })
  getVerificationRequests(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.adminService.getVerificationRequests({ page, limit, status });
  }

  @Get('verifications/:id')
  @ApiOperation({ summary: 'Get verification request details (Admin only)' })
  @ApiResponse({ status: 200, description: 'Verification request retrieved' })
  @ApiResponse({ status: 404, description: 'Verification request not found' })
  getVerificationRequest(@Param('id') id: string) {
    return this.adminService.getVerificationRequest(id);
  }

  @Patch('verifications/:id/approve')
  @ApiOperation({ summary: 'Approve verification request (Admin only)' })
  @ApiResponse({ status: 200, description: 'Verification approved' })
  approveVerification(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() data: { notes?: string },
  ) {
    return this.adminService.approveVerification(id, req.user!.id, data.notes);
  }

  @Patch('verifications/:id/reject')
  @ApiOperation({ summary: 'Reject verification request (Admin only)' })
  @ApiResponse({ status: 200, description: 'Verification rejected' })
  rejectVerification(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() data: { reason: string; notes?: string },
  ) {
    return this.adminService.rejectVerification(id, req.user!.id, data.reason, data.notes);
  }
}
