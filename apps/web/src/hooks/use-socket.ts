import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/auth-context';

interface UseSocketOptions {
  namespace?: string;
  autoConnect?: boolean;
}

interface SocketEvents {
  'new-message': (message: any) => void;
  'message-notification': (data: { chatId: string; message: any }) => void;
  'user-typing': (data: { userId: string; chatId: string }) => void;
  'user-stopped-typing': (data: { userId: string; chatId: string }) => void;
  'messages-read': (data: { chatId: string; readBy: string }) => void;
  connect: () => void;
  disconnect: () => void;
  error: (error: Error) => void;
}

export function useSocket(options: UseSocketOptions = {}) {
  const { namespace = '/messages', autoConnect = true } = options;
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const listenersRef = useRef<Map<string, Set<Function>>>(new Map());

  // Initialize socket
  useEffect(() => {
    if (!autoConnect || !isAuthenticated || !user) {
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const socket = io(`${apiUrl}${namespace}`, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Connection handlers
    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (err) => {
      setError(err);
      console.error('Socket connection error:', err);
    });

    // Cleanup
    return () => {
      socket.disconnect();
      socketRef.current = null;
      listenersRef.current.clear();
    };
  }, [isAuthenticated, user, namespace, autoConnect]);

  // Generic event listener
  const on = useCallback(<K extends keyof SocketEvents>(
    event: K,
    handler: SocketEvents[K],
  ) => {
    if (!socketRef.current) return;

    const socket = socketRef.current;
    socket.on(event, handler as any);

    // Track listener for cleanup
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }
    listenersRef.current.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      socket.off(event, handler as any);
      listenersRef.current.get(event)?.delete(handler);
    };
  }, []);

  // Emit event
  const emit = useCallback((event: string, data: any) => {
    if (!socketRef.current || !isConnected) {
      console.warn(`Cannot emit ${event}: socket not connected`);
      return;
    }
    socketRef.current.emit(event, data);
  }, [isConnected]);

  // Join chat room
  const joinChat = useCallback((chatId: string) => {
    emit('join-chat', { chatId });
  }, [emit]);

  // Leave chat room
  const leaveChat = useCallback((chatId: string) => {
    emit('leave-chat', { chatId });
  }, [emit]);

  // Send message
  const sendMessage = useCallback((
    chatId: string,
    content: string,
    type: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT',
    attachments?: string[],
  ) => {
    emit('send-message', { chatId, content, type, attachments });
  }, [emit]);

  // Typing indicators
  const startTyping = useCallback((chatId: string) => {
    emit('typing-start', { chatId });
  }, [emit]);

  const stopTyping = useCallback((chatId: string) => {
    emit('typing-stop', { chatId });
  }, [emit]);

  // Mark messages as read
  const markAsRead = useCallback((chatId: string) => {
    emit('mark-read', { chatId });
  }, [emit]);

  return {
    socket: socketRef.current,
    isConnected,
    error,
    on,
    emit,
    joinChat,
    leaveChat,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
  };
}

export default useSocket;
