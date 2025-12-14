'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Building2, MoreVertical } from 'lucide-react';
import { Chat } from '../types';

interface MobileHeaderProps {
  showMobileChat: boolean;
  selectedChat: Chat | null;
  onBackClick: () => void;
  onInfoClick: () => void;
}

export function MobileHeader({ showMobileChat, selectedChat, onBackClick, onInfoClick }: MobileHeaderProps) {
  return (
    <header className="lg:hidden bg-white/5 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between">
      {showMobileChat && selectedChat ? (
        <>
          <button
            onClick={onBackClick}
            className="p-2 -ml-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <div className="flex items-center gap-3 flex-1 ml-2">
            {selectedChat.business.logoImage ? (
              <Image
                src={selectedChat.business.logoImage}
                alt={selectedChat.business.name}
                width={36}
                height={36}
                className="rounded-full"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-white/50" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-white text-sm truncate">
                {selectedChat.business.name}
              </h1>
              <p className="text-xs text-white/50">{selectedChat.business.category.name}</p>
            </div>
          </div>
          <button
            onClick={onInfoClick}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <MoreVertical className="h-5 w-5 text-white/50" />
          </button>
        </>
      ) : (
        <>
          <Link href="/dashboard" className="p-2 -ml-2 rounded-lg hover:bg-white/10 transition-colors">
            <ArrowLeft className="h-5 w-5 text-white" />
          </Link>
          <h1 className="font-semibold text-white">Messages</h1>
          <div className="w-9" />
        </>
      )}
    </header>
  );
}
