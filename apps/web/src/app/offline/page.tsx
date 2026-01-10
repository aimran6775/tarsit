'use client';

import { Home, RefreshCw, WifiOff } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-white/5 flex items-center justify-center">
          <WifiOff className="w-12 h-12 text-white/40" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-4">You're Offline</h1>

        {/* Description */}
        <p className="text-white/60 mb-8">
          It looks like you've lost your internet connection. Some features may be unavailable until you reconnect.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-colors"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
        </div>

        {/* Tips */}
        <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/10">
          <h2 className="text-sm font-semibold text-white/70 mb-3">While offline, you can:</h2>
          <ul className="text-sm text-white/50 space-y-2 text-left">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              View previously loaded pages
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Access cached business information
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Queue actions to sync when online
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
