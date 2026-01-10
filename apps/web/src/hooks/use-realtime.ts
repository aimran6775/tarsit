'use client';

import { createClient, RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { useEffect, useRef, useState } from 'react';

// Initialize Supabase client for realtime (no auth needed for broadcast)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient() {
  if (!supabaseClient && supabaseUrl && supabaseAnonKey) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }
  return supabaseClient;
}

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

export interface TypingIndicator {
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: string;
}

interface UseChatRealtimeOptions {
  chatId: string;
  onNewMessage?: (message: RealtimeMessage) => void;
  onTyping?: (indicator: TypingIndicator) => void;
  onMessageRead?: (data: { userId: string; messageId: string; readAt: string }) => void;
  enabled?: boolean;
}

export function useChatRealtime({
  chatId,
  onNewMessage,
  onTyping,
  onMessageRead,
  enabled = true,
}: UseChatRealtimeOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled || !chatId) return;

    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn('[Realtime] Supabase client not initialized');
      return;
    }

    const channel = supabase.channel(`chat:${chatId}`);

    // Subscribe to new messages
    channel.on('broadcast', { event: 'new_message' }, (payload) => {
      if (onNewMessage && payload.payload) {
        onNewMessage(payload.payload as RealtimeMessage);
      }
    });

    // Subscribe to typing indicators
    channel.on('broadcast', { event: 'typing' }, (payload) => {
      if (onTyping && payload.payload) {
        onTyping(payload.payload as TypingIndicator);
      }
    });

    // Subscribe to message read events
    channel.on('broadcast', { event: 'message_read' }, (payload) => {
      if (onMessageRead && payload.payload) {
        onMessageRead(payload.payload as { userId: string; messageId: string; readAt: string });
      }
    });

    // Subscribe to channel
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        console.log(`[Realtime] Connected to chat:${chatId}`);
      } else if (status === 'CLOSED') {
        setIsConnected(false);
      }
    });

    channelRef.current = channel;

    return () => {
      console.log(`[Realtime] Disconnecting from chat:${chatId}`);
      channel.unsubscribe();
      channelRef.current = null;
      setIsConnected(false);
    };
  }, [chatId, enabled, onNewMessage, onTyping, onMessageRead]);

  return { isConnected };
}

interface UseAdminRealtimeOptions {
  onNewUser?: (data: { userId: string; email: string; name: string }) => void;
  onNewBusiness?: (data: { businessId: string; name: string; category: string }) => void;
  onNewAppointment?: (data: { appointmentId: string; businessName: string; customerName: string }) => void;
  onNewReview?: (data: { reviewId: string; businessName: string; rating: number }) => void;
  enabled?: boolean;
}

export function useAdminRealtime({
  onNewUser,
  onNewBusiness,
  onNewAppointment,
  onNewReview,
  enabled = true,
}: UseAdminRealtimeOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [recentEvents, setRecentEvents] = useState<Array<{ type: string; data: unknown; timestamp: string }>>([]);

  useEffect(() => {
    if (!enabled) return;

    const supabase = getSupabaseClient();
    if (!supabase) return;

    const channel = supabase.channel('admin:dashboard');

    channel.on('broadcast', { event: 'new_user' }, (payload) => {
      if (onNewUser && payload.payload) {
        onNewUser(payload.payload as { userId: string; email: string; name: string });
      }
      setRecentEvents((prev) => [
        { type: 'new_user', data: payload.payload, timestamp: new Date().toISOString() },
        ...prev.slice(0, 49),
      ]);
    });

    channel.on('broadcast', { event: 'new_business' }, (payload) => {
      if (onNewBusiness && payload.payload) {
        onNewBusiness(payload.payload as { businessId: string; name: string; category: string });
      }
      setRecentEvents((prev) => [
        { type: 'new_business', data: payload.payload, timestamp: new Date().toISOString() },
        ...prev.slice(0, 49),
      ]);
    });

    channel.on('broadcast', { event: 'new_appointment' }, (payload) => {
      if (onNewAppointment && payload.payload) {
        onNewAppointment(payload.payload as { appointmentId: string; businessName: string; customerName: string });
      }
      setRecentEvents((prev) => [
        { type: 'new_appointment', data: payload.payload, timestamp: new Date().toISOString() },
        ...prev.slice(0, 49),
      ]);
    });

    channel.on('broadcast', { event: 'new_review' }, (payload) => {
      if (onNewReview && payload.payload) {
        onNewReview(payload.payload as { reviewId: string; businessName: string; rating: number });
      }
      setRecentEvents((prev) => [
        { type: 'new_review', data: payload.payload, timestamp: new Date().toISOString() },
        ...prev.slice(0, 49),
      ]);
    });

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        console.log('[Realtime] Connected to admin dashboard');
      } else if (status === 'CLOSED') {
        setIsConnected(false);
      }
    });

    return () => {
      channel.unsubscribe();
      setIsConnected(false);
    };
  }, [enabled, onNewUser, onNewBusiness, onNewAppointment, onNewReview]);

  return { isConnected, recentEvents };
}

// Hook for presence tracking (online users)
export function usePresence(channelName: string, userData: { id: string; name: string }) {
  const [onlineUsers, setOnlineUsers] = useState<Array<{ id: string; name: string; online_at: string }>>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!channelName || !userData.id) return;

    const supabase = getSupabaseClient();
    if (!supabase) return;

    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: userData.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).flat().map((presence: any) => ({
          id: presence.id,
          name: presence.name,
          online_at: presence.online_at,
        }));
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('[Presence] User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('[Presence] User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: userData.id,
            name: userData.name,
            online_at: new Date().toISOString(),
          });
          setIsConnected(true);
        }
      });

    return () => {
      channel.unsubscribe();
      setIsConnected(false);
    };
  }, [channelName, userData.id, userData.name]);

  return { onlineUsers, isConnected };
}
