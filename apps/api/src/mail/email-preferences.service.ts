/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * EMAIL PREFERENCES SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Manages user email preferences and unsubscribe functionality.
 * Supports both authenticated users and email-based preferences.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface EmailPreferenceUpdate {
  promotionalEmails?: boolean;
  weeklyDigest?: boolean;
  appointmentReminders?: boolean;
  appointmentUpdates?: boolean;
  reviewNotifications?: boolean;
}

export type EmailCategory = 
  | 'promotional'
  | 'weekly-digest'
  | 'appointment-reminder'
  | 'appointment-update'
  | 'review-notification'
  | 'security'
  | 'transactional';

@Injectable()
export class EmailPreferencesService {
  private readonly logger = new Logger(EmailPreferencesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get or create email preferences for an email address
   */
  async getOrCreatePreferences(email: string, userId?: string) {
    const normalizedEmail = email.toLowerCase().trim();

    let preferences = await this.prisma.emailPreference.findUnique({
      where: { email: normalizedEmail },
    });

    if (!preferences) {
      preferences = await this.prisma.emailPreference.create({
        data: {
          email: normalizedEmail,
          userId,
        },
      });
      this.logger.log(`Created email preferences for ${normalizedEmail}`);
    } else if (userId && !preferences.userId) {
      // Link existing preferences to user account
      preferences = await this.prisma.emailPreference.update({
        where: { id: preferences.id },
        data: { userId },
      });
    }

    return preferences;
  }

  /**
   * Get preferences by unsubscribe token
   */
  async getPreferencesByToken(token: string) {
    return this.prisma.emailPreference.findUnique({
      where: { unsubscribeToken: token },
    });
  }

  /**
   * Get preferences by user ID
   */
  async getPreferencesByUserId(userId: string) {
    return this.prisma.emailPreference.findUnique({
      where: { userId },
    });
  }

  /**
   * Update email preferences
   */
  async updatePreferences(
    identifier: { email?: string; token?: string; userId?: string },
    updates: EmailPreferenceUpdate,
  ) {
    let preferences;

    if (identifier.token) {
      preferences = await this.prisma.emailPreference.findUnique({
        where: { unsubscribeToken: identifier.token },
      });
    } else if (identifier.userId) {
      preferences = await this.prisma.emailPreference.findUnique({
        where: { userId: identifier.userId },
      });
    } else if (identifier.email) {
      preferences = await this.getOrCreatePreferences(identifier.email);
    }

    if (!preferences) {
      throw new Error('Email preferences not found');
    }

    return this.prisma.emailPreference.update({
      where: { id: preferences.id },
      data: {
        ...updates,
        // If re-enabling any preference, clear unsubscribedAll
        unsubscribedAll: false,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Unsubscribe from all emails (except security alerts)
   */
  async unsubscribeAll(token: string) {
    const preferences = await this.prisma.emailPreference.findUnique({
      where: { unsubscribeToken: token },
    });

    if (!preferences) {
      throw new Error('Invalid unsubscribe token');
    }

    return this.prisma.emailPreference.update({
      where: { id: preferences.id },
      data: {
        unsubscribedAll: true,
        unsubscribedAt: new Date(),
        promotionalEmails: false,
        weeklyDigest: false,
        appointmentReminders: false,
        appointmentUpdates: false,
        reviewNotifications: false,
        // Security alerts remain enabled
      },
    });
  }

  /**
   * Unsubscribe from a specific category
   */
  async unsubscribeFromCategory(token: string, category: EmailCategory) {
    const preferences = await this.prisma.emailPreference.findUnique({
      where: { unsubscribeToken: token },
    });

    if (!preferences) {
      throw new Error('Invalid unsubscribe token');
    }

    const updateData: Record<string, boolean> = {};

    switch (category) {
      case 'promotional':
        updateData.promotionalEmails = false;
        break;
      case 'weekly-digest':
        updateData.weeklyDigest = false;
        break;
      case 'appointment-reminder':
        updateData.appointmentReminders = false;
        break;
      case 'appointment-update':
        updateData.appointmentUpdates = false;
        break;
      case 'review-notification':
        updateData.reviewNotifications = false;
        break;
      case 'security':
        // Cannot unsubscribe from security alerts
        this.logger.warn(`Attempt to unsubscribe from security alerts: ${preferences.email}`);
        return preferences;
      case 'transactional':
        // Transactional emails are always sent
        return preferences;
    }

    return this.prisma.emailPreference.update({
      where: { id: preferences.id },
      data: updateData,
    });
  }

  /**
   * Check if an email can receive a specific type of email
   */
  async canSendEmail(email: string, category: EmailCategory): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();

    const preferences = await this.prisma.emailPreference.findUnique({
      where: { email: normalizedEmail },
    });

    // If no preferences exist, allow all emails
    if (!preferences) {
      return true;
    }

    // Security and transactional emails are always allowed
    if (category === 'security' || category === 'transactional') {
      return true;
    }

    // Check global unsubscribe
    if (preferences.unsubscribedAll) {
      return false;
    }

    // Check specific category
    switch (category) {
      case 'promotional':
        return preferences.promotionalEmails;
      case 'weekly-digest':
        return preferences.weeklyDigest;
      case 'appointment-reminder':
        return preferences.appointmentReminders;
      case 'appointment-update':
        return preferences.appointmentUpdates;
      case 'review-notification':
        return preferences.reviewNotifications;
      default:
        return true;
    }
  }

  /**
   * Generate unsubscribe URL for an email
   */
  async getUnsubscribeUrl(email: string, category?: EmailCategory): Promise<string> {
    const preferences = await this.getOrCreatePreferences(email);
    const baseUrl = process.env.APP_URL || 'https://tarsit.com';

    if (category) {
      return `${baseUrl}/unsubscribe?token=${preferences.unsubscribeToken}&category=${category}`;
    }

    return `${baseUrl}/unsubscribe?token=${preferences.unsubscribeToken}`;
  }

  /**
   * Re-subscribe a previously unsubscribed email
   */
  async resubscribe(token: string, categories?: EmailCategory[]) {
    const preferences = await this.prisma.emailPreference.findUnique({
      where: { unsubscribeToken: token },
    });

    if (!preferences) {
      throw new Error('Invalid token');
    }

    const updateData: Record<string, boolean | null> = {
      unsubscribedAll: false,
    };

    if (!categories || categories.length === 0) {
      // Re-enable all categories
      updateData.promotionalEmails = true;
      updateData.weeklyDigest = true;
      updateData.appointmentReminders = true;
      updateData.appointmentUpdates = true;
      updateData.reviewNotifications = true;
    } else {
      // Re-enable specific categories
      for (const category of categories) {
        switch (category) {
          case 'promotional':
            updateData.promotionalEmails = true;
            break;
          case 'weekly-digest':
            updateData.weeklyDigest = true;
            break;
          case 'appointment-reminder':
            updateData.appointmentReminders = true;
            break;
          case 'appointment-update':
            updateData.appointmentUpdates = true;
            break;
          case 'review-notification':
            updateData.reviewNotifications = true;
            break;
        }
      }
    }

    return this.prisma.emailPreference.update({
      where: { id: preferences.id },
      data: {
        ...updateData,
        unsubscribedAt: null,
      },
    });
  }
}
