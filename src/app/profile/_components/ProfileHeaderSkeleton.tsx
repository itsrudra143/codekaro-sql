function ProfileHeaderSkeleton() {
  return (
    <div
      className="relative mb-8 bg-gradient-to-br from-[#12121a] to-[#1a1a2e] rounded-2xl p-6 sm:p-8 border
     border-gray-800/50 overflow-hidden animate-pulse"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:32px_32px] [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)] opacity-50" />

      <div className="relative flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
        {/* Avatar Skeleton */}
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-700/60 border-4 border-gray-800/60" />
          {/* Optional: Pro Badge Skeleton */}
          {/* <div className="absolute -top-1 -right-1 sm:top-0 sm:right-0 w-6 h-6 sm:w-8 sm:h-8 bg-gray-700/80 rounded-full border-2 border-gray-900/50" /> */}
        </div>

        {/* User Info Skeleton */}
        <div className="space-y-2 text-center sm:text-left">
          <div className="h-7 sm:h-8 w-40 sm:w-48 bg-gray-700/60 rounded-lg mx-auto sm:mx-0" />
          <div className="h-5 w-48 sm:w-56 bg-gray-700/60 rounded-md mx-auto sm:mx-0" />
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-black/30 border border-white/5"
          >
            <div className="space-y-4">
              {/* Stat Header Skeleton */}
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1 mr-4">
                  <div className="h-4 w-2/5 bg-gray-700/60 rounded" />
                  <div className="h-6 sm:h-7 w-1/3 bg-gray-700/60 rounded-md" />
                  <div className="h-3 w-3/5 bg-gray-700/60 rounded" />
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gray-700/60 flex-shrink-0" />
              </div>

              {/* Stat Footer Skeleton */}
              <div className="pt-3 sm:pt-4 border-t border-gray-800/50 flex items-center gap-2">
                <div className="h-4 w-4 bg-gray-700/60 rounded-full flex-shrink-0" />
                <div className="h-4 w-1/4 bg-gray-700/60 rounded" />
                <div className="h-4 w-1/3 bg-gray-700/60 rounded ml-1" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProfileHeaderSkeleton; 