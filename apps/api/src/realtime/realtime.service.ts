import { Injectable, Logger } from '@nestjs/common';
import { RealtimeChannel } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase/supabase.service';

export interface RealtimeMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: string;
  attachments: string[];
  createdAt: string;
}

export interface PresenceState {
  odataId: string;
  odataName: string;
  online_at: string;
}

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);
  private channels: Map<string, RealtimeChannel> = new Map();

  constructor(private supabaseService: SupabaseService) {}

  /**
   * Broadcast a new message to a chat channel
   */
  async broadcastMessage(chatId: string, message: RealtimeMessage): Promise<void> {
    const client = this.supabaseService.getClient();
    if (!client) {
      this.logger.warn('Supabase client not initialized, skipping broadcast');
      return;
    }

    try {
      const channel = client.channel(`chat:${chatId}`);
      
      await channel.send({
        type: 'broadcast',
        event: 'new_message',
        payload: message,
      });

      this.logger.debug(`Broadcasted message to chat:${chatId}`);
    } catch (error) {
      this.logger.error(`Failed to broadcast message: ${error}`);
    }
  }

  /**
   * Broadcast typing indicator
   */
  async broadcastTyping(chatId: string, userId: string, userName: string, isTyping: boolean): Promise<void> {
    const client = this.supabaseService.getClient();
    if (!client) return;

    try {
      const channel = client.channel(`chat:${chatId}`);
      
      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          userId,
          userName,
          isTyping,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to broadcast typing indicator: ${error}`);
    }
  }

  /**
   * Broadcast message read status
   */
  async broadcastMessageRead(chatId: string, userId: string, messageId: string): Promise<void> {
    const client = this.supabaseService.getClient();
    if (!client) return;

    try {
      const channel = client.channel(`chat:${chatId}`);
      
      await channel.send({
        type: 'broadcast',
        event: 'message_read',
        payload: {
          userId,
          messageId,
          readAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to broadcast message read: ${error}`);
    }
  }

  /**
   * Broadcast to admin dashboard channel
   */
  async broadcastAdminEvent(event: string, payload: Record<string, unknown>): Promise<void> {
    const client = this.supabaseService.getClient();
    if (!client) return;

    try {
      const channel = client.channel('admin:dashboard');
      
      await channel.send({
        type: 'broadcast',
        event,
        payload: {
          ...payload,
          timestamp: new Date().toISOString(),
        },
      });

      this.logger.debug(`Broadcasted admin event: ${event}`);
    } catch (error) {
      this.logger.error(`Failed to broadcast admin event: ${error}`);
    }
  }

  /**
   * Broadcast new user registration
   */
  async broadcastNewUser(user: { id: string; email: string; firstName: string; lastName: string }): Promise<void> {
    await this.broadcastAdminEvent('new_user', {
      userId: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
    });
  }

  /**
   * Broadcast new business registration
   */
  async broadcastNewBusiness(business: { id: string; name: string; category: string }): Promise<void> {
    await this.broadcastAdminEvent('new_business', {
      businessId: business.id,
      name: business.name,
      category: business.category,
    });
  }

  /**
   * Broadcast new appointment
   */
  async broadcastNewAppointment(appointment: { id: string; businessName: string; customerName: string }): Promise<void> {
    await this.broadcastAdminEvent('new_appointment', {
      appointmentId: appointment.id,
      businessName: appointment.businessName,
      customerName: appointment.customerName,
    });
  }

  /**
   * Broadcast new review
   */
  async broadcastNewReview(review: { id: string; businessName: string; rating: number }): Promise<void> {
    await this.broadcastAdminEvent('new_review', {
      reviewId: review.id,
      businessName: review.businessName,
      rating: review.rating,
    });
  }

  /**
   * Get channel for presence tracking
   */
  getPresenceChannel(channelName: string): RealtimeChannel | null {
    const client = this.supabaseService.getClient();
    if (!client) return null;

    if (!this.channels.has(channelName)) {
      const channel = client.channel(channelName, {
        config: {
          presence: {
            key: channelName,
          },
        },
      });
      this.channels.set(channelName, channel);
    }

    return this.channels.get(channelName) || null;
  }

  /**
   * Track user presence in admin dashboard
   */
  async trackAdminPresence(userId: string, userName: string): Promise<void> {
    const channel = this.getPresenceChannel('admin:presence');
    if (!channel) return;

    try {
      await channel.track({
        userId,
        userName,
        online_at: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Failed to track admin presence: ${error}`);
    }
  }
}
