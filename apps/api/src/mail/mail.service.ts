import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class MailService {
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('MAIL_PORT', 587),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
    });
  }

  private async sendMail(options: EmailOptions): Promise<void> {
    const from = this.configService.get<string>('MAIL_FROM', '"Tarsit" <noreply@tarsit.com>');

    await this.transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const subject = 'Welcome to Tarsit!';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .button { background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Tarsit! 🎉</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <p>Thank you for joining Tarsit - Connecting Small Businesses to the World!</p>
              <p>We're excited to have you as part of our community. With Tarsit, you can:</p>
              <ul>
                <li>Discover local businesses near you</li>
                <li>Read and write reviews</li>
                <li>Book appointments</li>
                <li>Chat directly with business owners</li>
                <li>Save your favorite businesses</li>
              </ul>
              <p>Start exploring now and find the perfect businesses for your needs!</p>
              <a href="${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}" class="button">
                Explore Businesses
              </a>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Tarsit. All rights reserved.</p>
              <p>Connecting Small Businesses to the World</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendMail({ to: email, subject, html });
  }

  async sendVerificationEmail(email: string, firstName: string, token: string): Promise<void> {
    const verificationUrl = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/verify-email?token=${token}`;
    
    const subject = 'Verify Your Email - Tarsit';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .button { background-color: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .token { background-color: #f3f4f6; padding: 15px; border-radius: 5px; font-family: monospace; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verify Your Email ✉️</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
              <a href="${verificationUrl}" class="button">Verify Email</a>
              <p>Or copy and paste this link into your browser:</p>
              <div class="token">${verificationUrl}</div>
              <p><strong>This link will expire in 24 hours.</strong></p>
              <p>If you didn't create an account with Tarsit, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Tarsit. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendMail({ to: email, subject, html });
  }

  async sendPasswordResetEmail(email: string, firstName: string, token: string): Promise<void> {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token=${token}`;
    
    const subject = 'Reset Your Password - Tarsit';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #EF4444; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .button { background-color: #EF4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .warning { background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request 🔐</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <p>Or copy and paste this link into your browser:</p>
              <div class="token">${resetUrl}</div>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour for your security.
              </div>
              <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Tarsit. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendMail({ to: email, subject, html });
  }

  async sendAppointmentConfirmation(
    email: string,
    firstName: string,
    businessName: string,
    appointmentDate: Date,
    service: string,
  ): Promise<void> {
    const subject = `Appointment Confirmed with ${businessName}`;
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
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #10B981; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .appointment-details { background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; color: #4B5563; }
            .button { background-color: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Appointment Confirmed!</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <p>Your appointment has been confirmed!</p>
              <div class="appointment-details">
                <div class="detail-row">
                  <span class="label">Business:</span> ${businessName}
                </div>
                <div class="detail-row">
                  <span class="label">Service:</span> ${service}
                </div>
                <div class="detail-row">
                  <span class="label">Date & Time:</span> ${formattedDate}
                </div>
              </div>
              <p>We've notified ${businessName} and they're looking forward to seeing you!</p>
              <a href="${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/appointments" class="button">
                View My Appointments
              </a>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Tarsit. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendMail({ to: email, subject, html });
  }

  async sendReviewNotification(
    email: string,
    businessOwnerName: string,
    businessName: string,
    reviewerName: string,
    rating: number,
  ): Promise<void> {
    const subject = `New Review for ${businessName}`;
    const stars = '⭐'.repeat(rating);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #F59E0B; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .rating { font-size: 32px; margin: 20px 0; text-align: center; }
            .button { background-color: #F59E0B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌟 New Review Received!</h1>
            </div>
            <div class="content">
              <h2>Hi ${businessOwnerName},</h2>
              <p>Great news! ${reviewerName} just left a review for ${businessName}.</p>
              <div class="rating">${stars}</div>
              <p style="text-align: center; font-size: 20px;"><strong>${rating} out of 5 stars</strong></p>
              <p>Check your dashboard to read the full review and respond to your customer.</p>
              <a href="${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/dashboard/reviews" class="button">
                View Review
              </a>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Tarsit. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendMail({ to: email, subject, html });
  }

  async sendVerificationStatusEmail(
    email: string,
    businessOwnerName: string,
    businessName: string,
    status: 'approved' | 'rejected',
    adminNotes?: string,
  ): Promise<void> {
    const isApproved = status === 'approved';
    const subject = `Business Verification ${isApproved ? 'Approved' : 'Rejected'} - ${businessName}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: ${isApproved ? '#10B981' : '#EF4444'}; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .badge { background-color: ${isApproved ? '#D1FAE5' : '#FEE2E2'}; color: ${isApproved ? '#065F46' : '#991B1B'}; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 20px 0; font-weight: bold; }
            .notes { background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${isApproved ? '#10B981' : '#EF4444'}; }
            .button { background-color: ${isApproved ? '#10B981' : '#4F46E5'}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${isApproved ? '✅' : '❌'} Verification ${isApproved ? 'Approved' : 'Rejected'}</h1>
            </div>
            <div class="content">
              <h2>Hi ${businessOwnerName},</h2>
              ${isApproved 
                ? `
                  <p>Congratulations! Your business <strong>${businessName}</strong> has been successfully verified!</p>
                  <div class="badge">✓ Verified Business</div>
                  <p>Your business now displays a verified badge, which helps build trust with potential customers. Verified businesses typically receive:</p>
                  <ul>
                    <li>Higher search rankings</li>
                    <li>Increased customer trust</li>
                    <li>More appointment bookings</li>
                    <li>Better visibility in search results</li>
                  </ul>
                `
                : `
                  <p>We've reviewed your verification request for <strong>${businessName}</strong>, but we're unable to approve it at this time.</p>
                  <div class="badge">Verification Rejected</div>
                  <p>Don't worry! You can submit a new verification request with additional documentation.</p>
                `
              }
              ${adminNotes ? `
                <div class="notes">
                  <strong>${isApproved ? 'Admin Notes:' : 'Reason for Rejection:'}</strong>
                  <p>${adminNotes}</p>
                </div>
              ` : ''}
              <a href="${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/dashboard/business/${isApproved ? 'profile' : 'verification'}" class="button">
                ${isApproved ? 'View Your Business' : 'Submit New Request'}
              </a>
              ${!isApproved ? '<p>If you have questions about the rejection, please don\'t hesitate to contact our support team.</p>' : ''}
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Tarsit. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendMail({ to: email, subject, html });
  }

  // ============================================================================
  // APPOINTMENT EMAIL TEMPLATES
  // ============================================================================

  async sendAppointmentRequestToBusiness(
    businessEmail: string,
    businessOwnerName: string,
    businessName: string,
    customerName: string,
    appointmentDate: Date,
    serviceName: string,
    notes?: string,
  ): Promise<void> {
    const subject = `New Appointment Request - ${businessName}`;
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
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .appointment-details { background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; color: #4B5563; }
            .button { color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 5px; }
            .confirm-btn { background-color: #10B981; }
            .decline-btn { background-color: #EF4444; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📅 New Appointment Request</h1>
            </div>
            <div class="content">
              <h2>Hi ${businessOwnerName},</h2>
              <p>You have a new appointment request for ${businessName}!</p>
              <div class="appointment-details">
                <div class="detail-row">
                  <span class="label">Customer:</span> ${customerName}
                </div>
                <div class="detail-row">
                  <span class="label">Service:</span> ${serviceName}
                </div>
                <div class="detail-row">
                  <span class="label">Requested Date:</span> ${formattedDate}
                </div>
                ${notes ? `<div class="detail-row"><span class="label">Notes:</span> ${notes}</div>` : ''}
              </div>
              <p>Please confirm or decline this appointment:</p>
              <div style="text-align: center;">
                <a href="${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/dashboard/appointments" class="button confirm-btn">
                  View Appointments
                </a>
              </div>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Tarsit. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendMail({ to: businessEmail, subject, html });
  }

  async sendAppointmentCancellation(
    email: string,
    firstName: string,
    businessName: string,
    appointmentDate: Date,
    serviceName: string,
    canceledBy: 'customer' | 'business',
    reason?: string,
  ): Promise<void> {
    const subject = `Appointment Cancelled - ${businessName}`;
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
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #EF4444; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .appointment-details { background-color: #FEE2E2; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; color: #4B5563; }
            .reason { background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444; }
            .button { background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Appointment Cancelled</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <p>Your appointment has been cancelled ${canceledBy === 'business' ? `by ${businessName}` : ''}.</p>
              <div class="appointment-details">
                <div class="detail-row">
                  <span class="label">Business:</span> ${businessName}
                </div>
                <div class="detail-row">
                  <span class="label">Service:</span> ${serviceName}
                </div>
                <div class="detail-row">
                  <span class="label">Originally Scheduled:</span> ${formattedDate}
                </div>
              </div>
              ${reason ? `
                <div class="reason">
                  <strong>Reason:</strong>
                  <p>${reason}</p>
                </div>
              ` : ''}
              <p>Would you like to book a new appointment?</p>
              <a href="${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/search" class="button">
                Find Businesses
              </a>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Tarsit. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendMail({ to: email, subject, html });
  }

  async sendAppointmentReminder(
    email: string,
    firstName: string,
    businessName: string,
    businessAddress: string,
    appointmentDate: Date,
    serviceName: string,
  ): Promise<void> {
    const subject = `Reminder: Appointment Tomorrow - ${businessName}`;
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
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #F59E0B; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .appointment-details { background-color: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; color: #4B5563; }
            .button { background-color: #F59E0B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Appointment Reminder</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <p>This is a friendly reminder about your upcoming appointment!</p>
              <div class="appointment-details">
                <div class="detail-row">
                  <span class="label">Business:</span> ${businessName}
                </div>
                <div class="detail-row">
                  <span class="label">Service:</span> ${serviceName}
                </div>
                <div class="detail-row">
                  <span class="label">Date & Time:</span> ${formattedDate}
                </div>
                <div class="detail-row">
                  <span class="label">Location:</span> ${businessAddress}
                </div>
              </div>
              <p>We look forward to seeing you!</p>
              <a href="${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/appointments" class="button">
                View My Appointments
              </a>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Tarsit. All rights reserved.</p>
              <p>Need to cancel or reschedule? Visit your appointments page.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendMail({ to: email, subject, html });
  }

  async sendAppointmentStatusUpdate(
    email: string,
    firstName: string,
    businessName: string,
    appointmentDate: Date,
    serviceName: string,
    status: 'CONFIRMED' | 'COMPLETED',
  ): Promise<void> {
    const isConfirmed = status === 'CONFIRMED';
    const subject = isConfirmed 
      ? `Appointment Confirmed - ${businessName}` 
      : `Appointment Completed - ${businessName}`;
    
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
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #10B981; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .appointment-details { background-color: #D1FAE5; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; color: #4B5563; }
            .button { background-color: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${isConfirmed ? '✅ Appointment Confirmed!' : '🎉 Thank You for Visiting!'}</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              ${isConfirmed 
                ? `<p>Great news! Your appointment with ${businessName} has been confirmed.</p>`
                : `<p>Thank you for visiting ${businessName}! We hope you had a great experience.</p>`
              }
              <div class="appointment-details">
                <div class="detail-row">
                  <span class="label">Business:</span> ${businessName}
                </div>
                <div class="detail-row">
                  <span class="label">Service:</span> ${serviceName}
                </div>
                <div class="detail-row">
                  <span class="label">Date:</span> ${formattedDate}
                </div>
              </div>
              ${isConfirmed 
                ? `<p>${businessName} is looking forward to seeing you!</p>`
                : `<p>Would you like to leave a review and help other customers?</p>`
              }
              <a href="${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/${isConfirmed ? 'appointments' : 'reviews'}" class="button">
                ${isConfirmed ? 'View Appointments' : 'Leave a Review'}
              </a>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Tarsit. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendMail({ to: email, subject, html });
  }

  // ============================================================================
  // TEAM MEMBER EMAIL TEMPLATES
  // ============================================================================

  async sendTeamInvitation(
    email: string,
    inviteeName: string,
    businessName: string,
    inviterName: string,
    role: string,
    permissions: string[],
  ): Promise<void> {
    const subject = `You've been invited to join ${businessName}`;
    const permissionsList = permissions.map(p => `<li>${p}</li>`).join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .role-badge { background-color: #EEF2FF; color: #4338CA; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; }
            .permissions { background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>👋 Team Invitation</h1>
            </div>
            <div class="content">
              <h2>Hi ${inviteeName},</h2>
              <p>${inviterName} has invited you to join the team at <strong>${businessName}</strong>!</p>
              <p>Your role: <span class="role-badge">${role}</span></p>
              <div class="permissions">
                <strong>Your Permissions:</strong>
                <ul>${permissionsList}</ul>
              </div>
              <p>Click below to accept the invitation and access the business dashboard:</p>
              <a href="${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/dashboard" class="button">
                Accept Invitation
              </a>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Tarsit. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendMail({ to: email, subject, html });
  }
}
