'use client';

import { Calendar, Heart, MessageCircle, Share2 } from 'lucide-react';
import { BusinessDetail } from '../types';

interface ActionsSidebarProps {
  business: BusinessDetail;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  onOpenBooking: () => void;
  onOpenChat: () => void;
  primaryCta?: 'book' | 'message';
}

export function ActionsSidebar({
  business,
  isFavorited,
  onToggleFavorite,
  onOpenBooking,
  onOpenChat,
  primaryCta,
}: ActionsSidebarProps) {
  const canBook = business.appointmentsEnabled;
  const canMessage = business.messagingEnabled !== false;
  const effectivePrimary: 'book' | 'message' =
    primaryCta === 'message' && canMessage ? 'message' : 'book';

  const primaryButtonClass =
    'w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2';
  const secondaryButtonClass =
    'w-full h-12 border border-white/20 bg-white/5 text-white rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2';

  return (
    <div className="hidden lg:block bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 space-y-3 sticky top-24">
      {canBook && effectivePrimary === 'book' && (
        <button onClick={onOpenBooking} className={primaryButtonClass}>
          <Calendar className="h-4 w-4" />
          Book Appointment
        </button>
      )}

      {canMessage && effectivePrimary === 'message' && (
        <button onClick={onOpenChat} className={primaryButtonClass}>
          <MessageCircle className="h-4 w-4" />
          Send Message
        </button>
      )}

      {canBook && effectivePrimary !== 'book' && (
        <button onClick={onOpenBooking} className={secondaryButtonClass}>
          <Calendar className="h-4 w-4" />
          Book Appointment
        </button>
      )}

      {canMessage && effectivePrimary !== 'message' && (
        <button onClick={onOpenChat} className={secondaryButtonClass}>
          <MessageCircle className="h-4 w-4" />
          Send Message
        </button>
      )}
      <div className="flex gap-2">
        <button
          onClick={onToggleFavorite}
          className={`flex-1 h-11 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            isFavorited
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'border border-white/20 text-white/70 hover:bg-white/5'
          }`}
        >
          <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
          {isFavorited ? 'Saved' : 'Save'}
        </button>
        <button
          onClick={() => navigator.share?.({ url: window.location.href, title: business.name })}
          className="flex-1 h-11 border border-white/20 text-white/70 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
      </div>
    </div>
  );
}
