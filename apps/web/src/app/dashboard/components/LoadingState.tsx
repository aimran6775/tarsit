'use client';

export function LoadingState() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mx-auto w-16 h-16 mb-4">
          <div className="w-16 h-16 rounded-full border-4 border-white/10"></div>
          <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-sm text-white/50">Loading your dashboard...</p>
      </div>
    </div>
  );
}
