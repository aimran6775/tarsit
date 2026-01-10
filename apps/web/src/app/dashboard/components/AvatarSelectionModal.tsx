'use client';

import { Check, X } from 'lucide-react';
import Image from 'next/image';

interface AvatarSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (avatarUrl: string) => void;
  currentAvatar?: string;
}

const AVATAR_OPTIONS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Ruby',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Daisy',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Oscar',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Lily',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=George',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Harry',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Amelia',
];

export function AvatarSelectionModal({
  isOpen,
  onClose,
  onSelect,
  currentAvatar,
}: AvatarSelectionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Choose your avatar</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {AVATAR_OPTIONS.map((avatar, index) => (
              <button
                key={index}
                onClick={() => onSelect(avatar)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group ${
                  currentAvatar === avatar
                    ? 'border-purple-500 ring-2 ring-purple-500/20'
                    : 'border-transparent hover:border-white/20'
                }`}
              >
                <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors" />
                <Image
                  src={avatar}
                  alt={`Avatar option ${index + 1}`}
                  fill
                  className="object-cover p-2"
                />
                {currentAvatar === avatar && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                    <div className="bg-purple-500 rounded-full p-1">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-white/10 bg-white/5 rounded-b-2xl">
          <p className="text-sm text-white/50 text-center">
            Select an avatar to update your profile picture instantly.
          </p>
        </div>
      </div>
    </div>
  );
}
