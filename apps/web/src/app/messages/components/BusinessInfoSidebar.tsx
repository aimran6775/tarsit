'use client';

import Link from 'next/link';
import Image from 'next/image';
import { X, Building2, MapPin, Phone, Mail, Calendar, ChevronRight } from 'lucide-react';
import { Chat } from '../types';

interface BusinessInfoSidebarProps {
  chat: Chat;
  isOpen: boolean;
  onClose: () => void;
}

export function BusinessInfoSidebar({ chat, isOpen, onClose }: BusinessInfoSidebarProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-neutral-900 border-l border-white/10 shadow-xl animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="font-semibold text-white">Business Info</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5 text-white/50" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Business Card */}
          <div className="text-center">
            {chat.business.logoImage ? (
              <Image
                src={chat.business.logoImage}
                alt={chat.business.name}
                width={80}
                height={80}
                className="rounded-full mx-auto mb-4"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-white/50" />
              </div>
            )}
            <h4 className="font-semibold text-white text-lg">{chat.business.name}</h4>
            <p className="text-sm text-white/50">{chat.business.category.name}</p>
          </div>
          
          {/* Contact Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
              <MapPin className="h-5 w-5 text-white/40" />
              <span className="text-sm text-white/70">
                {chat.business.city}, {chat.business.state}
              </span>
            </div>
            {chat.business.phone && (
              <a
                href={`tel:${chat.business.phone}`}
                className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
              >
                <Phone className="h-5 w-5 text-white/40" />
                <span className="text-sm text-white/70">{chat.business.phone}</span>
              </a>
            )}
            {chat.business.email && (
              <a
                href={`mailto:${chat.business.email}`}
                className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
              >
                <Mail className="h-5 w-5 text-white/40" />
                <span className="text-sm text-white/70">{chat.business.email}</span>
              </a>
            )}
          </div>
          
          {/* Actions */}
          <div className="space-y-2">
            <Link
              href={`/business/${chat.business.slug}`}
              className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25"
            >
              <span className="text-sm font-medium">View Business Page</span>
              <ChevronRight className="h-5 w-5" />
            </Link>
            <Link
              href={`/business/${chat.business.slug}#book`}
              className="flex items-center justify-between p-3 border border-white/20 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-white/50" />
                <span className="text-sm font-medium text-white/70">Book Appointment</span>
              </div>
              <ChevronRight className="h-5 w-5 text-white/40" />
            </Link>
          </div>
          
          {/* Chat Started */}
          <div className="pt-4 border-t border-white/10">
            <p className="text-xs text-white/40 text-center">
              Conversation started {new Date(chat.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
