'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
    Search,
    Send,
    MessageCircle,
    Check,
    CheckCheck,
    ChevronLeft,
    Loader2,
    Inbox,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface ChatParticipant {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
}

interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    read: boolean;
}

interface Chat {
    id: string;
    customer: ChatParticipant;
    lastMessage?: {
        content: string;
        createdAt: string;
        senderId: string;
    };
    unreadCount: number;
    messages: Message[];
}

interface BusinessMessagesTabProps {
    businessId: string;
    currentUserId: string;
}

export function BusinessMessagesTab({ businessId, currentUserId }: BusinessMessagesTabProps) {
    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch chats
    useEffect(() => {
        const fetchChats = async () => {
            try {
                const res = await apiClient.get(`/chats/business/${businessId}`);
                setChats(res.data || []);
            } catch (error) {
                console.error('Failed to fetch chats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChats();
    }, [businessId]);

    // Fetch messages when chat selected
    useEffect(() => {
        if (!selectedChat) return;

        const fetchMessages = async () => {
            setIsLoadingMessages(true);
            try {
                const res = await apiClient.get(`/chats/${selectedChat.id}/messages`);
                setMessages(res.data || []);

                // Mark as read
                await apiClient.post(`/chats/${selectedChat.id}/read`);

                // Update chat's unread count
                setChats(chats.map(c =>
                    c.id === selectedChat.id ? { ...c, unreadCount: 0 } : c
                ));
            } catch (error) {
                console.error('Failed to fetch messages:', error);
            } finally {
                setIsLoadingMessages(false);
            }
        };

        fetchMessages();
    }, [selectedChat?.id]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Send message
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat) return;

        setIsSending(true);
        const tempId = Date.now().toString();
        const tempMessage: Message = {
            id: tempId,
            content: newMessage,
            senderId: currentUserId,
            createdAt: new Date().toISOString(),
            read: false,
        };

        // Optimistic update
        setMessages([...messages, tempMessage]);
        setNewMessage('');

        try {
            const res = await apiClient.post(`/chats/${selectedChat.id}/messages`, {
                content: newMessage,
            });

            // Replace temp message with real one
            setMessages(msgs => msgs.map(m => m.id === tempId ? res.data : m));

            // Update chat's last message
            setChats(chats.map(c =>
                c.id === selectedChat.id
                    ? { ...c, lastMessage: { content: newMessage, createdAt: new Date().toISOString(), senderId: currentUserId } }
                    : c
            ));
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message');
            // Remove temp message on error
            setMessages(msgs => msgs.filter(m => m.id !== tempId));
            setNewMessage(tempMessage.content);
        } finally {
            setIsSending(false);
        }
    };

    // Filter chats by search
    const filteredChats = chats.filter(chat => {
        if (!searchQuery) return true;
        const name = `${chat.customer.firstName} ${chat.customer.lastName}`.toLowerCase();
        return name.includes(searchQuery.toLowerCase());
    });

    // Calculate total unread
    const totalUnread = chats.reduce((sum, c) => sum + c.unreadCount, 0);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <div className="flex h-[600px]">
                {/* Chat List */}
                <div className={`w-full sm:w-80 border-r border-white/10 flex flex-col ${selectedChat ? 'hidden sm:flex' : 'flex'}`}>
                    {/* Header */}
                    <div className="p-4 border-b border-white/10">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-semibold text-white">Messages</h2>
                            {totalUnread > 0 && (
                                <span className="px-2 py-0.5 bg-purple-500 text-white text-xs font-medium rounded-full">
                                    {totalUnread}
                                </span>
                            )}
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search conversations..."
                                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                        </div>
                    </div>

                    {/* Chat List */}
                    <div className="flex-grow overflow-y-auto">
                        {filteredChats.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                                <Inbox className="h-12 w-12 text-white/20 mb-4" />
                                <p className="text-white/50">No conversations yet</p>
                                <p className="text-sm text-white/30 mt-1">
                                    When customers message you, they&apos;ll appear here
                                </p>
                            </div>
                        ) : (
                            filteredChats.map(chat => (
                                <button
                                    key={chat.id}
                                    onClick={() => setSelectedChat(chat)}
                                    className={`w-full p-4 flex items-start gap-3 hover:bg-white/5 transition text-left ${selectedChat?.id === chat.id ? 'bg-white/5' : ''
                                        }`}
                                >
                                    {chat.customer.avatar ? (
                                        <Image
                                            src={chat.customer.avatar}
                                            alt={chat.customer.firstName}
                                            width={40}
                                            height={40}
                                            className="rounded-full"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                                            <span className="text-sm font-medium text-white">
                                                {chat.customer.firstName[0]}{chat.customer.lastName[0]}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium text-white truncate">
                                                {chat.customer.firstName} {chat.customer.lastName}
                                            </h4>
                                            {chat.lastMessage && (
                                                <span className="text-xs text-white/40">
                                                    {formatDistanceToNow(new Date(chat.lastMessage.createdAt), { addSuffix: false })}
                                                </span>
                                            )}
                                        </div>
                                        {chat.lastMessage && (
                                            <p className="text-sm text-white/50 truncate mt-0.5">
                                                {chat.lastMessage.senderId === currentUserId && 'You: '}
                                                {chat.lastMessage.content}
                                            </p>
                                        )}
                                    </div>

                                    {chat.unreadCount > 0 && (
                                        <span className="flex-shrink-0 w-5 h-5 bg-purple-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                                            {chat.unreadCount}
                                        </span>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat View */}
                <div className={`flex-grow flex flex-col ${selectedChat ? 'flex' : 'hidden sm:flex'}`}>
                    {selectedChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-white/10 flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedChat(null)}
                                    className="sm:hidden p-2 -ml-2 text-white/60 hover:text-white"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>

                                {selectedChat.customer.avatar ? (
                                    <Image
                                        src={selectedChat.customer.avatar}
                                        alt={selectedChat.customer.firstName}
                                        width={40}
                                        height={40}
                                        className="rounded-full"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                                        <span className="text-sm font-medium text-white">
                                            {selectedChat.customer.firstName[0]}{selectedChat.customer.lastName[0]}
                                        </span>
                                    </div>
                                )}

                                <div>
                                    <h3 className="font-medium text-white">
                                        {selectedChat.customer.firstName} {selectedChat.customer.lastName}
                                    </h3>
                                    <p className="text-xs text-white/40">Customer</p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                                {isLoadingMessages ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Loader2 className="h-6 w-6 text-purple-500 animate-spin" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <MessageCircle className="h-12 w-12 text-white/20 mb-4" />
                                        <p className="text-white/50">No messages yet</p>
                                        <p className="text-sm text-white/30 mt-1">
                                            Start the conversation
                                        </p>
                                    </div>
                                ) : (
                                    messages.map(message => {
                                        const isMe = message.senderId === currentUserId;
                                        return (
                                            <div
                                                key={message.id}
                                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe
                                                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                                                            : 'bg-white/10 text-white'
                                                        }`}
                                                >
                                                    <p className="text-sm">{message.content}</p>
                                                    <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : ''}`}>
                                                        <span className={`text-xs ${isMe ? 'text-white/60' : 'text-white/40'}`}>
                                                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: false })}
                                                        </span>
                                                        {isMe && (
                                                            message.read ? (
                                                                <CheckCheck className="h-3 w-3 text-white/60" />
                                                            ) : (
                                                                <Check className="h-3 w-3 text-white/60" />
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        className="flex-grow px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() || isSending}
                                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSending ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <Send className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-6">
                            <MessageCircle className="h-16 w-16 text-white/20 mb-4" />
                            <h3 className="text-lg font-medium text-white mb-2">Your Messages</h3>
                            <p className="text-white/50 max-w-sm">
                                Select a conversation to view messages and respond to customers
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
