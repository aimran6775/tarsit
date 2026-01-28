import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

// Import email templates
import {
  welcomeEmailTemplate,
  welcomeEmailSubject,
  magicLinkEmailTemplate,
  magicLinkEmailSubject,
  passwordResetEmailTemplate,
  passwordResetEmailSubject,
  verificationEmailTemplate,
  verificationEmailSubject,
  appointmentConfirmationTemplate,
  appointmentConfirmationSubject,
  reviewNotificationTemplate,
  reviewNotificationSubject,
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
    // Determine email provider based on available config
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    const mailUser = this.configService.get<string>('MAIL_USER');
    
    this.fromEmail = this.configService.get<string>('MAIL_FROM', 'Tarsit <noreply@tarsit.com>');
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');

    if (resendApiKey) {
      // Use Resend (preferred)
      this.resend = new Resend(resendApiKey);
      this.provider = 'resend';
      this.logger.log('Email service initialized with Resend');
    } else if (mailUser) {
      // Fallback to nodemailer SMTP
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
        this.logger.warn(`Email not sent (no provider configured): ${options.subject} to ${options.to}`);
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
    const html = welcomeEmailTemplate({
      firstName,
      appUrl: this.frontendUrl,
    });

    return this.sendMail({
      to: email,
      subject: welcomeEmailSubject,
      html,
    });
  }

  async sendVerificationEmail(email: string, firstName: string, token: string): Promise<boolean> {
    const verificationUrl = `${this.frontendUrl}/verify-email?token=${token}`;
    
    const html = verificationEmailTemplate({
      firstName,
      verificationUrl,
      expiresInHours: 24,
    });

    return this.sendMail({
      to: email,
      subject: verificationEmailSubject,
      html,
    });
  }

  async sendPasswordResetEmail(email: string, firstName: string, token: string): Promise<boolean> {
    const resetUrl = `${this.frontendUrl}/auth/reset-password?token=${token}`;
    
    const html = passwordResetEmailTemplate({
      firstName,
      resetUrl,
      expiresInMinutes: 60,
    });

    return this.sendMail({
      to: email,
      subject: passwordResetEmailSubject,
      html,
    });
  }

  async sendMagicLinkEmail(
    email: string,
    firstName: string,
    token: string,
    redirectUrl?: string,
  ): Promise<boolean> {
    const baseUrl = this.frontendUrl;
    const magicLinkUrl = `${baseUrl}/auth/magic-link?token=${token}${redirectUrl ? `&redirect=${encodeURIComponent(redirectUrl)}` : ''}`;

    const html = magicLinkEmailTemplate({
      firstName,
      magicLinkUrl,
      expiresInMinutes: 15,
    });

    return this.sendMail({
      to: email,
      subject: magicLinkEmailSubject,
      html,
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
    const html = appointmentConfirmationTemplate({
      firstName,
      businessName,
      serviceName,
      appointmentDate,
      appointmentTime: appointmentDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      businessAddress: businessAddress || 'Address will be provided',
      businessPhone,
    });

    return this.sendMail({
      to: email,
      subject: appointmentConfirmationSubject(businessName),
      html,
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
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Using a simple inline template for this one
    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4F46E5;">New Appointment Request 📅</h1>
          <p>Hi ${businessOwnerName},</p>
          <p>You have a new appointment request for <strong>${businessName}</strong>:</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Customer:</strong> ${customerName}</p>
            <p><strong>Service:</strong> ${serviceName}</p>
            <p><strong>Requested Time:</strong> ${formattedDate}</p>
            ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
          </div>
          <a href="${this.frontendUrl}/dashboard/appointments" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
            View & Respond
          </a>
          <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
            &copy; ${new Date().getFullYear()} Tarsit. All rights reserved.
          </p>
        </body>
      </html>
    `;

    return this.sendMail({
      to: businessEmail,
      subject: `New Appointment Request - ${customerName}`,
      html,
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
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #EF4444;">Appointment Cancelled ❌</h1>
          <p>Hi ${firstName},</p>
          <p>Your appointment with <strong>${businessName}</strong> has been cancelled ${canceledBy === 'business' ? 'by the business' : ''}.</p>
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
            <p><strong>Service:</strong> ${serviceName}</p>
            <p><strong>Originally Scheduled:</strong> ${formattedDate}</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          </div>
          <a href="${this.frontendUrl}/businesses" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
            Book Another Appointment
          </a>
          <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
            &copy; ${new Date().getFullYear()} Tarsit. All rights reserved.
          </p>
        </body>
      </html>
    `;

    return this.sendMail({
      to: email,
      subject: `Appointment Cancelled - ${businessName}`,
      html,
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
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4F46E5;">Appointment Reminder ⏰</h1>
          <p>Hi ${firstName},</p>
          <p>This is a reminder about your upcoming appointment:</p>
          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <p><strong>Business:</strong> ${businessName}</p>
            <p><strong>Service:</strong> ${serviceName}</p>
            <p><strong>When:</strong> ${formattedDate}</p>
            <p><strong>Where:</strong> ${businessAddress}</p>
          </div>
          <p style="color: #6b7280;">Need to reschedule? Visit your dashboard to manage your appointments.</p>
          <a href="${this.frontendUrl}/appointments" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
            View Appointment
          </a>
          <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
            &copy; ${new Date().getFullYear()} Tarsit. All rights reserved.
          </p>
        </body>
      </html>
    `;

    return this.sendMail({
      to: email,
      subject: `Reminder: Appointment Tomorrow with ${businessName}`,
      html,
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
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const statusEmoji = status === 'CONFIRMED' ? '✅' : '🎉';
    const statusText = status === 'CONFIRMED' ? 'has been confirmed' : 'is now complete';

    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #10B981;">Appointment ${status === 'CONFIRMED' ? 'Confirmed' : 'Completed'} ${statusEmoji}</h1>
          <p>Hi ${firstName},</p>
          <p>Your appointment with <strong>${businessName}</strong> ${statusText}!</p>
          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
            <p><strong>Service:</strong> ${serviceName}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
          </div>
          ${status === 'COMPLETED' ? `
            <p>We hope you had a great experience! Would you mind leaving a review?</p>
            <a href="${this.frontendUrl}/businesses" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
              Leave a Review
            </a>
          ` : ''}
          <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
            &copy; ${new Date().getFullYear()} Tarsit. All rights reserved.
          </p>
        </body>
      </html>
    `;

    return this.sendMail({
      to: email,
      subject: `Appointment ${status === 'CONFIRMED' ? 'Confirmed' : 'Completed'} - ${businessName}`,
      html,
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
    const html = reviewNotificationTemplate({
      businessOwnerName,
      businessName,
      reviewerName,
      rating,
      reviewText,
      reviewUrl: `${this.frontendUrl}/dashboard/reviews`,
    });

    return this.sendMail({
      to: email,
      subject: reviewNotificationSubject(rating),
      html,
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
    const isApproved = status === 'approved';

    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: ${isApproved ? '#10B981' : '#EF4444'};">
            Business Verification ${isApproved ? 'Approved ✅' : 'Update Required ⚠️'}
          </h1>
          <p>Hi ${businessOwnerName},</p>
          ${isApproved ? `
            <p>Great news! Your business <strong>${businessName}</strong> has been verified!</p>
            <p>Your business will now show a verified badge and appear higher in search results.</p>
          ` : `
            <p>We've reviewed your verification request for <strong>${businessName}</strong> and need some additional information.</p>
            ${adminNotes ? `<div style="background: #fef2f2; padding: 16px; border-radius: 8px; margin: 16px 0;"><strong>Notes:</strong> ${adminNotes}</div>` : ''}
            <p>Please update your business information and resubmit for verification.</p>
          `}
          <a href="${this.frontendUrl}/dashboard" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">
            Go to Dashboard
          </a>
          <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
            &copy; ${new Date().getFullYear()} Tarsit. All rights reserved.
          </p>
        </body>
      </html>
    `;

    return this.sendMail({
      to: email,
      subject: `Business Verification ${isApproved ? 'Approved' : 'Update Required'} - ${businessName}`,
      html,
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
    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4F46E5;">You're Invited to Join ${businessName}! 🎉</h1>
          <p>Hi ${inviteeName || 'there'},</p>
          <p><strong>${inviterName}</strong> has invited you to join the team at <strong>${businessName}</strong> on Tarsit.</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Role:</strong> ${role}</p>
            <p><strong>Permissions:</strong></p>
            <ul>
              ${permissions.map(p => `<li>${p}</li>`).join('')}
            </ul>
          </div>
          <a href="${this.frontendUrl}/auth/signup" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
            Accept Invitation
          </a>
          <p style="color: #6b7280; margin-top: 20px;">This invitation will expire in 7 days.</p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
            &copy; ${new Date().getFullYear()} Tarsit. All rights reserved.
          </p>
        </body>
      </html>
    `;

    return this.sendMail({
      to: email,
      subject: `You're invited to join ${businessName} on Tarsit`,
      html,
    });
  }
}
