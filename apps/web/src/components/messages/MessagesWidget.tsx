'use client';

import { useAuth } from '@/contexts/auth-context';
import { useMessages } from '@/contexts/messages-context';
import { apiClient } from '@/lib/api/client';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  Check,
  CheckCheck,
  MessageCircle,
  Search,
  Send,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

// Types
interface Business {
  id: string;
  name: string;
  slug: string;
  logoImage?: string;
  category?: { name: string };
}

interface LastMessage {
  content: string;
  createdAt: string;
  senderId: string;
  isRead: boolean;
}

interface Chat {
  id: string;
  business: Business;
  lastMessage?: LastMessage;
  unreadCount: number;
  updatedAt: string;
}

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderType: 'user' | 'business';
  content: string;
  attachments?: string[];
  isRead: boolean;
  createdAt: string;
}

// Widget States
type WidgetView = 'closed' | 'list' | 'chat';

export function MessagesWidget() {
  const { user, isAuthenticated } = useAuth();
  const { isOpen, pendingChatId, closeMessages, clearPendingChat } = useMessages();
  const [view, setView] = useState<WidgetView>('closed');
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadTotal, setUnreadTotal] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Handle external open requests from context
  useEffect(() => {
    if (isOpen && view === 'closed') {
      setView('list');
      fetchChats();
    }
  }, [isOpen]);

  // Fetch chats
  const fetchChats = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const response = await apiClient.get('/chats');
      const data = response.data;
      const chatData: Chat[] = Array.isArray(data) ? data : data?.chats || [];
      setChats(chatData);

      const totalUnread = chatData.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
      setUnreadTotal(totalUnread);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch messages for selected chat
  const fetchMessages = useCallback(
    async (chatId: string) => {
      setIsLoadingMessages(true);
      try {
        const response = await apiClient.get(`/messages/${chatId}`);
        const messagesData = response.data?.messages || response.data || [];
        setMessages(messagesData);

        // Mark as read
        await apiClient.patch(`/messages/${chatId}/mark-as-read`);

        // Update unread count
        setChats((prev) =>
          prev.map((chat) => (chat.id === chatId ? { ...chat, unreadCount: 0 } : chat))
        );
        setUnreadTotal((prev) => Math.max(0, prev - (selectedChat?.unreadCount || 0)));

        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [selectedChat?.unreadCount]
  );

  // Handle pending chat from context - must be after fetchMessages is defined
  useEffect(() => {
    const openPendingChat = async () => {
      if (!pendingChatId || !isAuthenticated) return;

      // First try to find in existing chats
      let targetChat = chats.find((c) => c.id === pendingChatId);

      // If not found and chats have loaded (or list is empty), fetch the specific chat
      if (!targetChat && !isLoading) {
        try {
          const response = await apiClient.get(`/chats/${pendingChatId}`);
          if (response.data) {
            targetChat = response.data;
            // Add to chats list if not present
            setChats((prev) => {
              const exists = prev.some((c) => c.id === pendingChatId);
              return exists ? prev : [response.data, ...prev];
            });
          }
        } catch (error) {
          console.error('Failed to fetch pending chat:', error);
        }
      }

      if (targetChat) {
        setSelectedChat(targetChat);
        setView('chat');
        fetchMessages(targetChat.id);
        clearPendingChat();
      }
    };

    openPendingChat();
  }, [pendingChatId, chats, isLoading, isAuthenticated, clearPendingChat, fetchMessages]);

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || isSending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    // Optimistic update
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      chatId: selectedChat.id,
      senderId: user?.id || '',
      senderType: 'user',
      content: messageContent,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const response = await apiClient.post('/messages', {
        chatId: selectedChat.id,
        content: messageContent,
      });

      // Replace temp with real message
      setMessages((prev) => prev.map((msg) => (msg.id === tempMessage.id ? response.data : msg)));

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
      // Remove temp message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
      setNewMessage(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Open widget and fetch chats
  const handleOpen = () => {
    setView('list');
    fetchChats();
  };

  // Select a chat
  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    setView('chat');
    fetchMessages(chat.id);
  };

  // Go back to list
  const handleBack = () => {
    setSelectedChat(null);
    setMessages([]);
    setView('list');
  };

  // Close widget
  const handleClose = () => {
    setView('closed');
    setSelectedChat(null);
    setMessages([]);
    closeMessages();
  };

  // Filter chats
  const filteredChats = chats.filter((chat) =>
    chat.business.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Poll for new messages
  useEffect(() => {
    if (view === 'closed' || !isAuthenticated) return;

    const interval = setInterval(() => {
      if (view === 'list') {
        fetchChats();
      } else if (view === 'chat' && selectedChat) {
        fetchMessages(selectedChat.id);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [view, isAuthenticated, selectedChat, fetchChats, fetchMessages]);

  // Auto-focus input when chat opens
  useEffect(() => {
    if (view === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [view]);

  // Don't render for non-authenticated users
  if (!isAuthenticated) return null;

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {view === 'closed' && (
          <motion.button
            drag
            dragConstraints={{ top: -200, bottom: 100, left: -200, right: 50 }}
            dragElastic={0.1}
            whileDrag={{ scale: 1.1 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={handleOpen}
            className="fixed bottom-36 right-6 md:bottom-24 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 flex items-center justify-center hover:shadow-xl hover:shadow-blue-500/40 transition-all hover:scale-105 active:scale-95 cursor-grab active:cursor-grabbing"
          >
            <MessageCircle className="h-6 w-6 text-white" />
            {unreadTotal > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadTotal > 9 ? '9+' : unreadTotal}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Widget Panel */}
      <AnimatePresence>
        {view !== 'closed' && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed z-50 bg-neutral-900/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 flex flex-col overflow-hidden
              inset-0 rounded-none md:inset-auto md:bottom-6 md:right-6 md:w-[380px] md:h-[550px] md:rounded-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
              {view === 'chat' && selectedChat ? (
                <>
                  <button
                    onClick={handleBack}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5 text-white" />
                  </button>
                  <div className="flex items-center gap-2 flex-1 ml-2">
                    {selectedChat.business.logoImage ? (
                      <Image
                        src={selectedChat.business.logoImage}
                        alt={selectedChat.business.name}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/30 to-indigo-500/30 flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-purple-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/business/${selectedChat.business.slug}`}
                        className="font-semibold text-white text-sm truncate block hover:text-purple-400 transition-colors"
                      >
                        {selectedChat.business.name}
                      </Link>
                      <p className="text-xs text-white/50 truncate">
                        {selectedChat.business.category?.name || 'Business'}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-blue-400" />
                    <h2 className="font-semibold text-white">Messages</h2>
                    {unreadTotal > 0 && (
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
                        {unreadTotal} new
                      </span>
                    )}
                  </div>
                </>
              )}
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5 text-white/70" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {view === 'list' ? (
                <ChatListView
                  chats={filteredChats}
                  isLoading={isLoading}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onSelectChat={handleSelectChat}
                  formatTime={formatTime}
                  userId={user?.id}
                />
              ) : (
                <ChatView
                  messages={messages}
                  isLoading={isLoadingMessages}
                  messagesEndRef={messagesEndRef}
                  formatTime={formatTime}
                  userId={user?.id}
                />
              )}
            </div>

            {/* Input (only in chat view) */}
            {view === 'chat' && selectedChat && (
              <div className="p-3 border-t border-white/10 bg-white/5">
                <div className="flex items-end gap-2">
                  <div className="flex-1 bg-white/5 rounded-xl border border-white/10 focus-within:border-blue-500/50 transition-colors">
                    <textarea
                      ref={inputRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Type a message..."
                      rows={1}
                      className="w-full px-3 py-2.5 bg-transparent text-white text-sm placeholder-white/40 resize-none focus:outline-none max-h-24"
                      style={{ minHeight: '40px' }}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isSending}
                    className="p-2.5 rounded-xl bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Chat List View Component
function ChatListView({
  chats,
  isLoading,
  searchQuery,
  setSearchQuery,
  onSelectChat,
  formatTime,
  userId,
}: {
  chats: Chat[];
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSelectChat: (chat: Chat) => void;
  formatTime: (date: string) => string;
  userId?: string;
}) {
  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none focus:border-blue-500/50"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <MessageCircle className="h-8 w-8 text-white/30" />
            </div>
            <p className="text-white/70 font-medium">No conversations yet</p>
            <p className="text-white/40 text-sm mt-1">
              Start chatting with businesses to see your messages here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                className="w-full px-3 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
              >
                {/* Avatar */}
                {chat.business.logoImage ? (
                  <Image
                    src={chat.business.logoImage}
                    alt={chat.business.name}
                    width={44}
                    height={44}
                    className="rounded-full flex-shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500/30 to-indigo-500/30 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-purple-400" />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-white text-sm truncate">
                      {chat.business.name}
                    </h3>
                    {chat.lastMessage && (
                      <span className="text-xs text-white/40 flex-shrink-0 ml-2">
                        {formatTime(chat.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-white/50 truncate">
                      {chat.lastMessage ? (
                        <>
                          {chat.lastMessage.senderId === userId && (
                            <span className="text-white/30">You: </span>
                          )}
                          {chat.lastMessage.content}
                        </>
                      ) : (
                        'No messages yet'
                      )}
                    </p>
                    {chat.unreadCount > 0 && (
                      <span className="ml-2 w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Chat View Component
function ChatView({
  messages,
  isLoading,
  messagesEndRef,
  formatTime,
  userId,
}: {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  formatTime: (date: string) => string;
  userId?: string;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <MessageCircle className="h-8 w-8 text-white/30" />
        </div>
        <p className="text-white/70 font-medium">Start the conversation</p>
        <p className="text-white/40 text-sm mt-1">Send a message to get started</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-3 py-4 space-y-3">
      {messages.map((message) => {
        const isOwn = message.senderId === userId;

        return (
          <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] ${isOwn ? 'order-1' : 'order-2'}`}>
              <div
                className={`px-3 py-2 rounded-2xl ${
                  isOwn
                    ? 'bg-blue-500 text-white rounded-br-md'
                    : 'bg-white/10 text-white rounded-bl-md'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              </div>
              <div
                className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <span className="text-[10px] text-white/40">{formatTime(message.createdAt)}</span>
                {isOwn &&
                  (message.isRead ? (
                    <CheckCheck className="h-3 w-3 text-blue-400" />
                  ) : (
                    <Check className="h-3 w-3 text-white/40" />
                  ))}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
