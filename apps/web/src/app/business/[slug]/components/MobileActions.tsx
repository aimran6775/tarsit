'use client';

import { Calendar, MessageCircle } from 'lucide-react';

interface MobileActionsProps {
  appointmentsEnabled: boolean;
  onOpenBooking: () => void;
  onOpenChat: () => void;
}

export function MobileActions({ appointmentsEnabled, onOpenBooking, onOpenChat }: MobileActionsProps) {
  return (
    <div className="lg:hidden flex gap-3">
      {appointmentsEnabled && (
        <button 
          onClick={onOpenBooking}
          className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          Book Now
        </button>
      )}
      <button 
        onClick={onOpenChat}
        className="flex-1 h-12 border border-white/20 bg-white/5 backdrop-blur-sm text-white rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
      >
        <MessageCircle className="h-4 w-4" />
        Message
      </button>
    </div>
  );
}
