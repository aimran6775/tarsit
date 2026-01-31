import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { Resend } from 'resend';

// Import all email templates
import { PrismaService } from '../prisma/prisma.service';
import { EmailCategory, EmailPreferencesService } from './email-preferences.service';
import {
    accountSecuritySubject,
    // Account templates
    accountSecurityTemplate,
    appointmentCancellationSubject,
    appointmentCancellationTemplate,
    appointmentConfirmationSubject,
    // Appointment templates
    appointmentConfirmationTemplate,
    appointmentReminderSubject,
    appointmentReminderTemplate,
    appointmentRequestSubject,
    appointmentRequestTemplate,
    appointmentStatusSubject,
    appointmentStatusTemplate,
    contactNotificationSubject,
    // Business templates
    contactNotificationTemplate,
    magicLinkEmailSubject,
    magicLinkEmailTemplate,
    passwordResetEmailSubject,
    passwordResetEmailTemplate,
    // Promotional templates
    promotionalEmailSubject,
    promotionalEmailTemplate,
    PromotionType,
    reviewNotificationSubject,
    reviewNotificationTemplate,
    SecurityEventType,
    teamInvitationSubject,
    teamInvitationTemplate,
    verificationEmailSubject,
    verificationEmailTemplate,
    verificationStatusSubject,
    verificationStatusTemplate,
    WeeklyDigestStats,
    weeklyDigestSubject,
    weeklyDigestTemplate,
    welcomeEmailSubject,
    // Auth templates
    welcomeEmailTemplate,
} from './templates';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  category?: EmailCategory;
  headers?: Record<string, string>;
}

