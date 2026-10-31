import React from 'react';

function SkeletonLoader() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in" aria-label="Loading portfolio analysis">
      {/* ScoreCard Skeleton */}
      <div className="premium-card p-6 border border-white/10 rounded-2xl bg-white/5 animate-pulse">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Circular Score Gauge */}
          <div className="w-36 h-36 rounded-full bg-white/10 flex-shrink-0" />

          {/* Profile details */}
          <div className="flex-1 w-full space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/10" />
              <div className="space-y-1.5 flex-1">
                <div className="h-5 w-40 bg-white/15 rounded-md" />
                <div className="h-3 w-24 bg-white/10 rounded-md" />
              </div>
            </div>
            <div className="h-3 w-3/4 bg-white/10 rounded-md" />
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="h-14 rounded-xl bg-white/10" />
              <div className="h-14 rounded-xl bg-white/10" />
              <div className="h-14 rounded-xl bg-white/10" />
            </div>
          </div>
        </div>
      </div>

      {/* AI Advisor Card Skeleton */}
      <div className="p-6 rounded-2xl border border-white/10 bg-white/5 animate-pulse space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="h-5 w-48 bg-white/15 rounded-md" />
          <div className="h-4 w-20 bg-white/10 rounded-full" />
        </div>
        <div className="h-14 bg-white/10 rounded-xl" />
        <div className="grid sm:grid-cols-3 gap-3 pt-2">
          <div className="h-28 rounded-xl bg-white/10" />
          <div className="h-28 rounded-xl bg-white/10" />
          <div className="h-28 rounded-xl bg-white/10" />
        </div>
      </div>

      {/* Two Column Grid Skeleton */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 animate-pulse space-y-3">
          <div className="h-5 w-32 bg-white/15 rounded-md mb-4" />
          <div className="h-16 rounded-xl bg-white/10" />
          <div className="h-16 rounded-xl bg-white/10" />
          <div className="h-16 rounded-xl bg-white/10" />
        </div>
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 animate-pulse space-y-3">
          <div className="h-5 w-32 bg-white/15 rounded-md mb-4" />
          <div className="h-56 rounded-xl bg-white/10 flex items-center justify-center" />
        </div>
      </div>
    </div>
  );
}

export default SkeletonLoader;
