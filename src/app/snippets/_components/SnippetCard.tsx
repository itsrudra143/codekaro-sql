"use client";
import { Snippet } from "@/types"; // Assuming types will be defined similarly
import { useUser } from "@clerk/nextjs";
// import { useMutation } from "convex/react"; // Will replace with API call/server action
// import { api } from "../../../../convex/_generated/api"; // Will replace with API call/server action
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Clock, Trash2, User, Loader2 } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import StarButton from "@/components/StarButton"; // Assuming StarButton will be copied
import { useRouter } from "next/navigation"; // Import for refresh

// TODO: Adapt Snippet type if necessary for Prisma model (e.g., _id -> id, _creationTime -> createdAt)
function SnippetCard({ snippet }: { snippet: Snippet }) {
  const { user } = useUser();
  const router = useRouter();
  // const deleteSnippet = useMutation(api.snippets.deleteSnippet); // TODO: Replace with backend call
  const [isDeleting, setIsDeleting] = useState(false);

  // Format date nicely
  const formattedDate = new Date(snippet.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const handleDelete = async () => {
    if (!user || user.id !== snippet.userId) {
      toast.error("You are not authorized to delete this snippet.");
      return;
    }

    // Confirmation dialog
    if (!confirm("Are you sure you want to delete this snippet?")) {
      return;
    }

    setIsDeleting(true);
    const toastId = toast.loading("Deleting snippet...");

    try {
      const response = await fetch(`/api/snippets/${snippet.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to delete snippet" }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      toast.success("Snippet deleted", { id: toastId });
      // Refresh data on the page after deletion
      // A simple router.refresh() might work if the parent page uses server components
      // or re-fetches on navigation. For client components, you might need a more
      // sophisticated state management solution (like Zustand or passing a callback).
      router.refresh();
      // TODO: Improve refresh mechanism if needed (e.g., Zustand store update)

    } catch (error) {
      console.error("Error deleting snippet:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(`Deletion failed: ${message}`, { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      layout
      className="group relative h-full" // Ensure motion div takes full height
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {/* // TODO: Update link href if Prisma uses 'id' instead of '_id' */}
      <Link href={`/snippets/${snippet.id}`} className="h-full block">
        <div
          className="relative flex flex-col h-full bg-[#1e1e2e]/80 backdrop-blur-sm rounded-xl 
          border border-[#313244]/50 hover:border-[#313244] 
          transition-all duration-300 overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 flex-shrink-0">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {/* Language Icon */}
                <div className="relative flex-shrink-0">
                  <div
                    className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-10 
                  group-hover:opacity-20 transition-all duration-500"
                    aria-hidden="true"
                  />
                  <div
                    className="relative p-1.5 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 group-hover:from-blue-500/20
                   group-hover:to-purple-500/10 ring-1 ring-white/5 transition-all duration-500"
                  >
                    <Image
                      src={`/${snippet.language}.png`}
                      alt={`${snippet.language} logo`}
                      className="w-6 h-6 object-contain relative z-10"
                      width={24}
                      height={24}
                      onError={(e) => {
                        e.currentTarget.src = "/code-icon.svg"; // TODO: Add a fallback icon
                        e.currentTarget.className = "w-6 h-6 p-1 object-contain relative z-10 text-gray-400"; // Style fallback
                      }}
                    />
                  </div>
                </div>
                {/* Language and Date */}
                <div className="space-y-1 min-w-0">
                  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md text-xs font-medium truncate">
                    {snippet.language}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="size-3 flex-shrink-0" />
                    <span>{formattedDate}</span>
                  </div>
                </div>
              </div>
              {/* Action Buttons (Star/Delete) */}
              <div
                className="absolute top-4 right-4 z-10 flex gap-2 items-center"
                onClick={(e) => e.stopPropagation()} // Prevent event bubbling to the Link
              >
                {/* // TODO: Ensure StarButton uses snippet.id */}
                <StarButton snippetId={snippet.id} />

                {user?.id === snippet.userId && (
                  <div className="z-10" onClick={(e) => e.preventDefault()}> {/* Prevent Link nav */}
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      title="Delete Snippet"
                      className={`group flex items-center justify-center size-8 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${isDeleting
                        ? "bg-red-500/20 text-red-400"
                        : "bg-gray-500/10 text-gray-400 hover:bg-red-500/10 hover:text-red-400"
                        }
                      `}
                    >
                      {isDeleting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3 px-6 pb-6 flex-grow">
              {/* Title */}
              <h2 className="text-lg font-semibold text-white mb-1 line-clamp-2 group-hover:text-blue-400 transition-colors">
                {snippet.title}
              </h2>
              {/* Author */}
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="p-0.5 rounded-md bg-gray-800/50">
                  <User className="size-3" />
                </div>
                <span className="truncate max-w-[150px]">
                  {snippet.userName}
                </span>
              </div>
              {/* Code Preview */}
              <div className="relative group/code mt-2 pt-4 border-t border-white/5">
                <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-t from-transparent to-[#1e1e2e]/80 via-[#1e1e2e]/60 z-10 pointer-events-none" />
                <pre className="relative bg-black/30 rounded-md p-3 overflow-hidden text-xs text-gray-300 font-mono line-clamp-4 h-[70px]">
                  {snippet.code}
                </pre>
                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-transparent to-[#1e1e2e]/80 via-[#1e1e2e]/60 z-10 pointer-events-none rounded-b-md" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
export default SnippetCard; 