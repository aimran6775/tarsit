/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * EMAIL ADMIN CONTROLLER
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Admin endpoints for email management:
 * - View email logs and statistics
 * - Preview email templates
 * - Send test emails
 * - Resend failed emails
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from './mail.service';

// Import templates directly to avoid barrel file issues
import { accountSecurityTemplate } from './templates/account-security.template';
import { appointmentCancellationTemplate } from './templates/appointment-cancellation.template';
import { appointmentConfirmationTemplate } from './templates/appointment-confirmation.template';
import { appointmentReminderTemplate } from './templates/appointment-reminder.template';
import { appointmentRequestTemplate } from './templates/appointment-request.template';
import { appointmentStatusTemplate } from './templates/appointment-status.template';
import { contactNotificationTemplate } from './templates/contact-notification.template';
import { magicLinkEmailTemplate } from './templates/magic-link.template';
import { passwordResetEmailTemplate } from './templates/password-reset.template';
import { promotionalEmailTemplate } from './templates/promotional.template';
import { reviewNotificationTemplate } from './templates/review-notification.template';
import { teamInvitationTemplate } from './templates/team-invitation.template';
import { verificationStatusTemplate } from './templates/verification-status.template';
import { verificationEmailTemplate } from './templates/verification.template';
import { weeklyDigestTemplate } from './templates/weekly-digest.template';
import { welcomeEmailTemplate } from './templates/welcome.template';

// Sample data for template previews
const sampleData = {
  firstName: 'John',
  appUrl: 'https://tarsit.com',
  verificationUrl: 'https://tarsit.com/verify?token=sample',
  resetUrl: 'https://tarsit.com/reset?token=sample',
  magicLinkUrl: 'https://tarsit.com/magic?token=sample',
  businessName: 'Luxe Spa & Wellness',
  businessOwnerName: 'Sarah',
  serviceName: 'Deep Tissue Massage',
  appointmentDate: new Date(),
  appointmentTime: '2:00 PM',
  businessAddress: '123 Wellness Street, Dubai Marina',
  businessPhone: '+971 50 123 4567',
  dashboardUrl: 'https://tarsit.com/dashboard',
  appointmentUrl: 'https://tarsit.com/appointments',
  rebookUrl: 'https://tarsit.com/book',
  customerName: 'Jane Doe',
  reviewerName: 'Mike Johnson',
  rating: 5,
  reviewText: 'Absolutely amazing experience! The staff was professional and the atmosphere was so relaxing.',
  reviewUrl: 'https://tarsit.com/reviews',
  inviteeName: 'Alex',
  inviterName: 'Sarah',
  role: 'Manager',
  permissions: ['View appointments', 'Manage bookings', 'View analytics', 'Respond to reviews'],
  acceptUrl: 'https://tarsit.com/accept-invite',
  senderName: 'Emily Brown',
  senderEmail: 'emily@example.com',
  senderPhone: '+971 55 987 6543',
  subject: 'Inquiry about spa packages',
  message: 'Hi, I\'m interested in learning more about your monthly membership packages. Do you offer corporate rates?',
  expiresInHours: 24,
  expiresInMinutes: 60,
  notes: 'First-time customer, prefers afternoon appointments',
};

@ApiTags('Email Admin')
@Controller('admin/emails')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@ApiBearerAuth()
export class EmailAdminController {
  constructor(
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
  ) {}

  // ============================================================================
  // EMAIL LOGS & STATISTICS
  // ============================================================================

