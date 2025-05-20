import { Trash2Icon, UserIcon } from "lucide-react";
// import { Id } from "../../../../../convex/_generated/dataModel"; // Convex type
import { SnippetComment as SnippetCommentType } from "@/types"; // Assuming types exist
import CommentContent from "./CommentContent"; // Assuming this will be copied

interface CommentProps {
  comment: SnippetCommentType; // Use the imported type
  onDelete: (commentId: string) => void; // Use string ID
  isDeleting: boolean;
  currentUserId?: string;
}

function Comment({
  comment,
  currentUserId,
  isDeleting,
  onDelete,
}: CommentProps) {
  // Format date nicely
  const formattedDate = new Date(comment.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="group">
      <div className="bg-[#0a0a0f] rounded-xl p-4 sm:p-6 border border-[#ffffff0a] hover:border-[#ffffff14] transition-all duration-200">
        <div className="flex items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#ffffff08] flex items-center justify-center flex-shrink-0">
              {/* TODO: Add user avatars if available */}
              <UserIcon className="w-4 h-4 text-[#808086]" />
            </div>
            <div className="min-w-0">
              <span className="block text-sm sm:text-base text-[#e1e1e3] font-medium truncate">
                {comment.userName}
              </span>
              <span className="block text-xs sm:text-sm text-[#808086]">
                {formattedDate}
              </span>
            </div>
          </div>

          {comment.userId === currentUserId && (
            <button
              onClick={() => onDelete(comment.id)} // Use string ID
              disabled={isDeleting}
              className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${isDeleting
                  ? "cursor-not-allowed"
                  : "opacity-0 group-hover:opacity-100 hover:bg-red-500/10"
                }`}
              title="Delete comment"
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
              ) : (
                <Trash2Icon className="w-4 h-4 text-red-400" />
              )}
            </button>
          )}
        </div>

        <div className="pl-10 sm:pl-12">
          {/* Use the CommentContent component to render potentially markdown content */}
          <CommentContent content={comment.content} />
        </div>
      </div>
    </div>
  );
}
export default Comment; 