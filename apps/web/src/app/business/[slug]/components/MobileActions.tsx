'use client';

import { Calendar, MessageCircle } from 'lucide-react';

interface MobileActionsProps {
  appointmentsEnabled: boolean;
  messagingEnabled: boolean;
  primaryCta?: 'book' | 'message';
  onOpenBooking: () => void;
  onOpenChat: () => void;
}

export function MobileActions({
  appointmentsEnabled,
  messagingEnabled,
  primaryCta,
  onOpenBooking,
  onOpenChat,
}: MobileActionsProps) {
  const canBook = appointmentsEnabled;
  const canMessage = messagingEnabled;

  const effectivePrimary: 'book' | 'message' =
    primaryCta === 'message' && canMessage ? 'message' : 'book';

  const primaryButtonClass =
    'flex-1 h-14 sm:h-12 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-base sm:text-sm font-semibold hover:from-purple-500 hover:to-indigo-500 active:from-purple-700 active:to-indigo-700 transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 active:scale-[0.98]';
  const secondaryButtonClass =
    'flex-1 h-14 sm:h-12 border border-white/20 bg-white/5 backdrop-blur-sm text-white rounded-xl text-base sm:text-sm font-semibold hover:bg-white/10 active:bg-white/15 transition-colors flex items-center justify-center gap-2 active:scale-[0.98]';

  return (
    <div className="lg:hidden flex gap-3">
      {canBook && effectivePrimary === 'book' && (
        <button onClick={onOpenBooking} className={primaryButtonClass}>
          <Calendar className="h-4 w-4" />
          Book Now
        </button>
      )}

      {canMessage && effectivePrimary === 'message' && (
        <button onClick={onOpenChat} className={primaryButtonClass}>
          <MessageCircle className="h-4 w-4" />
          Message
        </button>
      )}

      {canBook && effectivePrimary !== 'book' && (
        <button onClick={onOpenBooking} className={secondaryButtonClass}>
          <Calendar className="h-4 w-4" />
          Book Now
        </button>
      )}

      {canMessage && effectivePrimary !== 'message' && (
        <button onClick={onOpenChat} className={secondaryButtonClass}>
          <MessageCircle className="h-4 w-4" />
          Message
        </button>
      )}
    </div>
  );
}
