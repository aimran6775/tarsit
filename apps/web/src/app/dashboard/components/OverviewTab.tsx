'use client';

import { useMessages } from '@/contexts/messages-context';
import { ArrowRight, Building2, Calendar, Clock, Heart, MapPin, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Appointment, Chat, Favorite, TabId } from '../types';

interface OverviewTabProps {
  upcomingAppointments: Appointment[];
  favorites: Favorite[];
  chats: Chat[];
  setActiveTab: (tab: TabId) => void;
}

export function OverviewTab({
  upcomingAppointments,
  favorites,
  chats,
  setActiveTab,
}: OverviewTabProps) {
  const { openChat } = useMessages();
  const nextAppointment = upcomingAppointments[0];
  const recentChats = chats.slice(0, 3);
  const recentFavorites = favorites.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Welcome Section / Next Appointment */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-2xl border border-purple-500/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-400" />
              Next Appointment
            </h2>
            {upcomingAppointments.length > 0 && (
              <button
                onClick={() => setActiveTab('appointments')}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                View all
              </button>
            )}
          </div>

          {nextAppointment ? (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {nextAppointment.business.logoImage ? (
                    <Image
                      src={nextAppointment.business.logoImage}
                      alt=""
                      width={48}
                      height={48}
                      className="object-cover h-full w-full"
                    />
                  ) : (
                    <Building2 className="h-6 w-6 text-white/40" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-white">{nextAppointment.business.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-white/60 mt-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {new Date(nextAppointment.appointmentDate).toLocaleDateString()} at{' '}
                      {nextAppointment.startTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/60 mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>
                      {nextAppointment.business.city}, {nextAppointment.business.state}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-white/50 text-sm mb-4">No upcoming appointments</p>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium text-white transition-colors"
              >
                Book an appointment
              </Link>
            </div>
          )}
        </div>

        <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-emerald-400" />
              Recent Messages
            </h2>
            <button
              onClick={() => setActiveTab('messages')}
              className="text-xs text-white/50 hover:text-white transition-colors"
            >
              View all
            </button>
          </div>

          {recentChats.length > 0 ? (
            <div className="space-y-3">
              {recentChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => openChat(chat.id)}
                  className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors group text-left"
                >
                  <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                    {chat.business.logoImage ? (
                      <Image
                        src={chat.business.logoImage}
                        alt=""
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    ) : (
                      <Building2 className="h-4 w-4 text-white/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-purple-400 transition-colors">
                      {chat.business.name}
                    </p>
                    <p className="text-xs text-white/40 truncate">Click to view conversation</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-white/60" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-white/50 text-sm">No messages yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Favorites Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-400" />
            Saved Places
          </h2>
          {favorites.length > 0 && (
            <button
              onClick={() => setActiveTab('favorites')}
              className="text-xs text-white/50 hover:text-white transition-colors"
            >
              View all
            </button>
          )}
        </div>

        {favorites.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentFavorites.map((fav) => (
              <Link
                key={fav.id}
                href={`/business/${fav.business.slug}`}
                className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all"
              >
                <div className="aspect-video relative bg-neutral-800">
                  {fav.business.coverImage ? (
                    <Image src={fav.business.coverImage} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-white/20" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-white truncate group-hover:text-purple-400 transition-colors">
                    {fav.business.name}
                  </h3>
                  <p className="text-xs text-white/50 truncate">
                    {fav.business.city}, {fav.business.state}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white/5 rounded-xl border border-white/10 p-8 text-center">
            <p className="text-white/50 text-sm mb-4">You haven't saved any businesses yet</p>
            <Link
              href="/search"
              className="text-purple-400 hover:text-purple-300 text-sm font-medium"
            >
              Explore businesses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
