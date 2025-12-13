'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Search, Building2, Check, CheckCheck, MessageSquare } from 'lucide-react';
import { Chat } from '../types';

interface ChatListSidebarProps {
  chats: Chat[];
  selectedChat: Chat | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onChatSelect: (chat: Chat) => void;
  showMobileChat: boolean;
  unreadTotal: number;
  userId?: string;
}

export function ChatListSidebar({
  chats,
  selectedChat,
  searchQuery,
  setSearchQuery,
  onChatSelect,
  showMobileChat,
  unreadTotal,
  userId,
}: ChatListSidebarProps) {
  const filteredChats = chats.filter(chat =>
    chat.business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.business.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatChatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className={`w-full lg:w-96 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col ${
      showMobileChat ? 'hidden lg:flex' : 'flex'
    }`}>
      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 -ml-2 rounded-lg hover:bg-white/10 transition-colors">
            <ArrowLeft className="h-5 w-5 text-white" />
          </Link>
          <h1 className="text-lg font-semibold text-white">Messages</h1>
          {unreadTotal > 0 && (
            <span className="px-2 py-0.5 bg-purple-500 text-white text-xs font-semibold rounded-full">
              {unreadTotal}
            </span>
          )}
        </div>
      </div>
      
      {/* Search */}
      <div className="p-4 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
      </div>
      
      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length > 0 ? (
          <div className="divide-y divide-white/5">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onChatSelect(chat)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-white/5 transition-colors text-left ${
                  selectedChat?.id === chat.id ? 'bg-white/5 border-l-2 border-purple-500' : ''
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {chat.business.logoImage ? (
                    <Image
                      src={chat.business.logoImage}
                      alt={chat.business.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-white/50" />
                    </div>
                  )}
                  {chat.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                      {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                    </span>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-semibold text-sm truncate ${
                      chat.unreadCount > 0 ? 'text-white' : 'text-white/70'
                    }`}>
                      {chat.business.name}
                    </h3>
                    <span className={`text-xs flex-shrink-0 ml-2 ${
                      chat.unreadCount > 0 ? 'text-purple-400 font-medium' : 'text-white/40'
                    }`}>
                      {chat.lastMessage 
                        ? formatChatTime(chat.lastMessage.createdAt)
                        : formatChatTime(chat.createdAt)
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {chat.lastMessage?.senderId === userId && (
                      <span className="flex-shrink-0">
                        {chat.lastMessage?.isRead ? (
                          <CheckCheck className="h-3.5 w-3.5 text-purple-400" />
                        ) : (
                          <Check className="h-3.5 w-3.5 text-white/40" />
                        )}
                      </span>
                    )}
                    <p className={`text-sm truncate ${
                      chat.unreadCount > 0 ? 'text-white/80 font-medium' : 'text-white/50'
                    }`}>
                      {chat.lastMessage?.content || 'Start a conversation'}
                    </p>
                  </div>
                  <p className="text-xs text-white/40 mt-1">
                    {chat.business.category.name} • {chat.business.city}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-white/20" />
            </div>
            <h3 className="font-semibold text-white mb-2">No messages yet</h3>
            <p className="text-sm text-white/50 mb-6">
              {searchQuery 
                ? 'No conversations match your search'
                : 'Start a conversation by contacting a business'}
            </p>
            {!searchQuery && (
              <Link
                href="/search"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25"
              >
                Browse Businesses
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
