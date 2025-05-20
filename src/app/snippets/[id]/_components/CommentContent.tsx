import CodeBlock from "./CodeBlock"; // Assuming it's in the same directory
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // For GitHub Flavored Markdown (tables, strikethrough, etc.)

// More robust Markdown rendering using react-markdown
function CommentContent({ content }: { content: string }) {
  return (
    <div className="prose prose-invert prose-sm max-w-none text-gray-300 break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Override the default code block rendering
          code(props) {
            const { children, className, node, ...rest } = props;
            const match = /language-(\w+)/.exec(className || "");
            const codeContent = String(children).replace(/\n$/, ""); // Remove trailing newline

            return match ? (
              <CodeBlock
                language={match[1]}
                code={codeContent}
              />
            ) : (
              // Render inline code
              <code {...rest} className="bg-gray-700/50 text-red-400 px-1 py-0.5 rounded text-xs font-mono">
                {children}
              </code>
            );
          },
          // Optional: Customize other elements like paragraphs, links, etc.
          p(props) {
            const { node, ...rest } = props;
            // Add bottom margin to paragraphs, except the last one within its parent
            return <p {...rest} className="mb-3 last:mb-0" />;
          },
          a(props) {
            const { node, ...rest } = props;
            return <a {...rest} className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default CommentContent; 