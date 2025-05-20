"use client";

// import { useQuery } from "convex/react"; // Will replace with API call/server action
import { useParams } from "next/navigation";
// import { api } from "../../../../convex/_generated/api"; // Will replace with API call/server action
// import { Id } from "../../../../convex/_generated/dataModel"; // Type from Convex
import { useEffect, useState } from "react"; // Need state for fetched data
import { Snippet, SnippetComment as SnippetCommentType } from "@/types"; // Assuming types exist
import SnippetLoadingSkeleton from "../_components/SnippetsPageSkeleton"; // Assuming this was copied
import NavigationHeader from "@/components/NavigationHeader"; // Assuming this exists or will be copied
import { Clock, Code, MessageSquare, User, AlertTriangle } from "lucide-react";
import { Editor } from "@monaco-editor/react";
import {
  LANGUAGE_CONFIG,
} from "@/app/dashboard/_constants"; // Assuming constants exist or will be copied
import Image from "next/image";
import CopyButton from "./_components/CopyButton"; // Assuming this will be copied
import Comments from "./_components/Comments"; // Assuming this will be copied
import toast from "react-hot-toast"; // Import toast

function SnippetDetailPage() {
  const params = useParams();
  const snippetId = params.id as string;

  const [snippet, setSnippet] = useState<Snippet | null | undefined>(undefined);
  const [comments, setComments] = useState<SnippetCommentType[] | null | undefined>(
    undefined
  );
  // Combined loading state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!snippetId) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      setSnippet(undefined);
      setComments(undefined);
      try {
        // Fetch snippet and comments in parallel
        const [snippetRes, commentsRes] = await Promise.all([
          fetch(`/api/snippets/${snippetId}`),
          fetch(`/api/snippets/${snippetId}/comments`),
        ]);

        // Check snippet response
        if (!snippetRes.ok) {
          if (snippetRes.status === 404) {
            throw new Error("Snippet not found");
          } else {
            throw new Error(`Failed to fetch snippet: ${snippetRes.statusText}`);
          }
        }
        const snippetData: Snippet = await snippetRes.json();
        // Convert date strings
        snippetData.createdAt = new Date(snippetData.createdAt);
        snippetData.updatedAt = new Date(snippetData.updatedAt);
        setSnippet(snippetData);

        // Check comments response (less critical if this fails)
        let commentsData: SnippetCommentType[] = [];
        if (commentsRes.ok) {
          commentsData = await commentsRes.json();
          // Convert date strings
          commentsData = commentsData.map(comment => ({
            ...comment,
            createdAt: new Date(comment.createdAt),
            updatedAt: new Date(comment.updatedAt),
          }));
        } else {
          console.warn(`Failed to fetch comments: ${commentsRes.statusText}`);
          // Set comments to empty array or null depending on desired UI
        }
        setComments(commentsData);

      } catch (err) {
        console.error("Error fetching snippet details:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
        toast.error(`Error: ${errorMessage}`);
        setSnippet(null); // Set to null to indicate error
        setComments(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [snippetId]);

  // --- Loading State ---
  if (isLoading) {
    // Use the dedicated loading skeleton for the detail page
    return <SnippetLoadingSkeleton />;
  }

  // --- Error State ---
  if (error || snippet === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <NavigationHeader />
        <div className="flex flex-col items-center justify-center text-center text-red-400 py-20 px-4">
          <AlertTriangle className="w-16 h-16 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Error Loading Snippet</h2>
          <p className="text-red-300/80 max-w-md">{error || "Could not load the requested snippet. It might have been deleted or the link is incorrect."}</p>
          {/* TODO: Add a back button? */}
        </div>
      </div>
    );
  }

  // --- Add explicit check for snippet after loading/error handling ---
  if (!snippet) {
    // This should technically not be reached if loading/error states are correct,
    // but it satisfies TypeScript and handles edge cases.
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <NavigationHeader />
        <div className="text-center py-20">Snippet data is missing.</div>
      </div>
    );
  }

  // --- Constants for Editor --- 
  const editorLanguage = snippet.language && LANGUAGE_CONFIG[snippet.language]
    ? LANGUAGE_CONFIG[snippet.language].monacoLanguage
    : "plaintext";

  // Removed the problematic defineMonacoThemes() call here.
  // Theme definition should ideally happen globally or within beforeMount if needed.

  // --- Successful Render --- 
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <NavigationHeader />

      <main className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="bg-[#121218] border border-[#ffffff0a] rounded-2xl p-6 sm:p-8 mb-6 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center size-12 rounded-xl bg-[#ffffff08] p-2.5 flex-shrink-0">
                  <Image
                    width={32}
                    height={32}
                    src={`/${snippet.language}.png`}
                    alt={`${snippet.language} logo`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = "/code-icon.svg"; // Fallback icon
                      e.currentTarget.className = "w-full h-full object-contain p-1 text-gray-400";
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-semibold text-white mb-1 sm:mb-2 break-words">
                    {snippet.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    <div className="flex items-center gap-2 text-[#8b8b8d]" title={`User: ${snippet.userName}`}>
                      <User className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate max-w-[150px] sm:max-w-[200px]">{snippet.userName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#8b8b8d]">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>
                        {new Date(snippet.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[#8b8b8d]">
                      <MessageSquare className="w-4 h-4 flex-shrink-0" />
                      <span>{comments?.length ?? 0} comments</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="inline-flex items-center px-3 py-1.5 bg-[#ffffff08] text-[#808086] rounded-lg text-sm font-medium flex-shrink-0 ml-auto">
                {snippet.language}
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div className="mb-8 rounded-2xl overflow-hidden border border-[#ffffff0a] bg-[#121218]">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#ffffff0a]">
              <div className="flex items-center gap-2 text-[#808086]">
                <Code className="w-4 h-4" />
                <span className="text-sm font-medium">Source Code</span>
              </div>
              <CopyButton code={snippet.code} />
            </div>
            {/* Note: Monaco Editor can be heavy, consider lazy loading if performance is an issue */}
            <Editor
              height="600px" // Adjust as needed
              language={editorLanguage}
              value={snippet.code}
              theme="vs-dark" // TODO: Ensure this theme is defined by defineMonacoThemes
              // beforeMount={defineMonacoThemes} // Call defineMonacoThemes outside render if possible
              options={{
                minimap: { enabled: false },
                fontSize: 14, // Slightly smaller for code
                readOnly: true,
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                renderWhitespace: "selection",
                fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
                fontLigatures: true,
                wordWrap: "on", // Enable word wrap
              }}
            />
          </div>

          {/* Comments Section */}
          {/* Pass snippet.id and fetched comments (or empty array) */}
          <Comments snippetId={snippet.id} initialComments={comments || []} />
        </div>
      </main>
    </div>
  );
}
export default SnippetDetailPage; 