export default function Loading() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="text-center">
        {/* Animated Logo/Spinner */}
        <div className="relative mx-auto w-20 h-20 mb-8">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-neutral-800" />
          {/* Spinning gradient ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 border-r-purple-500/50 animate-spin" />
          {/* Inner pulse */}
          <div className="absolute inset-4 rounded-full bg-purple-500/20 animate-pulse" />
          {/* Center dot */}
          <div className="absolute inset-[30%] rounded-full bg-purple-500" />
        </div>

        {/* Loading Text */}
        <p className="text-lg text-white font-medium mb-2">Loading</p>
        <div className="flex items-center justify-center gap-1">
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
