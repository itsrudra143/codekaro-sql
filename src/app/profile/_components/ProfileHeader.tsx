import {
  Activity,
  Code2,
  Star,
  Timer,
  TrendingUp,
  Trophy,
  UserIcon,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { UserResource } from "@clerk/types";
import Image from "next/image";
import { UserData, UserStats, Snippet } from "@/types";
import { useEffect, useState } from "react";

interface ProfileHeaderProps {
  userStats: UserStats | null;
  userData: UserData | null;
  user: UserResource;
  isPro: boolean;
}

function ProfileHeader({ userStats, userData, user, isPro }: ProfileHeaderProps) {
  const starredCount = userStats?.totalStars ?? 0;

  const STATS_CONFIG = [
    {
      label: "Code Executions",
      getValue: (stats: UserStats | null) => stats?.totalExecutions ?? 0,
      icon: Activity,
      color: "from-blue-500 to-cyan-500",
      gradient: "group-hover:via-blue-400",
      description: "Total code runs",
      metric: {
        label: "Last 24h",
        getValue: (stats: UserStats | null) => stats?.last24Hours ?? 0,
        icon: Timer,
      },
    },
    {
      label: "Starred Snippets",
      getValue: () => starredCount,
      icon: Star,
      color: "from-yellow-500 to-orange-500",
      gradient: "group-hover:via-yellow-400",
      description: "Saved for later",
      metric: {
        label: "Most starred lang",
        getValue: (stats: UserStats | null) => stats?.mostStarredLanguage ?? "N/A",
        icon: Trophy,
      },
    },
    {
      label: "Languages Used",
      getValue: (stats: UserStats | null) => stats?.languagesUsed?.length ?? 0,
      icon: Code2,
      color: "from-purple-500 to-pink-500",
      gradient: "group-hover:via-purple-400",
      description: "Different languages",
      metric: {
        label: "Most used lang",
        getValue: (stats: UserStats | null) => stats?.favoriteLanguage ?? "N/A",
        icon: TrendingUp,
      },
    },
  ];

  if (!userData || !userStats) {
    return null; 
  }

  return (
    <div
      className="relative mb-8 bg-gradient-to-br from-[#12121a] to-[#1a1a2e] rounded-2xl p-6 sm:p-8 border
     border-gray-800/50 overflow-hidden shadow-lg shadow-black/30"
    >
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:32px_32px] [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]" />
      
      <div className="relative flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
        <div className="relative group flex-shrink-0">
          <div
            className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full 
          blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"
          />
          <Image
            width={80}
            height={80}
            src={user.imageUrl || "/default-avatar.png"}
            alt="Profile Picture"
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-gray-800/60 relative z-10 group-hover:scale-105 transition-transform duration-300 bg-gray-700"
          />
          {isPro && (
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="absolute -top-1 -right-1 sm:top-0 sm:right-0 bg-gradient-to-r from-purple-500 to-purple-600 p-1.5 sm:p-2
             rounded-full z-20 shadow-md border-2 border-gray-900/50"
            >
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </motion.div>
          )}
        </div>
        <div className="text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-x-3 gap-y-1 mb-1 sm:mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white truncate max-w-xs sm:max-w-md">
              {userData.name}
            </h1>
            {isPro && (
              <span className="flex-shrink-0 px-2.5 py-0.5 bg-purple-500/10 text-purple-400 rounded-full text-xs sm:text-sm font-medium">
                Pro Member
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm flex items-center justify-center sm:justify-start gap-2 truncate max-w-xs sm:max-w-md">
            <UserIcon className="w-3.5 h-3.5 flex-shrink-0" />
            {userData.email}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-8">
        {STATS_CONFIG.map((stat, index) => {
          const value = stat.getValue(userStats);
          const metricValue = stat.metric.getValue(userStats);
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              key={index}
              className="group relative bg-gradient-to-br from-black/40 via-black/30 to-black/20 rounded-xl sm:rounded-2xl overflow-hidden border border-white/5"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-10 transition-all 
              duration-500 ${stat.gradient} blur-md`}
              />

              <div className="relative p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="min-w-0">
                     <p className="text-sm font-medium text-gray-400 mb-1">
                      {stat.label}
                    </p>
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
                      {typeof value === "number"
                        ? value.toLocaleString()
                        : value}
                    </h3>
                   <p className="text-xs text-gray-500 mt-1 truncate">
                      {stat.description}
                    </p>
                  </div>
                  <div
                    className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10 flex-shrink-0 ml-2`}
                  >
                    <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 sm:pt-4 border-t border-gray-800/50">
                  <stat.metric.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-400">
                    {stat.metric.label}:
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-white truncate">
                    {metricValue}
                  </span>
                </div>
              </div>

              <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full duration-700 transition-transform ease-in-out opacity-50" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
export default ProfileHeader; 