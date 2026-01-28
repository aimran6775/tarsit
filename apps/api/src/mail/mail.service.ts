import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

// Import all email templates
import {
  // Auth templates
  welcomeEmailTemplate,
  welcomeEmailSubject,
  magicLinkEmailTemplate,
  magicLinkEmailSubject,
  passwordResetEmailTemplate,
  passwordResetEmailSubject,
  verificationEmailTemplate,
  verificationEmailSubject,
  // Appointment templates
  appointmentConfirmationTemplate,
  appointmentConfirmationSubject,
  appointmentRequestTemplate,
  appointmentRequestSubject,
  appointmentCancellationTemplate,
  appointmentCancellationSubject,
  appointmentReminderTemplate,
  appointmentReminderSubject,
  appointmentStatusTemplate,
  appointmentStatusSubject,
  // Business templates
  reviewNotificationTemplate,
  reviewNotificationSubject,
  verificationStatusTemplate,
  verificationStatusSubject,
  teamInvitationTemplate,
  teamInvitationSubject,
} from './templates';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
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

  constructor(private configService: ConfigService) {
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

  private async sendMail(options: EmailOptions): Promise<boolean> {
    try {
      if (this.provider === 'resend' && this.resend) {
        const { error } = await this.resend.emails.send({
          from: this.fromEmail,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
        });

        if (error) {
          this.logger.error(`Resend email error: ${error.message}`, error);
          return false;
        }
        
        this.logger.log(`Email sent via Resend to: ${options.to}`);
        return true;
      } else if (this.transporter) {
        await this.transporter.sendMail({
          from: this.fromEmail,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
        });
        
        this.logger.log(`Email sent via Nodemailer to: ${options.to}`);
        return true;
      } else {
        this.logger.warn(`Email not sent (no provider): ${options.subject} to ${options.to}`);
        return false;
      }
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      return false;
    }
  }

  // ============================================================================
  // AUTH EMAILS
  // ============================================================================

  async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    return this.sendMail({
      to: email,
      subject: welcomeEmailSubject,
      html: welcomeEmailTemplate({ firstName, appUrl: this.frontendUrl }),
    });
  }

  async sendVerificationEmail(email: string, firstName: string, token: string): Promise<boolean> {
    const verificationUrl = `${this.frontendUrl}/verify-email?token=${token}`;
    return this.sendMail({
      to: email,
      subject: verificationEmailSubject,
      html: verificationEmailTemplate({ firstName, verificationUrl, expiresInHours: 24 }),
    });
  }

  async sendPasswordResetEmail(email: string, firstName: string, token: string): Promise<boolean> {
    const resetUrl = `${this.frontendUrl}/auth/reset-password?token=${token}`;
    return this.sendMail({
      to: email,
      subject: passwordResetEmailSubject,
      html: passwordResetEmailTemplate({ firstName, resetUrl, expiresInMinutes: 60 }),
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
}
