'use client';

import { Camera, User } from 'lucide-react';
import Image from 'next/image';

interface DashboardHeaderProps {
  firstName?: string;
  email?: string;
  avatar?: string;
  onAvatarClick: () => void;
}

export function DashboardHeader({ firstName, email, avatar, onAvatarClick }: DashboardHeaderProps) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onAvatarClick}
              className="relative group h-16 w-16 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center overflow-hidden transition-all hover:ring-2 hover:ring-purple-500/50"
            >
              {avatar ? (
                <Image
                  src={avatar}
                  alt="Profile"
                  fill
                  sizes="64px"
                  priority
                  className="object-cover"
                />
              ) : (
                <User className="h-7 w-7 text-purple-400" />
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-5 w-5 text-white" />
              </div>
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Welcome back, {firstName || 'User'}!</h1>
              <p className="text-sm text-white/50">{email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
