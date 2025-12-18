import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { apiClient } from '@/lib/api/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/auth-context';

interface UseSocketOptions {
  namespace?: string; // Ignored, kept for compatibility
  autoConnect?: boolean;
}

export function useSocket(options: UseSocketOptions = {}) {
  const { autoConnect = true } = options;
  const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const listenersRef = useRef<Map<string, Set<(...args: any[]) => void>>>(new Map());

  useEffect(() => {
    if (autoConnect && isAuthenticated) {
        setIsConnected(true);
    }
  }, [autoConnect, isAuthenticated]);

  // Event listener management
  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }
    listenersRef.current.get(event)!.add(callback);

    return () => {
      const callbacks = listenersRef.current.get(event);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }, []);

  const emitLocal = useCallback((event: string, data: any) => {
      const callbacks = listenersRef.current.get(event);
      if (callbacks) {
          callbacks.forEach(cb => cb(data));
      }
  }, []);

  // Join chat room -> Subscribe to Supabase channel
  const joinChat = useCallback((chatId: string) => {
    if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Message',
          filter: `chatId=eq.${chatId}`,
        },
        (payload) => {
          const newMessage = payload.new as any;
          // Fetch full details to get sender info
          apiClient.get(`/messages/single/${newMessage.id}`)
            .then(response => {
               emitLocal('new-message', response.data);
            })
            .catch(err => {
               console.error('Failed to fetch new message details', err);
               emitLocal('new-message', newMessage);
            });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
            setIsConnected(true);
        }
      });
      
    channelRef.current = channel;
  }, [emitLocal]);

  const leaveChat = useCallback((_chatId: string) => {
    if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
    }
  }, []);

  const sendMessage = useCallback(async (
    chatId: string,
    content: string,
    type: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT',
    attachments?: string[],
  ) => {
    // Call REST API
    await apiClient.post('/messages', { chatId, content, type, attachments });
  }, []);

  const markAsRead = useCallback(async (chatId: string) => {
    await apiClient.patch(`/messages/${chatId}/mark-as-read`);
  }, []);

  const startTyping = useCallback((_chatId: string) => {
      // TODO: Implement broadcast
  }, []);

  const stopTyping = useCallback((_chatId: string) => {
      // TODO: Implement broadcast
  }, []);

  return {
    socket: null, // No socket object anymore
    isConnected,
    error: null,
    on,
    emit: () => {}, // No generic emit
    joinChat,
    leaveChat,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
  };
}

export default useSocket;
