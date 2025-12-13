'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare, Building2 } from 'lucide-react';
import { Chat } from '../types';

interface MessagesTabProps {
  chats: Chat[];
}

export function MessagesTab({ chats }: MessagesTabProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-4">Messages</h2>
      
      {chats.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-6 w-6 text-white/40" />
          </div>
          <h3 className="font-medium text-white mb-2">No messages yet</h3>
          <p className="text-sm text-white/50">Start a conversation with a business</p>
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 divide-y divide-white/10">
          {chats.map((chat) => (
            <Link
              key={chat.id}
              href={`/messages?chat=${chat.id}`}
              className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
            >
              <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                {chat.business?.logoImage ? (
                  <Image src={chat.business.logoImage} alt="" width={48} height={48} className="object-cover" />
                ) : (
                  <Building2 className="h-5 w-5 text-white/40" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-white">{chat.business?.name}</p>
                  <span className="text-xs text-white/40">
                    {new Date(chat.lastMessage?.createdAt || chat.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {chat.lastMessage && (
                  <p className="text-sm text-white/50 truncate">{chat.lastMessage.content}</p>
                )}
              </div>
              {chat.unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-purple-500 text-white text-xs font-medium rounded-full">
                  {chat.unreadCount}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
