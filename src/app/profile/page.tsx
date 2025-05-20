"use client";
import { useUser } from "@clerk/nextjs";
// import { usePaginatedQuery, useQuery } from "convex/react"; // Replace
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react"; // Add useEffect
// import { api } from "../../../convex/_generated/api"; // Replace
import NavigationHeader from "@/components/NavigationHeader"; // Assume exists
import ProfileHeader from "./_components/ProfileHeader"; // Will create
import ProfileHeaderSkeleton from "./_components/ProfileHeaderSkeleton"; // Will create
import {
  ChevronRight,
  Code,
  ListVideo,
  Loader2,
  Star,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import StarButton from "@/components/StarButton"; // Will create
import CodeBlock from "@/app/snippets/[id]/_components/CodeBlock"; // Reuse existing CodeBlock
import { Snippet, CodeExecution, UserData, UserStats } from "@/types"; // Assume types exist
import toast from "react-hot-toast"; // Import toast
import SnippetCard from "@/app/snippets/_components/SnippetCard"; // Import SnippetCard
import { useUserStatusStore } from "@/store/useUserStatusStore"; // Corrected path

const TABS = [
  {
    id: "executions",
    label: "Code Executions",
    icon: ListVideo,
  },
  {
    id: "starred",
    label: "Starred Snippets",
    icon: Star,
  },
];

function ProfilePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"executions" | "starred">(
    "executions"
  );

  // --- State for fetched data ---
  const [userData, setUserData] = useState<UserData | null | undefined>(undefined);
  const [userStats, setUserStats] = useState<UserStats | null | undefined>(
    undefined
  );
  const [starredSnippets, setStarredSnippets] = useState<
    Snippet[] | null | undefined
  >(undefined);
  const [executions, setExecutions] = useState<CodeExecution[] | null | undefined>(
    undefined
  );
  // Combined loading state for initial profile load
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  // Separate loading state for loading more executions
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [executionPagination, setExecutionPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 5, // Default limit
    canLoadMore: false,
  });
  const [error, setError] = useState<string | null>(null); // Combined error state

  // --- Data Fetching Logic ---
  const { fetchUserProStatus, clearProStatus } = useUserStatusStore(); // Get store actions

  useEffect(() => {
    if (!user?.id) {
      if (isLoaded) {
        router.push("/");
      }
      clearProStatus(); // Clear pro status if no user ID
      return;
    }

    fetchUserProStatus(user.id); // Fetch pro status from store action

    const initialFetch = async () => {
      setIsLoadingProfile(true);
      setError(null);
      try {
        const userId = user.id;
        // Fetch stats, starred snippets, and first page of executions in parallel
        // Pro status is now handled by useUserStatusStore, so removed proStatusRes
        const [statsRes, starredRes, execRes] = await Promise.all([
          fetch(`/api/users/${userId}/stats`),
          fetch(`/api/users/${userId}/starred-snippets`),
          fetch(`/api/users/${userId}/executions?page=1&limit=${executionPagination.limit}`),
        ]);

        // Check responses
        if (!statsRes.ok) throw new Error("Failed to load user stats");
        if (!starredRes.ok) throw new Error("Failed to load starred snippets");
        if (!execRes.ok) throw new Error("Failed to load code executions");

        // Parse data
        const statsData: UserStats = await statsRes.json();
        const starredData: Snippet[] = await starredRes.json();
        const execData: { executions: CodeExecution[], pagination: typeof executionPagination } = await execRes.json();

        // isPro is now from the store, directly used by ProfileHeader
        // Construct UserData from Clerk user object
        const currentData: UserData = {
          id: userId,
          userId: userId,
          email: user.primaryEmailAddress?.emailAddress || "",
          name: user.fullName || "User",
          isPro: useUserStatusStore.getState().isPro || false, // Get current isPro from store for UserData if needed elsewhere
          createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
          updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
        };
        setUserData(currentData);

        // Update state
        setUserStats(statsData);
        // Convert dates for starred snippets
        setStarredSnippets(starredData.map(s => ({ ...s, createdAt: new Date(s.createdAt), updatedAt: new Date(s.updatedAt) })));
        // Convert dates for executions
        setExecutions(execData.executions.map(e => ({ ...e, createdAt: new Date(e.createdAt), updatedAt: new Date(e.updatedAt) })));
        setExecutionPagination(execData.pagination);

      } catch (err) {
        console.error("Error fetching profile data:", err);
        const message = err instanceof Error ? err.message : "An unknown error occurred";
        setError(message);
        toast.error(`Error loading profile: ${message}`);
        // Reset states on error
        setUserData(null);
        setUserStats(null);
        setStarredSnippets(null);
        setExecutions(null);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    initialFetch();
  }, [user?.id, isLoaded, router, executionPagination.limit]); // Rerun if user or limit changes

  const handleDeleteStarredSnippet = (deletedSnippetId: string) => {
    setStarredSnippets((prevSnippets) =>
      prevSnippets ? prevSnippets.filter(snippet => snippet.id !== deletedSnippetId) : null
    );
  };

  // --- Load More Executions ---
  const loadMoreExecutions = async () => {
    if (!user?.id || !executionPagination.canLoadMore || isLoadingMore) return;

    setIsLoadingMore(true);
    const nextPage = executionPagination.currentPage + 1;
    try {
      const res = await fetch(`/api/users/${user.id}/executions?page=${nextPage}&limit=${executionPagination.limit}`);
      if (!res.ok) {
        throw new Error("Failed to load more executions");
      }
      const data: { executions: CodeExecution[], pagination: typeof executionPagination } = await res.json();
      // Convert dates for new executions
      const newExecutions = data.executions.map(e => ({ ...e, createdAt: new Date(e.createdAt), updatedAt: new Date(e.updatedAt) }));
      setExecutions(prev => [...(prev || []), ...newExecutions]);
      setExecutionPagination(data.pagination);
    } catch (err) {
      console.error("Error loading more executions:", err);
      const message = err instanceof Error ? err.message : "An unknown error occurred";
      toast.error(message);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // --- Render Logic --- 

  // Handle initial loading state (includes Clerk's isLoaded check)
  if (isLoadingProfile || !isLoaded) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <NavigationHeader />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <ProfileHeaderSkeleton />
          {/* Skeleton for Tab Content Area */}
          <div className="mt-8 h-96 bg-gradient-to-br from-[#12121a]/50 to-[#1a1a2e]/50 rounded-3xl border border-gray-800/50 animate-pulse" />
        </div>
      </div>
    );
  }

  // Handle error state or missing user data after loading
  if (error || !user || !userData || !userStats) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <NavigationHeader />
        <div className="text-center text-red-400 py-20 px-4">
          <p className="text-xl font-semibold mb-2">Error Loading Profile</p>
          <p>{error || "Could not load profile data."}</p>
        </div>
      </div>
    );
  }

  // --- Main Render --- 
  // Now that we've passed the !isLoaded check, user object should be available
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <NavigationHeader />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Profile Header - Render only when user and data are loaded */}
        <ProfileHeader
          userStats={userStats}
          userData={userData}
          user={user} // Pass the loaded Clerk user object
        />

        {/* Tabs & Content */}
        <div
          className="mt-8 bg-gradient-to-br from-[#12121a] to-[#1a1a2e] rounded-3xl shadow-2xl 
        shadow-black/50 border border-gray-800/50 backdrop-blur-xl overflow-hidden"
        >
          {/* Tabs */}
          <div className="border-b border-gray-800/50">
            <div className="flex space-x-1 p-4 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(tab.id as "executions" | "starred")
                  }
                  className={`group flex-shrink-0 flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg transition-all duration-200 relative overflow-hidden ${activeTab === tab.id
                    ? "text-blue-400"
                    : "text-gray-400 hover:text-gray-300"
                    }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-blue-500/10 rounded-lg"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                  <tab.icon className="w-4 h-4 relative z-10 flex-shrink-0" />
                  <span className="text-sm font-medium relative z-10">
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab} // Animate when tab changes
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-4 sm:p-6"
            >
              {/* --- Executions Tab --- */}
              {activeTab === "executions" && (
                <div className="space-y-6">
                  {/* Map over executions */}
                  {executions?.map((execution) => {
                    // Consistent Date Formatting
                    const executionDate = new Date(execution.createdAt);
                    const formattedDate = executionDate.toLocaleDateString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric'
                    });
                    const formattedTime = executionDate.toLocaleTimeString(undefined, {
                      hour: 'numeric', minute: '2-digit'
                    });

                    return (
                      <div
                        key={execution.id}
                        className="group rounded-xl overflow-hidden transition-all duration-300 border border-gray-800/50 hover:border-blue-500/30 hover:shadow-md hover:shadow-blue-500/10"
                      >
                        {/* Execution Header */}
                        <div className="flex items-center justify-between p-3 sm:p-4 bg-black/30 rounded-t-xl">
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className="relative flex-shrink-0">
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-10 group-hover:opacity-20 transition-opacity" />
                              <Image
                                src={`/${execution.language}.png`} // Assumes /public folder
                                alt={execution.language}
                                className="rounded-lg relative z-10 object-contain size-8 sm:size-10"
                                width={40}
                                height={40}
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            </div>
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center flex-wrap gap-x-2">
                                <span className="text-sm font-medium text-white truncate">
                                  {execution.language.charAt(0).toUpperCase() +
                                    execution.language.slice(1)}
                                </span>
                                <span className="text-xs text-gray-500 hidden sm:inline">
                                  •
                                </span>
                                <span className="text-xs text-gray-500" title={executionDate.toISOString()}>
                                  {formattedDate} {formattedTime} {/* Use consistent format */}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${execution.error
                              ? "bg-red-500/10 text-red-400"
                              : "bg-green-500/10 text-green-400"
                              }`}
                          >
                            {execution.error ? "Error" : "Success"}
                          </span>
                        </div>
                        {/* Code and Output */}
                        <div className="p-3 sm:p-4 bg-black/20 rounded-b-xl border-t border-gray-800/50">
                          <CodeBlock
                            code={execution.code}
                            language={execution.language}
                          />
                          {(execution.output || execution.error) && (
                            <div className="mt-4 p-3 sm:p-4 rounded-lg bg-black/40 border border-gray-700/50">
                              <h4 className="text-xs sm:text-sm font-medium text-gray-400 mb-2">
                                Output / Error
                              </h4>
                              <pre
                                className={`text-xs sm:text-sm font-mono whitespace-pre-wrap break-all ${execution.error
                                  ? "text-red-400"
                                  : "text-gray-300"
                                  }`}
                              >
                                {execution.error || execution.output}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Loading More Spinner */}
                  {isLoadingMore && (
                    <div className="text-center py-6">
                      <Loader2 className="w-6 h-6 text-gray-500 mx-auto animate-spin" />
                    </div>
                  )}

                  {/* Empty State for Executions */}
                  {!isLoadingProfile && !isLoadingMore && executions?.length === 0 && (
                    <div className="text-center py-12">
                      <Code className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-400 mb-2">
                        No code executions yet
                      </h3>
                      <p className="text-gray-500">
                        Run some code in the dashboard to see history here.
                      </p>
                    </div>
                  )}

                  {/* Load More Button */}
                  {executionPagination.canLoadMore && !isLoadingMore && (
                    <div className="flex justify-center mt-8">
                      <button
                        onClick={loadMoreExecutions}
                        className="px-6 py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg flex items-center gap-2 
                        transition-colors"
                      >
                        Load More
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* --- Starred Snippets Tab --- */}
              {activeTab === "starred" && (
                <div className="space-y-6">
                  {/* Check if snippets finished loading */}
                  {starredSnippets === undefined && (
                    <div className="text-center py-12">
                      <Loader2 className="w-8 h-8 text-gray-600 mx-auto mb-4 animate-spin" />
                      <h3 className="text-base font-medium text-gray-400">
                        Loading starred snippets...
                      </h3>
                    </div>
                  )}

                  {/* Empty State for Stars */}
                  {starredSnippets && starredSnippets.length === 0 && (
                    <div className="text-center py-12">
                      <Star className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-400 mb-2">
                        No starred snippets yet
                      </h3>
                      <p className="text-gray-500">
                        Star snippets you like to find them here later.
                      </p>
                    </div>
                  )}

                  {/* Render Starred Snippets using SnippetCard */}
                  {starredSnippets && starredSnippets.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {starredSnippets.map((snippet) => (
                        <SnippetCard key={snippet.id} snippet={snippet} onDeleteSuccess={handleDeleteStarredSnippet} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
export default ProfilePage; 