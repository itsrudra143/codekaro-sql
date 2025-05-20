"use client";
import { useAuth } from "@clerk/nextjs";
// import { Id } from "../../convex/_generated/dataModel"; // Convex type
// import { useMutation, useQuery } from "convex/react"; // Replace
// import { api } from "../../convex/_generated/api"; // Replace
import { Star, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

function StarButton({ snippetId }: { snippetId: string }) {
  const { isSignedIn, userId } = useAuth();
  const [isStarred, setIsStarred] = useState(false);
  const [starCount, setStarCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false); // State for mutation loading

  // Fetch initial star status and count
  useEffect(() => {
    if (!snippetId) {
      setIsLoading(false); // Don't attempt fetch if no ID
      return;
    }
    setIsLoading(true);

    const fetchStarStatus = async () => {
      try {
        const response = await fetch(`/api/snippets/${snippetId}/stars`);
        if (!response.ok) {
          // Don't throw fatal error, just log and default
          console.warn(`Failed to fetch star status: ${response.statusText}`);
          setStarCount(0);
          setIsStarred(false);
          return;
        }
        const data: { count: number; isStarred: boolean } = await response.json();
        setStarCount(data.count);
        // isStarred is only relevant if the user is signed in
        setIsStarred(isSignedIn ? data.isStarred : false);
      } catch (error) {
        console.error("Error fetching star status:", error);
        setStarCount(0);
        setIsStarred(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStarStatus();
    // Re-fetch when sign-in status changes or snippetId changes
  }, [snippetId, isSignedIn, userId]);

  // Handle starring/unstarring
  const handleStar = async () => {
    if (!isSignedIn || isLoading || isMutating) {
      if (!isSignedIn) {
        toast.error("Please sign in to star snippets.");
      }
      return;
    }

    setIsMutating(true);
    // Optimistic update
    const previousState = { isStarred, starCount };
    const newStarredState = !isStarred;
    const newStarCount = newStarredState ? starCount + 1 : starCount - 1;
    setIsStarred(newStarredState);
    setStarCount(newStarCount);

    try {
      const response = await fetch(`/api/snippets/${snippetId}/stars`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to update star status" }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // If successful, the optimistic update is correct.
      // Optionally, you could re-fetch the count here if accuracy is paramount,
      // but usually the optimistic update is sufficient.
      // const updatedData = await response.json();
      // setStarCount(updatedData.count); // Example if API returned new count

    } catch (error) {
      console.error("Error toggling star:", error);
      toast.error("Failed to update star status");
      // Revert optimistic update on error
      setIsStarred(previousState.isStarred);
      setStarCount(previousState.starCount);
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <button
      onClick={handleStar}
      // Disable while loading initial state OR while mutation is in progress
      disabled={!isSignedIn || isLoading || isMutating}
      className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg 
      transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${isLoading // Initial loading style
          ? "bg-gray-700/30 text-gray-500"
          : isStarred
            ? "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
            : "bg-gray-500/10 text-gray-400 hover:bg-gray-500/20"
        }`}
      title={isLoading ? "Loading..." : (isSignedIn ? (isStarred ? "Unstar snippet" : "Star snippet") : "Sign in to star")}
    >
      {isMutating ? ( // Show mutation spinner preferentially
        <Loader2 className="size-4 animate-spin text-gray-400" />
      ) : isLoading ? ( // Then show initial loading spinner
        <div className="size-4 border-2 border-gray-500/30 border-t-gray-500 rounded-full animate-spin" />
      ) : (
        <Star
          className={`w-4 h-4 transition-all duration-200 ${isStarred ? "fill-yellow-400 text-yellow-500" : "fill-none text-gray-400 group-hover:text-gray-300 group-hover:scale-110"}`}
          strokeWidth={isStarred ? 1 : 1.5} // Adjust stroke for fill state
        />
      )}
      <span
        className={`text-xs font-medium transition-colors duration-200 ${isLoading || isMutating ? "text-gray-500" : isStarred ? "text-yellow-400" : "text-gray-400"}`}
      >
        {isLoading ? "-" : starCount}
      </span>
    </button>
  );
}

export default StarButton; 