type EmailProvider = 'resend' | 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend | null = null;
  private transporter: Transporter | null = null;
  private provider: EmailProvider;
  private fromEmail: string;
  private frontendUrl: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private emailPreferences: EmailPreferencesService,
  ) {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    const mailUser = this.configService.get<string>('MAIL_USER');
    
    this.fromEmail = this.configService.get<string>('MAIL_FROM', 'Tarsit <noreply@tarsit.com>');
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');

    if (resendApiKey) {
      this.resend = new Resend(resendApiKey);
      this.provider = 'resend';
      this.logger.log('Email service initialized with Resend');
    } else if (mailUser) {
      this.transporter = nodemailer.createTransport({
        host: this.configService.get<string>('MAIL_HOST', 'smtp.gmail.com'),
        port: this.configService.get<number>('MAIL_PORT', 587),
        secure: false,
        auth: {
          user: mailUser,
          pass: this.configService.get<string>('MAIL_PASSWORD'),
        },
      });
      this.provider = 'nodemailer';
      this.logger.log('Email service initialized with Nodemailer SMTP');
    } else {
      this.provider = 'nodemailer';
      this.logger.warn('No email provider configured! Emails will not be sent.');
    }
  }

  private async sendMail(
    options: EmailOptions & { template?: string; userId?: string },
  ): Promise<boolean> {
    let success = false;
    let errorMessage: string | undefined;

    // Check email preferences if category is specified
    if (options.category) {
      const canSend = await this.emailPreferences.canSendEmail(options.to, options.category);
      if (!canSend) {
        this.logger.log(`Email blocked by preferences: ${options.category} to ${options.to}`);
        // Log as skipped, not failed
        try {
          await this.prisma.emailLog.create({
            data: {
              to: options.to,
              subject: options.subject,
              template: options.template || 'unknown',
              status: 'PENDING', // Using PENDING to indicate skipped
              error: 'Blocked by user preferences',
              userId: options.userId,
            },
          });
        } catch (e) { /* ignore */ }
        return false;
      }
    }

    // Generate unsubscribe URL for non-transactional emails
    let unsubscribeUrl: string | undefined;
    if (options.category && options.category !== 'transactional' && options.category !== 'security') {
      unsubscribeUrl = await this.emailPreferences.getUnsubscribeUrl(options.to, options.category);
    }

    // Prepare headers with List-Unsubscribe for marketing emails
    const headers: Record<string, string> = {
      ...options.headers,
    };
    if (unsubscribeUrl) {
      headers['List-Unsubscribe'] = `<${unsubscribeUrl}>`;
      headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
    }

    try {
      if (this.provider === 'resend' && this.resend) {
        const { error } = await this.resend.emails.send({
          from: this.fromEmail,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
          headers: Object.keys(headers).length > 0 ? headers : undefined,
        });

        if (error) {
          this.logger.error(`Resend email error: ${error.message}`, error);
          errorMessage = error.message;
        } else {
          this.logger.log(`Email sent via Resend to: ${options.to}`);
          success = true;
        }
      } else if (this.transporter) {
        await this.transporter.sendMail({
          from: this.fromEmail,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
        });
        
        this.logger.log(`Email sent via Nodemailer to: ${options.to}`);
        success = true;
      } else {
        this.logger.warn(`Email not sent (no provider): ${options.subject} to ${options.to}`);
        errorMessage = 'No email provider configured';
      }
    } catch (error: any) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      errorMessage = error?.message || String(error);
    }

    // Log email to database
    try {
      await this.prisma.emailLog.create({
        data: {
          to: options.to,
          subject: options.subject,
          template: options.template || 'unknown',
          status: success ? 'SENT' : 'FAILED',
          error: errorMessage,
          sentAt: success ? new Date() : null,
          userId: options.userId,
        },
      });
    } catch (logError: any) {
      this.logger.warn(`Failed to log email: ${logError?.message || logError}`);
    }

    return success;
  }

  // ============================================================================
  // AUTH EMAILS
  // ============================================================================

  async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    return this.sendMail({
      to: email,
      subject: welcomeEmailSubject,
      html: welcomeEmailTemplate({ firstName, appUrl: this.frontendUrl }),
      template: 'welcome',
    });
  }

  async sendVerificationEmail(email: string, firstName: string, token: string): Promise<boolean> {
    const verificationUrl = `${this.frontendUrl}/verify-email?token=${token}`;
    return this.sendMail({
      to: email,
      subject: verificationEmailSubject,
      html: verificationEmailTemplate({ firstName, verificationUrl, expiresInHours: 24 }),
      template: 'verification',
    });
  }

  async sendPasswordResetEmail(email: string, firstName: string, token: string): Promise<boolean> {
    const resetUrl = `${this.frontendUrl}/auth/reset-password?token=${token}`;
    return this.sendMail({
      to: email,
      subject: passwordResetEmailSubject,
      html: passwordResetEmailTemplate({ firstName, resetUrl, expiresInMinutes: 60 }),
      template: 'password-reset',
    });
  }

  async sendMagicLinkEmail(
    email: string,
    firstName: string,
    token: string,
    redirectUrl?: string,
  ): Promise<boolean> {
    const magicLinkUrl = `${this.frontendUrl}/auth/magic-link?token=${token}${redirectUrl ? `&redirect=${encodeURIComponent(redirectUrl)}` : ''}`;
    return this.sendMail({
      to: email,
      subject: magicLinkEmailSubject,
      html: magicLinkEmailTemplate({ firstName, magicLinkUrl, expiresInMinutes: 15 }),
      template: 'magic-link',
    });
  }

  // ============================================================================
  // APPOINTMENT EMAILS
  // ============================================================================

  async sendAppointmentConfirmation(
    email: string,
    firstName: string,
    businessName: string,
    appointmentDate: Date,
    serviceName: string,
    businessAddress?: string,
    businessPhone?: string,
  ): Promise<boolean> {
    return this.sendMail({
      to: email,
      subject: appointmentConfirmationSubject(businessName),
      html: appointmentConfirmationTemplate({
        firstName,
        businessName,
        serviceName,
        appointmentDate,
        appointmentTime: appointmentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        businessAddress: businessAddress || 'Address will be provided',
        businessPhone,
      }),
    });
  }

  async sendAppointmentRequestToBusiness(
    businessEmail: string,
    businessOwnerName: string,
    businessName: string,
    customerName: string,
    appointmentDate: Date,
    serviceName: string,
    notes?: string,
  ): Promise<boolean> {
    return this.sendMail({
      to: businessEmail,
      subject: appointmentRequestSubject(customerName),
      html: appointmentRequestTemplate({
        businessOwnerName,
        businessName,
        customerName,
        serviceName,
        appointmentDate,
        notes,
        dashboardUrl: `${this.frontendUrl}/dashboard/appointments`,
      }),
    });
  }

  async sendAppointmentCancellation(
    email: string,
    firstName: string,
    businessName: string,
    appointmentDate: Date,
    serviceName: string,
    canceledBy: 'customer' | 'business',
    reason?: string,
  ): Promise<boolean> {
    return this.sendMail({
      to: email,
      subject: appointmentCancellationSubject(businessName),
      html: appointmentCancellationTemplate({
        firstName,
        businessName,
        serviceName,
        appointmentDate,
        canceledBy,
        reason,
        rebookUrl: `${this.frontendUrl}/businesses`,
      }),
    });
  }

  async sendAppointmentReminder(
    email: string,
    firstName: string,
    businessName: string,
    businessAddress: string,
    appointmentDate: Date,
    serviceName: string,
  ): Promise<boolean> {
    return this.sendMail({
      to: email,
      subject: appointmentReminderSubject(businessName),
      html: appointmentReminderTemplate({
        firstName,
        businessName,
        serviceName,
        appointmentDate,
        businessAddress,
        appointmentUrl: `${this.frontendUrl}/appointments`,
      }),
      template: 'appointment-reminder',
      category: 'appointment-reminder',
    });
  }

  async sendAppointmentStatusUpdate(
    email: string,
    firstName: string,
    businessName: string,
    appointmentDate: Date,
    serviceName: string,
    status: 'CONFIRMED' | 'COMPLETED',
  ): Promise<boolean> {
    return this.sendMail({
      to: email,
      subject: appointmentStatusSubject(businessName, status),
      html: appointmentStatusTemplate({
        firstName,
        businessName,
        serviceName,
        appointmentDate,
        status,
        reviewUrl: status === 'COMPLETED' ? `${this.frontendUrl}/businesses` : undefined,
      }),
      template: 'appointment-status',
      category: 'appointment-update',
    });
  }

  // ============================================================================
  // REVIEW EMAILS
  // ============================================================================

  async sendReviewNotification(
    email: string,
    businessOwnerName: string,
    businessName: string,
    reviewerName: string,
    rating: number,
    reviewText?: string,
  ): Promise<boolean> {
    return this.sendMail({
      to: email,
      subject: reviewNotificationSubject(rating),
      html: reviewNotificationTemplate({
        businessOwnerName,
        businessName,
        reviewerName,
        rating,
        reviewText,
        reviewUrl: `${this.frontendUrl}/dashboard/reviews`,
      }),
      template: 'review-notification',
      category: 'review-notification',
    });
  }

  // ============================================================================
  // BUSINESS VERIFICATION EMAILS
  // ============================================================================

  async sendVerificationStatusEmail(
    email: string,
    businessOwnerName: string,
    businessName: string,
    status: 'approved' | 'rejected',
    adminNotes?: string,
  ): Promise<boolean> {
    return this.sendMail({
      to: email,
      subject: verificationStatusSubject(businessName, status),
      html: verificationStatusTemplate({
        businessOwnerName,
        businessName,
        status,
        adminNotes,
        dashboardUrl: `${this.frontendUrl}/dashboard`,
      }),
    });
  }

  // ============================================================================
  // TEAM INVITATION EMAILS
  // ============================================================================

  async sendTeamInvitation(
    email: string,
    inviteeName: string,
    businessName: string,
    inviterName: string,
    role: string,
    permissions: string[],
  ): Promise<boolean> {
    return this.sendMail({
      to: email,
      subject: teamInvitationSubject(businessName),
      html: teamInvitationTemplate({
        inviteeName,
        businessName,
        inviterName,
        role,
        permissions,
        acceptUrl: `${this.frontendUrl}/auth/signup`,
      }),
    });
  }

  // ============================================================================
  // CONTACT FORM EMAILS
  // ============================================================================

  async sendContactNotification(
    email: string,
    businessOwnerName: string,
    businessName: string,
    senderName: string,
    senderEmail: string,
    subject: string,
    message: string,
    senderPhone?: string,
  ): Promise<boolean> {
    return this.sendMail({
      to: email,
      subject: contactNotificationSubject(senderName),
      html: contactNotificationTemplate({
        businessOwnerName,
        businessName,
        senderName,
        senderEmail,
        senderPhone,
        subject,
        message,
        dashboardUrl: `${this.frontendUrl}/dashboard/messages`,
      }),
    });
  }

  // ============================================================================
  // WEEKLY DIGEST EMAILS
  // ============================================================================

  async sendWeeklyDigest(
    email: string,
    businessOwnerName: string,
    businessName: string,
    weekStart: Date,
    weekEnd: Date,
    stats: WeeklyDigestStats,
    topReview?: { reviewerName: string; rating: number; text: string },
  ): Promise<boolean> {
    return this.sendMail({
      to: email,
      subject: weeklyDigestSubject(businessName),
      html: weeklyDigestTemplate({
        businessOwnerName,
        businessName,
        weekStart,
        weekEnd,
        stats,
        topReview,
        dashboardUrl: `${this.frontendUrl}/dashboard/analytics`,
      }),
      template: 'weekly-digest',
      category: 'weekly-digest',
    });
  }

  // ============================================================================
  // ACCOUNT SECURITY EMAILS
  // ============================================================================

  async sendAccountSecurityAlert(
    email: string,
    firstName: string,
    eventType: SecurityEventType,
    timestamp: Date,
    ipAddress?: string,
    location?: string,
    device?: string,
  ): Promise<boolean> {
    return this.sendMail({
      to: email,
      subject: accountSecuritySubject(eventType),
      html: accountSecurityTemplate({
        firstName,
        eventType,
        timestamp,
        ipAddress,
        location,
        device,
        securityUrl: `${this.frontendUrl}/settings/security`,
      }),
      template: 'account-security',
      category: 'security', // Always sent, never blocked
    });
  }

  // ============================================================================
  // PROMOTIONAL EMAILS
  // ============================================================================

  async sendPromotionalEmail(
    email: string,
    recipientName: string,
    businessName: string,
    promotionType: PromotionType,
    title: string,
    bodyContent: string,
    ctaText: string,
    ctaUrl: string,
    options?: {
      subtitle?: string;
      businessLogo?: string;
      imageUrl?: string;
      discountCode?: string;
      expiresAt?: Date;
    },
  ): Promise<boolean> {
    // Get proper unsubscribe URL from preferences service
    const unsubscribeUrl = await this.emailPreferences.getUnsubscribeUrl(email, 'promotional');
    
    return this.sendMail({
      to: email,
      subject: promotionalEmailSubject(businessName, title),
      html: promotionalEmailTemplate({
        recipientName,
        businessName,
        businessLogo: options?.businessLogo,
        promotionType,
        title,
        subtitle: options?.subtitle,
        bodyContent,
        ctaText,
        ctaUrl,
        expiresAt: options?.expiresAt,
        discountCode: options?.discountCode,
        imageUrl: options?.imageUrl,
        unsubscribeUrl,
      }),
      template: 'promotional',
      category: 'promotional',
    });
  }

  // ============================================================================
  // EMAIL ANALYTICS
  // ============================================================================

  async getEmailStats(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [total, sent, failed, byTemplate, suppressed, bounced, complaints] = await Promise.all([
      this.prisma.emailLog.count({ where }),
      this.prisma.emailLog.count({ where: { ...where, status: 'SENT' } }),
      this.prisma.emailLog.count({ where: { ...where, status: 'FAILED' } }),
      this.prisma.emailLog.groupBy({
        by: ['template'],
        where,
        _count: true,
      }),
      this.prisma.emailPreference.count({ where: { isSupressed: true } }),
      this.prisma.emailPreference.count({ where: { bounceCount: { gt: 0 } } }),
      this.prisma.emailPreference.count({ where: { complainedAt: { not: null } } }),
    ]);

    return {
      total,
      sent,
      failed,
      successRate: total > 0 ? ((sent / total) * 100).toFixed(2) : '0',
      deliverability: {
        suppressed,
        bounced,
        complaints,
      },
      byTemplate: byTemplate.map((t) => ({
        template: t.template,
        count: t._count,
      })),
    };
  }
}
