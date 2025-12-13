'use client';

import { Sparkles, MessageCircle, Calendar, Heart, Star } from 'lucide-react';

export function CustomerSignupVisual() {
  const benefits = [
    {
      icon: Sparkles,
      title: 'Discover Services',
      description: 'Find the perfect local businesses',
      color: 'purple',
    },
    {
      icon: MessageCircle,
      title: 'Direct Chat',
      description: 'Message businesses instantly',
      color: 'violet',
    },
    {
      icon: Calendar,
      title: 'Easy Booking',
      description: 'Schedule appointments in seconds',
      color: 'indigo',
    },
    {
      icon: Heart,
      title: 'Save Favorites',
      description: 'Keep track of loved businesses',
      color: 'pink',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
          <Star className="h-4 w-4 text-purple-400" />
          <span className="text-sm text-purple-300">Join 50,000+ happy customers</span>
        </div>
        
        <h2 className="text-4xl font-bold text-white mb-4">
          Start your
          <br />
          <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
            local journey
          </span>
        </h2>
        <p className="text-neutral-400 text-lg">
          Create your free account in under a minute
        </p>
      </div>

      {/* Benefits grid */}
      <div className="grid grid-cols-2 gap-4">
        {benefits.map((benefit) => (
          <div
            key={benefit.title}
            className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-purple-500/30 transition-all duration-300 group"
          >
            <div className={`w-10 h-10 rounded-lg bg-${benefit.color}-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
              <benefit.icon className={`h-5 w-5 text-${benefit.color}-400`} />
            </div>
            <h3 className="text-white font-medium text-sm mb-1">{benefit.title}</h3>
            <p className="text-neutral-500 text-xs">{benefit.description}</p>
          </div>
        ))}
      </div>

      {/* Trust badge */}
      <div className="flex items-center justify-center gap-4 pt-4">
        <div className="flex -space-x-2">
          {['EM', 'JD', 'AK', 'SR'].map((initials, i) => (
            <div
              key={initials}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white text-xs font-medium border-2 border-neutral-950"
              style={{ zIndex: 4 - i }}
            >
              {initials}
            </div>
          ))}
        </div>
        <div className="text-sm">
          <span className="text-white font-medium">4.9/5</span>
          <span className="text-neutral-500"> from 12,000+ reviews</span>
        </div>
      </div>
    </div>
  );
}
