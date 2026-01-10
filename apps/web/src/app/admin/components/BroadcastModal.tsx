'use client';

import {
  AlertCircle,
  Bell,
  Building2,
  CheckCircle,
  ChevronDown,
  Clock,
  Globe,
  Mail,
  Megaphone,
  MessageSquare,
  Send,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import type { BroadcastMessage } from '../types';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (message: BroadcastMessage) => void;
}

export function BroadcastModal({ isOpen, onClose, onSend }: BroadcastModalProps) {
  const [message, setMessage] = useState<Partial<BroadcastMessage>>({
    title: '',
    content: '',
    type: 'info',
    recipients: 'all',
    channels: ['in_app'],
    scheduledAt: null,
  });

  const [showSchedule, setShowSchedule] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!message.title || !message.content) return;

    setSending(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onSend({
      id: Date.now().toString(),
      title: message.title,
      content: message.content!,
      type: message.type || 'info',
      recipients: message.recipients || 'all',
      channels: message.channels || ['in_app'],
      scheduledAt: showSchedule ? message.scheduledAt : null,
      sentAt: showSchedule ? null : new Date().toISOString(),
      createdBy: 'admin',
      createdAt: new Date().toISOString(),
      status: showSchedule ? 'scheduled' : 'sent',
    });
    setSending(false);
    setSent(true);
    setTimeout(() => {
      setSent(false);
      onClose();
      setMessage({
        title: '',
        content: '',
        type: 'info',
        recipients: 'all',
        channels: ['in_app'],
        scheduledAt: null,
      });
    }, 2000);
  };

  const toggleChannel = (channel: string) => {
    const channels = message.channels || [];
    if (channels.includes(channel)) {
      setMessage({ ...message, channels: channels.filter((c) => c !== channel) });
    } else {
      setMessage({ ...message, channels: [...channels, channel] });
    }
  };

  const typeColors = {
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
    alert: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-neutral-900 rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20">
              <Megaphone className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Broadcast Message</h2>
              <p className="text-sm text-white/50">Send a message to all or selected users</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-white/50">
            <X className="h-5 w-5" />
          </button>
        </div>

        {sent ? (
          <div className="p-12 text-center">
            <CheckCircle className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
            <p className="text-white/50">Your broadcast has been delivered successfully.</p>
          </div>
        ) : (
          <>
            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Title</label>
                <input
                  type="text"
                  value={message.title}
                  onChange={(e) => setMessage({ ...message, title: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="Enter broadcast title..."
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Message</label>
                <textarea
                  value={message.content}
                  onChange={(e) => setMessage({ ...message, content: e.target.value })}
                  className="w-full h-32 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                  placeholder="Enter your message here..."
                />
                <p className="text-xs text-white/40 mt-1">
                  {message.content?.length || 0} / 500 characters
                </p>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Message Type</label>
                <div className="flex flex-wrap gap-2">
                  {(['info', 'success', 'warning', 'error'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setMessage({ ...message, type })}
                      className={`px-4 py-2 rounded-lg border capitalize transition-all ${
                        message.type === type
                          ? typeColors[type]
                          : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Audience */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Target Audience
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setMessage({ ...message, recipients: 'all' })}
                    className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                      message.recipients === 'all'
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    <Globe className="h-6 w-6" />
                    <span className="text-sm font-medium">All Users</span>
                  </button>
                  <button
                    onClick={() => setMessage({ ...message, recipients: 'users' })}
                    className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                      message.recipients === 'users'
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    <Users className="h-6 w-6" />
                    <span className="text-sm font-medium">Users Only</span>
                  </button>
                  <button
                    onClick={() => setMessage({ ...message, recipients: 'businesses' })}
                    className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                      message.recipients === 'businesses'
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    <Building2 className="h-6 w-6" />
                    <span className="text-sm font-medium">Businesses</span>
                  </button>
                </div>
              </div>

              {/* Channels */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Delivery Channels
                </label>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => toggleChannel('in_app')}
                    className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
                      message.channels?.includes('in_app')
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    <Bell className="h-4 w-4" />
                    In-App
                  </button>
                  <button
                    onClick={() => toggleChannel('email')}
                    className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
                      message.channels?.includes('email')
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </button>
                  <button
                    onClick={() => toggleChannel('push')}
                    className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
                      message.channels?.includes('push')
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Push
                  </button>
                </div>
              </div>

              {/* Schedule */}
              <div>
                <button
                  onClick={() => setShowSchedule(!showSchedule)}
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                >
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Schedule for later</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${showSchedule ? 'rotate-180' : ''}`}
                  />
                </button>

                {showSchedule && (
                  <div className="mt-4 p-4 bg-white/5 rounded-xl">
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Schedule Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={message.scheduledAt || ''}
                      onChange={(e) => setMessage({ ...message, scheduledAt: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>
                )}
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Preview</label>
                <div className={`p-4 rounded-xl border ${typeColors[message.type || 'info']}`}>
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 mt-0.5" />
                    <div>
                      <p className="font-semibold">{message.title || 'Message Title'}</p>
                      <p className="text-sm opacity-80 mt-1">
                        {message.content || 'Your message will appear here...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-white/10">
              <button
                onClick={onClose}
                className="h-12 px-6 rounded-xl bg-white/5 border border-white/10 text-white/70 font-medium hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!message.title || !message.content || sending}
                className="h-12 px-8 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {sending ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    {showSchedule && message.scheduledAt ? 'Schedule' : 'Send Now'}
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
