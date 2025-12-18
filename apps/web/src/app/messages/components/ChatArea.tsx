'use client';

import { uploadApi, validateImageFile } from '@/lib/api/upload.api';
import {
  Building2,
  Check,
  CheckCheck,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  MoreVertical,
  Send,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { RefObject, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Chat, Message } from '../types';

interface ChatAreaProps {
  selectedChat: Chat | null;
  messages: Message[];
  isLoadingMessages: boolean;
  newMessage: string;
  setNewMessage: (msg: string) => void;
  isSending: boolean;
  onSendMessage: (attachments?: string[]) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onTyping?: () => void;
  onInfoClick: () => void;
  showMobileChat: boolean;
  messagesEndRef: RefObject<HTMLDivElement>;
  userId?: string;
  typingUsers?: string[];
}

export function ChatArea({
  selectedChat,
  messages,
  isLoadingMessages,
  newMessage,
  setNewMessage,
  isSending,
  onSendMessage,
  onKeyPress,
  onTyping,
  onInfoClick,
  showMobileChat,
  messagesEndRef,
  userId,
  typingUsers = [],
}: ChatAreaProps) {
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate files
    for (const file of files) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }
    }

    setIsUploadingAttachment(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const result = await uploadApi.uploadImage(file, 'messages');
        uploadedUrls.push(result.secureUrl);
      }
      setAttachments((prev) => [...prev, ...uploadedUrls]);
      toast.success(`Uploaded ${uploadedUrls.length} image${uploadedUrls.length > 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploadingAttachment(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatMessageTime = (dateString: string) => {
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

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    }
  };

  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    msgs.forEach((message) => {
      const date = new Date(message.createdAt).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(message);
    });
    return groups;
  };

  if (!selectedChat) {
    return (
      <div
        className={`flex-1 flex flex-col bg-neutral-950 ${showMobileChat ? 'flex' : 'hidden lg:flex'}`}
      >
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <MessageSquare className="h-10 w-10 text-white/20" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Your Messages</h2>
          <p className="text-white/50 max-w-sm mb-6">
            Select a conversation from the sidebar to start chatting, or browse businesses to start
            a new conversation.
          </p>
          <Link
            href="/search"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25"
          >
            Browse Businesses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex-1 flex flex-col bg-neutral-950 ${showMobileChat ? 'flex' : 'hidden lg:flex'}`}
    >
      {/* Desktop Chat Header */}
      <div className="hidden lg:flex items-center justify-between p-4 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-3">
          {selectedChat.business.logoImage ? (
            <Image
              src={selectedChat.business.logoImage}
              alt={selectedChat.business.name}
              width={44}
              height={44}
              className="rounded-full"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white/50" />
            </div>
          )}
          <div>
            <h2 className="font-semibold text-white">{selectedChat.business.name}</h2>
            <p className="text-sm text-white/50">
              {selectedChat.business.category.name} • {selectedChat.business.city},{' '}
              {selectedChat.business.state}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/business/${selectedChat.business.slug}`}
            className="px-4 py-2 text-sm font-medium text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            View Business
          </Link>
          <button
            onClick={onInfoClick}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <MoreVertical className="h-5 w-5 text-white/50" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="relative w-8 h-8">
              <div className="w-8 h-8 rounded-full border-2 border-white/10"></div>
              <div className="absolute top-0 left-0 w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
            </div>
          </div>
        ) : messages.length > 0 ? (
          <div className="space-y-4 max-w-3xl mx-auto">
            {Object.entries(groupMessagesByDate(messages)).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date Header */}
                <div className="flex items-center justify-center my-6">
                  <span className="px-3 py-1 bg-white/5 text-xs text-white/50 rounded-full border border-white/10">
                    {formatDateHeader(date)}
                  </span>
                </div>

                {/* Messages */}
                {dateMessages.map((message) => {
                  const isOwn = message.senderId === userId;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}
                    >
                      <div
                        className={`flex items-end gap-2 max-w-[85%] ${isOwn ? 'flex-row-reverse' : ''}`}
                      >
                        {!isOwn && (
                          <div className="flex-shrink-0 mb-1">
                            {selectedChat.business.logoImage ? (
                              <Image
                                src={selectedChat.business.logoImage}
                                alt=""
                                width={28}
                                height={28}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                                <Building2 className="h-3.5 w-3.5 text-white/50" />
                              </div>
                            )}
                          </div>
                        )}
                        <div>
                          <div
                            className={`px-4 py-2.5 rounded-2xl ${
                              isOwn
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-md'
                                : 'bg-white/10 text-white rounded-bl-md border border-white/10'
                            }`}
                          >
                            {/* Message Attachments (Images) */}
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mb-2 space-y-2">
                                {message.attachments.map((url, idx) => (
                                  <div
                                    key={idx}
                                    className="relative rounded-lg overflow-hidden max-w-xs"
                                  >
                                    <Image
                                      src={url}
                                      alt={`Attachment ${idx + 1}`}
                                      width={300}
                                      height={300}
                                      className="object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Message Content */}
                            {message.content && (
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {message.content}
                              </p>
                            )}
                          </div>
                          <div
                            className={`flex items-center gap-1.5 mt-1 ${isOwn ? 'justify-end' : ''}`}
                          >
                            <span className="text-[11px] text-white/40">
                              {formatMessageTime(message.createdAt)}
                            </span>
                            {isOwn &&
                              (message.isRead ? (
                                <span title="Read">
                                  <CheckCheck className="h-3.5 w-3.5 text-purple-400" />
                                </span>
                              ) : (
                                <span title="Sent">
                                  <Check className="h-3.5 w-3.5 text-white/40" />
                                </span>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2">
                <div className="flex gap-1">
                  <div
                    className="w-2 h-2 bg-white/40 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <div
                    className="w-2 h-2 bg-white/40 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <div
                    className="w-2 h-2 bg-white/40 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
                <span className="text-sm text-white/50">
                  {typingUsers.length === 1 ? 'Someone is typing...' : 'People are typing...'}
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-white/20" />
            </div>
            <h3 className="font-semibold text-white mb-2">Start the conversation</h3>
            <p className="text-sm text-white/50">Send a message to {selectedChat.business.name}</p>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white/5 backdrop-blur-xl border-t border-white/10">
        <div className="max-w-3xl mx-auto space-y-3">
          {/* Attachment Previews */}
          {attachments.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {attachments.map((url, index) => (
                <div key={index} className="relative group">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10">
                    <Image
                      src={url}
                      alt={`Attachment ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="absolute -top-1 -right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-3">
            {/* File Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAttachment}
              className="h-12 w-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-50 flex-shrink-0"
              title="Upload image"
            >
              {isUploadingAttachment ? (
                <Loader2 className="h-5 w-5 animate-spin text-white/50" />
              ) : (
                <ImageIcon className="h-5 w-5 text-white/50" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />

            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  onTyping?.();
                }}
                onKeyDown={onKeyPress}
                placeholder="Type a message..."
                rows={1}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-white/40 resize-none focus:outline-none focus:border-purple-500/50 transition-colors max-h-32"
                style={{ minHeight: '48px' }}
              />
            </div>
            <button
              onClick={() => {
                onSendMessage(attachments);
                setAttachments([]);
              }}
              disabled={
                (!newMessage.trim() && attachments.length === 0) ||
                isSending ||
                isUploadingAttachment
              }
              className="h-12 w-12 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl flex items-center justify-center hover:from-purple-500 hover:to-indigo-500 disabled:from-neutral-700 disabled:to-neutral-700 disabled:text-white/30 transition-all shadow-lg shadow-purple-500/25 disabled:shadow-none flex-shrink-0"
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
