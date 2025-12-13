'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Building2, Star, Edit } from 'lucide-react';
import type { Business } from '../types';

interface BusinessHeaderProps {
  business: Business;
}

export function BusinessHeader({ business }: BusinessHeaderProps) {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6">
      <div className="flex items-start gap-5">
        {business.logoImage ? (
          <Image
            src={business.logoImage}
            alt={business.name}
            width={80}
            height={80}
            className="rounded-xl object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
            <Building2 className="h-10 w-10 text-white/30" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-white">{business.name}</h1>
            {business.appointmentsEnabled && (
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/30">
                Appointments Enabled
              </span>
            )}
          </div>
          <p className="text-sm text-white/50 mb-2">
            {business.category?.name} • {business.city}, {business.state}
          </p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <span className="font-medium text-white">{business.rating?.toFixed(1) || '0.0'}</span>
              <span className="text-white/50">({business.reviewCount || 0} reviews)</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/business/${business.slug}`}
            className="px-4 py-2 text-sm font-medium text-white/70 border border-white/20 rounded-lg hover:bg-white/5 transition-colors"
          >
            View Profile
          </Link>
          <Link
            href={`/business/${business.slug}/edit`}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center gap-2 shadow-lg shadow-purple-500/25"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Link>
        </div>
      </div>
    </div>
  );
}
