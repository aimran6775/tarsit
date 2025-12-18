'use client';

import { useAuth } from '@/contexts/auth-context';
import { useSocket } from '@/hooks';
import { apiClient } from '@/lib/api/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BusinessInfoSidebar,
  ChatArea,
  ChatListSidebar,
  LoadingState,
  MobileHeader,
} from './components';
import { Chat, Message } from './types';

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showBusinessInfo, setShowBusinessInfo] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket connection
  const socket = useSocket({ autoConnect: isAuthenticated });

  // Check for chat ID in URL
  const chatIdFromUrl = searchParams.get('chat');

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/messages');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch chats
  useEffect(() => {
    const fetchChats = async () => {
      if (!isAuthenticated) return;

      setIsLoading(true);
      try {
        const response = await apiClient.get('/chats');
        const chatData = response.data || [];
        setChats(chatData);

        // Calculate total unread
        const totalUnread = chatData.reduce(
          (sum: number, chat: Chat) => sum + (chat.unreadCount || 0),
          0
        );
        setUnreadTotal(totalUnread);

        // If there's a chat ID in URL, select that chat
        if (chatIdFromUrl) {
          const targetChat = chatData.find((c: Chat) => c.id === chatIdFromUrl);
          if (targetChat) {
            setSelectedChat(targetChat);
            setShowMobileChat(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch chats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, [isAuthenticated, chatIdFromUrl]);

  // Join/leave chat room when selection changes
  useEffect(() => {
    if (!selectedChat || !socket.isConnected) return;

    // Join the chat room
    socket.joinChat(selectedChat.id);

    // Mark messages as read
    socket.markAsRead(selectedChat.id);

    // Cleanup: leave chat room when component unmounts or chat changes
    return () => {
      socket.leaveChat(selectedChat.id);
    };
  }, [selectedChat, socket.isConnected]);

  // Fetch messages when chat is selected (initial load)
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;

      setIsLoadingMessages(true);
      try {
        const response = await apiClient.get(`/messages/${selectedChat.id}`);
        const messagesData = response.data?.messages || response.data || [];
        setMessages(messagesData);

        // Mark messages as read via REST (fallback)
        await apiClient.patch(`/messages/${selectedChat.id}/mark-as-read`);

        // Update unread count for this chat
        setChats((prev) =>
          prev.map((chat) => (chat.id === selectedChat.id ? { ...chat, unreadCount: 0 } : chat))
        );

        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedChat]);

  // WebSocket: Listen for new messages
  useEffect(() => {
    if (!socket.isConnected) return;

    const unsubscribe = socket.on('new-message', (message: Message) => {
      // Only add if it's for the current chat
      if (message.chatId === selectedChat?.id) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });

        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }

      // Update chat list with new last message
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === message.chatId
            ? {
                ...chat,
                lastMessage: {
                  content: message.content || (message.attachments?.length ? '📷 Image' : ''),
                  createdAt: message.createdAt,
                  senderId: message.senderId,
                  isRead: false,
                },
                updatedAt: message.createdAt,
                unreadCount:
                  message.senderId !== user?.id ? (chat.unreadCount || 0) + 1 : chat.unreadCount,
              }
            : chat
        )
      );
    });

    // Listen for message notifications (when not in the chat)
    const unsubscribeNotification = socket.on(
      'message-notification',
      (data: { chatId: string; message: Message }) => {
        // Show browser notification if permission granted and not in the chat
        if (
          'Notification' in window &&
          Notification.permission === 'granted' &&
          data.chatId !== selectedChat?.id &&
          data.message.senderId !== user?.id
        ) {
          const senderName = data.message.sender?.firstName
            ? `${data.message.sender.firstName} ${data.message.sender.lastName}`
            : 'Someone';

          new Notification(`${senderName} sent a message`, {
            body: data.message.content || '📷 Image',
            icon: data.message.sender?.avatar || '/favicon.ico',
            tag: data.chatId,
            requireInteraction: false,
          });
        }

        // Update chat list
        setChats((prev) => {
          const existingChat = prev.find((c) => c.id === data.chatId);
          if (!existingChat) return prev;

          return prev.map((chat) =>
            chat.id === data.chatId
              ? {
                  ...chat,
                  lastMessage: {
                    content:
                      data.message.content || (data.message.attachments?.length ? '📷 Image' : ''),
                    createdAt: data.message.createdAt,
                    senderId: data.message.senderId,
                    isRead: false,
                  },
                  updatedAt: data.message.createdAt,
                  unreadCount: (chat.unreadCount || 0) + 1,
                }
              : chat
          );
        });
      }
    );

    return () => {
      unsubscribe();
      unsubscribeNotification();
    };
  }, [socket.isConnected, selectedChat, socket.on, user?.id]);

  // WebSocket: Listen for typing indicators
  useEffect(() => {
    if (!socket.isConnected || !selectedChat) return;

    const unsubscribeTyping = socket.on(
      'user-typing',
      (data: { userId: string; chatId: string }) => {
        if (data.chatId === selectedChat.id && data.userId !== user?.id) {
          setTypingUsers((prev) => new Set(prev).add(data.userId));
        }
      }
    );

    const unsubscribeStopped = socket.on(
      'user-stopped-typing',
      (data: { userId: string; chatId: string }) => {
        if (data.chatId === selectedChat.id) {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
        }
      }
    );

    return () => {
      unsubscribeTyping();
      unsubscribeStopped();
    };
  }, [socket.isConnected, selectedChat, socket.on, user?.id]);

  // WebSocket: Listen for read receipts
  useEffect(() => {
    if (!socket.isConnected) return;

    const unsubscribe = socket.on('messages-read', (data: { chatId: string; readBy: string }) => {
      if (data.chatId === selectedChat?.id && data.readBy !== user?.id) {
        // Update messages to show they're read
        setMessages((prev) =>
          prev.map((msg) =>
            msg.senderId === user?.id && !msg.isRead ? { ...msg, isRead: true } : msg
          )
        );
      }
    });

    return unsubscribe;
  }, [socket.isConnected, selectedChat, socket.on, user?.id]);

  const handleSendMessage = useCallback(
    async (attachments: string[] = []) => {
      if ((!newMessage.trim() && attachments.length === 0) || !selectedChat || isSending) return;

      const messageContent = newMessage.trim();
      setNewMessage('');
      setIsSending(true);

      // Stop typing indicator
      if (selectedChat) {
        socket.stopTyping(selectedChat.id);
      }

      // Optimistic update
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        chatId: selectedChat.id,
        senderId: user?.id || '',
        senderType: 'user',
        content: messageContent,
        attachments,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempMessage]);

      try {
        // Send via WebSocket if connected, otherwise fallback to REST
        if (socket.isConnected) {
          socket.sendMessage(selectedChat.id, messageContent, 'TEXT', attachments);
          // The real message will come via 'new-message' event
          // Remove temp message after a short delay
          setTimeout(() => {
            setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
          }, 1000);
        } else {
          // Fallback to REST API
          const response = await apiClient.post('/messages', {
            chatId: selectedChat.id,
            content: messageContent,
            attachments,
          });

          // Replace temp message with real one
          setMessages((prev) =>
            prev.map((msg) => (msg.id === tempMessage.id ? response.data : msg))
          );
        }

        // Update chat's last message
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === selectedChat.id
              ? {
                  ...chat,
                  lastMessage: {
                    content: messageContent,
                    createdAt: new Date().toISOString(),
                    senderId: user?.id || '',
                    isRead: true,
                  },
                  updatedAt: new Date().toISOString(),
                }
              : chat
          )
        );

        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } catch (error) {
        console.error('Failed to send message:', error);
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
        setNewMessage(messageContent);
      } finally {
        setIsSending(false);
      }
    },
    [newMessage, selectedChat, isSending, socket, user?.id]
  );

  // Typing indicator handlers
  const handleTyping = useCallback(() => {
    if (!selectedChat || !socket.isConnected) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Start typing
    socket.startTyping(selectedChat.id);

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.stopTyping(selectedChat.id);
    }, 3000);
  }, [selectedChat, socket]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    handleTyping();

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    setShowMobileChat(true);
  };

  const handleMobileBack = () => {
    setShowMobileChat(false);
    setSelectedChat(null);
  };

  if (authLoading || isLoading) {
    return <LoadingState />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-neutral-950">
      {/* Mobile Header */}
      <MobileHeader
        showMobileChat={showMobileChat}
        selectedChat={selectedChat}
        onBackClick={handleMobileBack}
        onInfoClick={() => setShowBusinessInfo(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Chat List Sidebar */}
        <ChatListSidebar
          chats={chats}
          selectedChat={selectedChat}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onChatSelect={handleChatSelect}
          showMobileChat={showMobileChat}
          unreadTotal={unreadTotal}
          userId={user?.id}
        />

        {/* Chat Area */}
        <ChatArea
          selectedChat={selectedChat}
          messages={messages}
          isLoadingMessages={isLoadingMessages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          isSending={isSending}
          onSendMessage={(attachments) => handleSendMessage(attachments)}
          onKeyPress={handleKeyPress}
          onTyping={handleTyping}
          onInfoClick={() => setShowBusinessInfo(true)}
          showMobileChat={showMobileChat}
          messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
          userId={user?.id}
          typingUsers={Array.from(typingUsers)}
        />
      </div>

      {/* Business Info Sidebar */}
      {selectedChat && (
        <BusinessInfoSidebar
          chat={selectedChat}
          isOpen={showBusinessInfo}
          onClose={() => setShowBusinessInfo(false)}
        />
      )}
    </div>
  );
}