  @Get('stats')
  @ApiOperation({ summary: 'Get email statistics' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Email statistics retrieved' })
  async getEmailStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.mailService.getEmailStats(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get email logs with filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['SENT', 'FAILED', 'PENDING'] })
  @ApiQuery({ name: 'template', required: false, type: String })
  @ApiQuery({ name: 'email', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Email logs retrieved' })
  async getEmailLogs(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: 'SENT' | 'FAILED' | 'PENDING',
    @Query('template') template?: string,
    @Query('email') email?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) where.status = status;
    if (template) where.template = template;
    if (email) where.to = { contains: email, mode: 'insensitive' };

    const [logs, total] = await Promise.all([
      this.prisma.emailLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.emailLog.count({ where }),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Get('logs/:id')
  @ApiOperation({ summary: 'Get email log details' })
  @ApiResponse({ status: 200, description: 'Email log details retrieved' })
  async getEmailLogById(@Param('id') id: string) {
    return this.prisma.emailLog.findUnique({ where: { id } });
  }

  // ============================================================================
  // BOUNCE & SUPPRESSION MANAGEMENT
  // ============================================================================

  @Get('bounces')
  @ApiOperation({ summary: 'Get bounced/suppressed email addresses' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Bounce list retrieved' })
  async getBouncedEmails(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const skip = (page - 1) * limit;
    const where = {
      OR: [
        { isSupressed: true },
        { bounceCount: { gt: 0 } },
        { complainedAt: { not: null } },
      ],
    };

    const [bounces, total] = await Promise.all([
      this.prisma.emailPreference.findMany({
        where,
        select: {
          id: true,
          email: true,
          bounceCount: true,
          bounceType: true,
          lastBounceAt: true,
          isSupressed: true,
          complainedAt: true,
          createdAt: true,
        },
        orderBy: { lastBounceAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.emailPreference.count({ where }),
    ]);

    return {
      data: bounces,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Get('events')
  @ApiOperation({ summary: 'Get email events (deliveries, bounces, complaints)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'eventType', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Events retrieved' })
  async getEmailEvents(
    @Query('page') page = 1,
    @Query('limit') limit = 50,
    @Query('eventType') eventType?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (eventType) where.eventType = eventType;

    const [events, total] = await Promise.all([
      this.prisma.emailEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.emailEvent.count({ where }),
    ]);

    return {
      data: events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Post('bounces/:id/unsuppress')
  @ApiOperation({ summary: 'Unsuppress a bounced email address' })
  @ApiResponse({ status: 200, description: 'Email unsuppressed' })
  async unsuppressEmail(@Param('id') id: string) {
    const updated = await this.prisma.emailPreference.update({
      where: { id },
      data: {
        isSupressed: false,
        bounceCount: 0,
        bounceType: null,
        lastBounceAt: null,
      },
    });

    return {
      success: true,
      message: `Email ${updated.email} has been unsuppressed`,
    };
  }

  // ============================================================================
  // TEMPLATE PREVIEWS
  // ============================================================================

  @Get('templates')
  @ApiOperation({ summary: 'List all available email templates' })
  @ApiResponse({ status: 200, description: 'Template list retrieved' })
  listTemplates() {
    return {
      templates: [
        { id: 'welcome', name: 'Welcome Email', category: 'auth' },
        { id: 'verification', name: 'Email Verification', category: 'auth' },
        { id: 'password-reset', name: 'Password Reset', category: 'auth' },
        { id: 'magic-link', name: 'Magic Link', category: 'auth' },
        { id: 'appointment-confirmation', name: 'Appointment Confirmation', category: 'appointment' },
        { id: 'appointment-request', name: 'Appointment Request', category: 'appointment' },
        { id: 'appointment-cancellation', name: 'Appointment Cancellation', category: 'appointment' },
        { id: 'appointment-reminder', name: 'Appointment Reminder', category: 'appointment' },
        { id: 'appointment-status', name: 'Appointment Status', category: 'appointment' },
        { id: 'review-notification', name: 'Review Notification', category: 'business' },
        { id: 'verification-status', name: 'Verification Status', category: 'business' },
        { id: 'team-invitation', name: 'Team Invitation', category: 'business' },
        { id: 'contact-notification', name: 'Contact Notification', category: 'business' },
        { id: 'weekly-digest', name: 'Weekly Digest', category: 'business' },
        { id: 'account-security', name: 'Account Security', category: 'account' },
        { id: 'promotional', name: 'Promotional', category: 'marketing' },
      ],
    };
  }

  @Get('templates/:templateId/preview')
  @ApiOperation({ summary: 'Preview an email template with sample data' })
  @ApiResponse({ status: 200, description: 'Template preview HTML' })
  previewTemplate(@Param('templateId') templateId: string) {
    const templates: Record<string, () => string> = {
      'welcome': () => welcomeEmailTemplate({ firstName: sampleData.firstName, appUrl: sampleData.appUrl }),
      'verification': () => verificationEmailTemplate({ firstName: sampleData.firstName, verificationUrl: sampleData.verificationUrl, expiresInHours: sampleData.expiresInHours }),
      'password-reset': () => passwordResetEmailTemplate({ firstName: sampleData.firstName, resetUrl: sampleData.resetUrl, expiresInMinutes: sampleData.expiresInMinutes }),
      'magic-link': () => magicLinkEmailTemplate({ firstName: sampleData.firstName, magicLinkUrl: sampleData.magicLinkUrl, expiresInMinutes: 15 }),
      'appointment-confirmation': () => appointmentConfirmationTemplate({
        firstName: sampleData.firstName,
        businessName: sampleData.businessName,
        serviceName: sampleData.serviceName,
        appointmentDate: sampleData.appointmentDate,
        appointmentTime: sampleData.appointmentTime,
        businessAddress: sampleData.businessAddress,
        businessPhone: sampleData.businessPhone,
      }),
      'appointment-request': () => appointmentRequestTemplate({
        businessOwnerName: sampleData.businessOwnerName,
        businessName: sampleData.businessName,
        customerName: sampleData.customerName,
        serviceName: sampleData.serviceName,
        appointmentDate: sampleData.appointmentDate,
        notes: sampleData.notes,
        dashboardUrl: sampleData.dashboardUrl,
      }),
      'appointment-cancellation': () => appointmentCancellationTemplate({
        firstName: sampleData.firstName,
        businessName: sampleData.businessName,
        serviceName: sampleData.serviceName,
        appointmentDate: sampleData.appointmentDate,
        canceledBy: 'business',
        reason: 'Due to unforeseen circumstances, we need to reschedule your appointment.',
        rebookUrl: sampleData.rebookUrl,
      }),
      'appointment-reminder': () => appointmentReminderTemplate({
        firstName: sampleData.firstName,
        businessName: sampleData.businessName,
        serviceName: sampleData.serviceName,
        appointmentDate: sampleData.appointmentDate,
        businessAddress: sampleData.businessAddress,
        businessPhone: sampleData.businessPhone,
        appointmentUrl: sampleData.appointmentUrl,
      }),
      'appointment-status': () => appointmentStatusTemplate({
        firstName: sampleData.firstName,
        businessName: sampleData.businessName,
        serviceName: sampleData.serviceName,
        appointmentDate: sampleData.appointmentDate,
        status: 'CONFIRMED',
        reviewUrl: sampleData.reviewUrl,
      }),
      'review-notification': () => reviewNotificationTemplate({
        businessOwnerName: sampleData.businessOwnerName,
        businessName: sampleData.businessName,
        reviewerName: sampleData.reviewerName,
        rating: sampleData.rating,
        reviewText: sampleData.reviewText,
        reviewUrl: sampleData.reviewUrl,
      }),
      'verification-status': () => verificationStatusTemplate({
        businessOwnerName: sampleData.businessOwnerName,
        businessName: sampleData.businessName,
        status: 'approved',
        dashboardUrl: sampleData.dashboardUrl,
      }),
      'team-invitation': () => teamInvitationTemplate({
        inviteeName: sampleData.inviteeName,
        businessName: sampleData.businessName,
        inviterName: sampleData.inviterName,
        role: sampleData.role,
        permissions: sampleData.permissions,
        acceptUrl: sampleData.acceptUrl,
      }),
      'contact-notification': () => contactNotificationTemplate({
        businessOwnerName: sampleData.businessOwnerName,
        businessName: sampleData.businessName,
        senderName: sampleData.senderName,
        senderEmail: sampleData.senderEmail,
        senderPhone: sampleData.senderPhone,
        subject: sampleData.subject,
        message: sampleData.message,
        dashboardUrl: sampleData.dashboardUrl,
      }),
      'weekly-digest': () => weeklyDigestTemplate({
        businessOwnerName: sampleData.businessOwnerName,
        businessName: sampleData.businessName,
        weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        weekEnd: new Date(),
        stats: {
          newAppointments: 12,
          completedAppointments: 8,
          cancelledAppointments: 1,
          newReviews: 3,
          averageRating: 4.7,
          profileViews: 156,
          newMessages: 5,
        },
        topReview: {
          reviewerName: sampleData.reviewerName,
          rating: sampleData.rating,
          text: sampleData.reviewText,
        },
        dashboardUrl: sampleData.dashboardUrl,
      }),
      'account-security': () => accountSecurityTemplate({
        firstName: sampleData.firstName,
        eventType: 'password_changed',
        timestamp: new Date(),
        ipAddress: '192.168.1.100',
        location: 'Dubai, UAE',
        device: 'Chrome on macOS',
        securityUrl: 'https://tarsit.com/settings/security',
      }),
      'promotional': () => promotionalEmailTemplate({
        recipientName: sampleData.firstName,
        businessName: sampleData.businessName,
        promotionType: 'offer',
        title: '25% Off All Spa Treatments!',
        subtitle: 'Limited time offer for our valued customers',
        bodyContent: 'Treat yourself to our luxurious spa treatments at a special discount. This exclusive offer is our way of saying thank you for being a loyal customer. Book now and experience pure relaxation.',
        ctaText: 'Book Now',
        ctaUrl: 'https://tarsit.com/book',
        discountCode: 'RELAX25',
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        unsubscribeUrl: 'https://tarsit.com/unsubscribe',
      }),
    };

    const templateFn = templates[templateId];
    if (!templateFn) {
      return { error: 'Template not found', availableTemplates: Object.keys(templates) };
    }

    return {
      templateId,
      html: templateFn(),
    };
  }

  // ============================================================================
  // SEND TEST EMAILS
  // ============================================================================

  @Post('test')
  @ApiOperation({ summary: 'Send a test email' })
  @ApiResponse({ status: 200, description: 'Test email sent' })
  async sendTestEmail(
    @Body() body: { templateId: string; email: string },
  ) {
    const { templateId, email } = body;

    // Use welcome template for simplicity in test
    const success = await this.mailService.sendWelcomeEmail(email, 'Test User');

    return {
      success,
      message: success ? `Test email sent to ${email}` : 'Failed to send test email',
    };
  }

  // ============================================================================
  // RESEND FAILED EMAILS
  // ============================================================================

  @Post('logs/:id/resend')
  @ApiOperation({ summary: 'Resend a failed email' })
  @ApiResponse({ status: 200, description: 'Email resent' })
  async resendEmail(@Param('id') id: string) {
    const log = await this.prisma.emailLog.findUnique({ where: { id } });

    if (!log) {
      return { success: false, message: 'Email log not found' };
    }

    if (log.status === 'SENT') {
      return { success: false, message: 'Email was already sent successfully' };
    }

    // For now, we can only resend welcome emails easily
    // In a full implementation, we'd need to store the full email data
    return {
      success: false,
      message: 'Resend functionality requires storing full email data. Please send a new email manually.',
    };
  }
}
