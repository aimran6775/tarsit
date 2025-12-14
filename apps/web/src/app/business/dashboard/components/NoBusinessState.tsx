'use client';

import Link from 'next/link';
import { Building2, Plus } from 'lucide-react';

export function NoBusinessState() {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center mx-auto mb-6">
        <Building2 className="h-10 w-10 text-white/30" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-3">No Business Found</h1>
      <p className="text-white/50 mb-8">
        You haven't registered a business yet. Create your business profile to start receiving bookings and messages.
      </p>
      <Link
        href="/business/register"
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25"
      >
        <Plus className="h-5 w-5" />
        Register Your Business
      </Link>
    </div>
  );
}
