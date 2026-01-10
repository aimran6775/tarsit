'use client';

import { X, Send, Loader2 } from 'lucide-react';

interface ChatModalProps {
  businessName: string;
  isOpen: boolean;
  onClose: () => void;
  message: string;
  setMessage: (msg: string) => void;
  isSending: boolean;
  onSend: () => void;
}

export function ChatModal({
  businessName,
  isOpen,
  onClose,
  message,
  setMessage,
  isSending,
  onSend,
}: ChatModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
      <div className="bg-neutral-900 border border-white/10 rounded-t-3xl md:rounded-2xl w-full max-w-lg animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h3 className="text-lg font-semibold text-white">Send Message</h3>
            <p className="text-sm text-white/50">to {businessName}</p>
          </div>
          <button 
            onClick={onClose}
            className="h-10 w-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5 text-white/50" />
          </button>
        </div>

        <div className="p-6">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message here..."
            className="w-full px-4 py-3 border border-white/10 bg-white/5 rounded-xl text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:border-purple-500/50 transition-colors"
            rows={5}
            autoFocus
          />
          
          <button
            onClick={onSend}
            disabled={!message.trim() || isSending}
            className="w-full mt-4 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-purple-500 hover:to-indigo-500 disabled:from-neutral-700 disabled:to-neutral-700 disabled:text-white/30 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/25 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Message
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
