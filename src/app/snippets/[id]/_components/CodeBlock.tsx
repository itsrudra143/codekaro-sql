import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import CopyButton from "./CopyButton"; // Assuming it's in the same directory
import Image from "next/image";

const CodeBlock = ({ language, code }: { language: string; code: string }) => {
  // Normalize line endings and trim trailing whitespace
  const normalizedCode = code.replace(/\r\n/g, "\n").trimEnd();
  const trimmedCode = normalizedCode
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n");

  const languageName = language || "plaintext";

  return (
    <div className="my-4 bg-[#0a0a0f] rounded-lg overflow-hidden border border-[#ffffff0a]">
      {/* Header bar showing language and copy button */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-[#ffffff08]">
        {/* Language indicator with icon */}
        <div className="flex items-center gap-2">
          <Image
            width={16}
            height={16}
            src={`/${languageName}.png`} // Use normalized language name
            alt={languageName}
            className="size-4 object-contain"
            onError={(e) => {
              // Fallback if language icon not found
              e.currentTarget.style.display = "none"; // Hide broken image icon
            }}
          />
          <span className="text-xs sm:text-sm text-gray-400">
            {languageName}
          </span>
        </div>
        {/* Button to copy code to clipboard */}
        <CopyButton code={trimmedCode} />
      </div>

      {/* Code block with syntax highlighting */}
      <div className="relative text-sm overflow-x-auto">
        <SyntaxHighlighter
          language={languageName}
          style={atomOneDark} // You might want to consider other themes or make it configurable
          customStyle={{
            padding: "1rem", // Consistent padding
            margin: 0,
            overflow: "visible", // Allow content to determine width initially
            minWidth: "100%", // Ensure it takes at least full width
            background: "transparent", // Use container background
          }}
          showLineNumbers={true}
          wrapLines={true} // Wraps long lines
          lineNumberStyle={{ color: "#666", paddingRight: "1em" }} // Style line numbers
          codeTagProps={{ style: { fontFamily: '"Fira Code", monospace' } }} // Apply font family
        >
          {trimmedCode}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeBlock; 