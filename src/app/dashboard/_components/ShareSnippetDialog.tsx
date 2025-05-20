import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

function ShareSnippetDialog({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const { language, getCode } = useCodeEditorStore();
  const router = useRouter();

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSharing(true);
    const toastId = toast.loading("Saving snippet...");

    try {
      const code = getCode();

      const response = await fetch("/api/snippets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          code,
          language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to save snippet" }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const newSnippet = await response.json();

      toast.success("Snippet saved successfully!", { id: toastId });
      onClose();
      setTitle("");

      router.push(`/snippets/${newSnippet.id}`);

    } catch (error) {
      console.error("Error creating snippet:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(`Error saving snippet: ${message}`, { id: toastId });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1e1e2e] rounded-xl p-6 w-full max-w-md shadow-xl border border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Save Snippet</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 p-1 rounded-full hover:bg-gray-700/50 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleShare}>
          <div className="mb-5">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-300 mb-1.5"
            >
              Snippet Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#181825] border border-[#313244] rounded-lg text-white 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
              placeholder="e.g., Fetch User Data Query"
              required
              disabled={isSharing}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSharing}
              className="px-5 py-2 text-sm font-medium text-gray-400 hover:text-gray-200 rounded-lg hover:bg-gray-700/50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSharing || !title.trim()}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 
              transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSharing ? (
                <><Loader2 className="size-4 animate-spin" /> Saving...</>
              ) : (
                "Save Snippet"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ShareSnippetDialog;
