import { SignInButton, useUser } from "@clerk/nextjs";
// import { Id } from "../../../../../convex/_generated/dataModel"; // Convex type
import { useState } from "react";
// import { useMutation, useQuery } from "convex/react"; // Replace with state/fetch
// import { api } from "../../../../../convex/_generated/api"; // Replace with API calls
import toast from "react-hot-toast";
import { MessageSquare } from "lucide-react";
import Comment from "./Comment"; // Assuming this will be copied
import CommentForm from "./CommentForm"; // Assuming this will be copied
import { SnippetComment as SnippetCommentType } from "@/types"; // Assuming types exist
// import { useRouter } from "next/navigation"; // Remove unused import

// Receive initial comments and snippetId as props
function Comments({
  snippetId,
  initialComments,
}: {
  snippetId: string; // Use string ID from Prisma
  initialComments: SnippetCommentType[];
}) {
  const { user } = useUser();
  // const router = useRouter(); // Remove unused variable
  const [comments, setComments] =
    useState<SnippetCommentType[]>(initialComments);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null
  );

  // --- Data Fetching/Mutations (Replaces Convex hooks) ---

  // Add Comment Logic
  const handleSubmitComment = async (content: string) => {
    if (!user) return;
    setIsSubmitting(true);
    const toastId = toast.loading("Adding comment...");

    try {
      const response = await fetch(`/api/snippets/${snippetId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to add comment" }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const newComment: SnippetCommentType = await response.json();
      // Convert date strings from API response
      newComment.createdAt = new Date(newComment.createdAt);
      newComment.updatedAt = new Date(newComment.updatedAt);

      // Update state with the actual comment from the server
      setComments((prev) => [newComment, ...prev]);
      toast.success("Comment added!", { id: toastId });

    } catch (error) {
      console.error("Error adding comment:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(`Failed to add comment: ${message}`, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Comment Logic
  const handleDeleteComment = async (commentId: string) => {
    setDeletingCommentId(commentId);
    const toastId = toast.loading("Deleting comment...");

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to delete comment" }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Update state optimistically
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success("Comment deleted", { id: toastId });

      // Optional: Refresh parent page data if counts are displayed there
      // router.refresh(); 

    } catch (error) {
      console.error("Error deleting comment:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(`Failed to delete comment: ${message}`, { id: toastId });
      // Optionally revert optimistic update here if needed, but usually okay to leave deleted
    } finally {
      setDeletingCommentId(null);
    }
  };
  // --- End Data Fetching/Mutations ---

  return (
    <div className="bg-[#121218] border border-[#ffffff0a] rounded-2xl overflow-hidden">
      <div className="px-6 sm:px-8 py-6 border-b border-[#ffffff0a]">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Discussion ({comments.length})
        </h2>
      </div>

      <div className="p-6 sm:p-8">
        {user ? (
          <CommentForm
            onSubmit={handleSubmitComment}
            isSubmitting={isSubmitting}
          />
        ) : (
          <div className="bg-[#0a0a0f] rounded-xl p-6 text-center mb-8 border border-[#ffffff0a]">
            <p className="text-[#808086] mb-4">
              Sign in to join the discussion
            </p>
            <SignInButton mode="modal">
              <button className="px-6 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors">
                Sign In
              </button>
            </SignInButton>
          </div>
        )}

        <div className="space-y-6">
          {comments.map((comment) => (
            <Comment
              key={comment.id} // Use Prisma 'id'
              comment={comment}
              onDelete={handleDeleteComment}
              isDeleting={deletingCommentId === comment.id} // Use Prisma 'id'
              currentUserId={user?.id}
            />
          ))}
          {/* Add a message if there are no comments */}
          {comments.length === 0 && !user && (
            <p className="text-center text-gray-500 text-sm">Sign in to be the first to comment!</p>
          )}
          {comments.length === 0 && user && (
            <p className="text-center text-gray-500 text-sm">Be the first to comment!</p>
          )}
        </div>
      </div>
    </div>
  );
}
export default Comments; 