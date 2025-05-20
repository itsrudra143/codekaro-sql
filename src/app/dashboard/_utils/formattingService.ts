import { Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";

// Configure auto-formatting on paste
export const configureAutoFormatting = (
  editor: editor.IStandaloneCodeEditor
  //   monaco: Monaco
) => {
  // Auto-format on paste
  editor.onDidPaste(() => {
    // Use setTimeout to ensure the paste operation is complete before formatting
    setTimeout(() => {
      // Always format on paste
      editor.getAction("editor.action.formatDocument")?.run();
    }, 100);
  });
};

// Define the formatting providers for different languages
export const registerFormattingProviders = (monaco: Monaco) => {
  // JavaScript/TypeScript formatting provider
  monaco.languages.registerDocumentFormattingEditProvider("javascript", {
    async provideDocumentFormattingEdits(model) {
      const text = model.getValue();
      try {
        const formatted = formatJavaScript(text);
        return [
          {
            range: model.getFullModelRange(),
            text: formatted,
          },
        ];
      } catch (error) {
        console.error("Error formatting JavaScript:", error);
        return [];
      }
    },
  });

  // TypeScript uses the same formatter as JavaScript
  monaco.languages.registerDocumentFormattingEditProvider("typescript", {
    async provideDocumentFormattingEdits(model) {
      const text = model.getValue();
      try {
        const formatted = formatJavaScript(text);
        return [
          {
            range: model.getFullModelRange(),
            text: formatted,
          },
        ];
      } catch (error) {
        console.error("Error formatting TypeScript:", error);
        return [];
      }
    },
  });

  // Python formatting provider
  monaco.languages.registerDocumentFormattingEditProvider("python", {
    async provideDocumentFormattingEdits(model) {
      const text = model.getValue();
      try {
        const formatted = formatPython(text);
        return [
          {
            range: model.getFullModelRange(),
            text: formatted,
          },
        ];
      } catch (error) {
        console.error("Error formatting Python:", error);
        return [];
      }
    },
  });

  // C++ formatting provider
  monaco.languages.registerDocumentFormattingEditProvider("cpp", {
    async provideDocumentFormattingEdits(model) {
      const text = model.getValue();
      try {
        const formatted = formatCpp(text);
        return [
          {
            range: model.getFullModelRange(),
            text: formatted,
          },
        ];
      } catch (error) {
        console.error("Error formatting C++:", error);
        return [];
      }
    },
  });

  // Java formatting provider
  monaco.languages.registerDocumentFormattingEditProvider("java", {
    async provideDocumentFormattingEdits(model) {
      const text = model.getValue();
      try {
        const formatted = formatJava(text);
        return [
          {
            range: model.getFullModelRange(),
            text: formatted,
          },
        ];
      } catch (error) {
        console.error("Error formatting Java:", error);
        return [];
      }
    },
  });

  // Add keyboard shortcut for formatting (Shift+Alt+F)
  monaco.editor.addKeybindingRule({
    keybinding: monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF,
    command: "editor.action.formatDocument",
  });
};

// Helper function to add spacing around operators
function addSpacingAroundOperators(line: string, language: string): string {
  if (
    line.trim().startsWith("//") ||
    line.trim().startsWith("#") ||
    line.trim().startsWith("/") ||
    line.trim().startsWith("/")
  ) {
    // Don't modify comments
    return line;
  }

  // Define operators based on language
  const operators = {
    javascript: [
      "===",
      "!==",
      "==",
      "!=",
      "+=",
      "-=",
      "*=",
      "/=",
      "%=",
      "&&",
      "||",
      "??",
      ">=",
      "<=",
      ">>",
      "<<",
      ">>>",
      "=>",
      "=",
      "+",
      "-",
      "*",
      "/",
      "%",
      "?",
      ":",
      ">",
      "<",
      "|",
      "&",
      "^",
    ],
    python: [
      "==",
      "!=",
      "+=",
      "-=",
      "=",
      "/=",
      "//=",
      "%=",
      "=",
      ">=",
      "<=",
      "//",
      "**",
      "*",
      "=",
      "+",
      "-",
      "*",
      "/",
      "%",
      ">",
      "<",
      "|",
      "&",
      "^",
      "~",
      "and",
      "or",
      "not",
      "in",
      "is",
      "for",
      "while",
      "if",
      "else",
      "elif",
      "return",
      "print",
      "def",
      "class",
      "import",
      "from",
      "as",
    ],
    cpp: [
      // Order matters - longer operators first
      "<<=",
      ">>=",
      "==",
      "!=",
      "+=",
      "-=",
      "*=",
      "/=",
      "%=",
      "&=",
      "|=",
      "^=",
      ">=",
      "<=",
      "&&",
      "||",
      "<<",
      ">>",
      "->",
      "::",
      "++",
      "--",
      "=",
      "+",
      "-",
      "*",
      "/",
      "%",
      ">",
      "<",
      "|",
      "&",
      "^",
      "~",
      "!",
    ],
    java: [
      "===",
      "!==",
      "==",
      "!=",
      "+=",
      "-=",
      "*=",
      "/=",
      "%=",
      "&=",
      "|=",
      "^=",
      ">=",
      "<=",
      ">>>=",
      ">>=",
      "<<=",
      "&&",
      "||",
      ">>>",
      ">>",
      "<<",
      "++",
      "--",
      "=",
      "+",
      "-",
      "*",
      "/",
      "%",
      ">",
      "<",
      "|",
      "&",
      "^",
      "~",
      "!",
    ],
  };

  // Choose the appropriate operator set
  const operatorSet =
    operators[language as keyof typeof operators] || operators.javascript;

  // Skip if inside a string
  let inString = false;
  let stringChar = "";
  let result = "";
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    const nextChar = i < line.length - 1 ? line[i + 1] : "";

    // Handle strings
    if (
      (char === '"' || char === "'" || char === "`") &&
      (i === 0 || line[i - 1] !== "\\")
    ) {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
      result += char;
      i++;
      continue;
    }

    if (inString) {
      result += char;
      i++;
      continue;
    }

    // Check for operators
    let foundOperator = false;
    for (const op of operatorSet) {
      if (line.substring(i, i + op.length) === op) {
        // Don't add spaces for specific cases
        const prevChar = i > 0 ? line[i - 1] : "";
        const nextCharAfterOp =
          i + op.length < line.length ? line[i + op.length] : "";

        // Special handling for C++ stream operators
        if (language === "cpp" && (op === "<<" || op === ">>")) {
          // Check if it's a stream operation (cout << or cin >>)
          const beforeContext = line.substring(0, i).trim();
          const isStreamOp =
            /\b(cout|cerr|clog|cin|ostream|istream|stringstream)\b/.test(
              beforeContext
            );

          if (isStreamOp) {
            // For stream operations, add spaces on both sides
            if (prevChar !== " " && result.length > 0) {
              result += " ";
            }

            result += op;

            if (nextCharAfterOp !== " " && nextCharAfterOp !== "") {
              result += " ";
            }

            i += op.length;
            foundOperator = true;
            break;
          }
          // For bit shifts, handle normally
        }

        // Skip spacing for increment/decrement operators
        if (
          op === "++" ||
          op === "--" ||
          ((op === "+" || op === "-") && (nextChar === "+" || nextChar === "-"))
        ) {
          result += op;
          i += op.length;
          foundOperator = true;
          break;
        }

        // Skip spacing for arrow functions and pointers
        if (
          (op === ">" && prevChar === "-") ||
          (op === "*" &&
            /[\w\s]/.test(prevChar) &&
            /[\w]/.test(nextCharAfterOp))
        ) {
          result += op;
          i += op.length;
          foundOperator = true;
          break;
        }

        // Skip spacing for negative numbers or unary operators
        if (
          (op === "-" || op === "+" || op === "!" || op === "~") &&
          (i === 0 ||
            /[\(\[\{\,\;\=\+\-\*\/\%\&\|\^\!\~\?\:\<\>]/.test(prevChar))
        ) {
          result += op;
          i += op.length;
          foundOperator = true;
          break;
        }

        // Special handling for Python's in/is operators
        if (language === "python" && (op === "in" || op === "is")) {
          const beforeChar = i > 0 ? line[i - 1] : "";
          const afterChar =
            i + op.length < line.length ? line[i + op.length] : "";

          // Only add spaces if not already there
          if (beforeChar !== " " && result.length > 0) {
            result += " ";
          }

          result += op;

          if (afterChar !== " " && afterChar !== "") {
            result += " ";
          }

          i += op.length;
          foundOperator = true;
          break;
        }

        // Special handling for C++ scope resolution operator
        if (language === "cpp" && op === "::") {
          // Don't add spaces around scope resolution operator
          result += op;
          i += op.length;
          foundOperator = true;
          break;
        }

        // Add spaces around the operator
        // Check if there's already a space before
        if (prevChar !== " " && result.length > 0) {
          result += " ";
        }

        result += op;

        // Check if there's already a space after
        if (nextCharAfterOp !== " " && nextCharAfterOp !== "") {
          result += " ";
        }

        i += op.length;
        foundOperator = true;
        break;
      }
    }

    if (!foundOperator) {
      result += char;
      i++;
    }
  }

  return result;
}

// JavaScript/TypeScript formatter
function formatJavaScript(code: string): string {
  let formatted = "";
  let indentLevel = 0;
  const lines = code.split("\n");

  // Track if we're inside a multiline comment
  let inMultilineComment = false;
  // Track if we're inside a string
  let inString = false;
  let stringChar = "";

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // Skip empty lines
    if (line.length === 0) {
      formatted += "\n";
      continue;
    }

    // Handle multiline comments
    if (inMultilineComment) {
      formatted += "  ".repeat(indentLevel) + line + "\n";
      if (line.includes("*/")) {
        inMultilineComment = false;
      }
      continue;
    }

    // Check for multiline comment start
    if (line.includes("/") && !line.includes("/")) {
      inMultilineComment = true;
      formatted += "  ".repeat(indentLevel) + line + "\n";
      continue;
    }

    // Decrease indent for closing braces/brackets
    if (line.startsWith("}") || line.startsWith(")") || line.startsWith("]")) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    // Add spacing around operators
    line = addSpacingAroundOperators(line, "javascript");

    // Add indentation
    formatted += "  ".repeat(indentLevel) + line + "\n";

    // Count opening and closing braces to determine indentation
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      const prevChar = j > 0 ? line[j - 1] : "";

      // Handle strings
      if ((char === '"' || char === "'" || char === "`") && prevChar !== "\\") {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
      }

      // Skip processing if inside a string
      if (inString) continue;

      // Increase indent for opening braces
      if (char === "{") {
        indentLevel++;
      }
      // Decrease indent for closing braces
      else if (char === "}") {
        // We already decreased at the beginning if the line starts with }
        if (j > 0) {
          indentLevel = Math.max(0, indentLevel - 1);
        }
      }
    }

    // Special case for lines ending with opening braces
    if (line.endsWith("{") && !inString) {
      indentLevel++;
    }
  }

  return formatted.trim();
}

// Python formatter
function formatPython(code: string): string {
  let formatted = "";
  let indentLevel = 0;
  const lines = code.split("\n");

  // Track if we're inside a multiline string
  let inMultilineString = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // Skip empty lines
    if (line.length === 0) {
      formatted += "\n";
      continue;
    }

    // Handle multiline strings
    if (inMultilineString) {
      formatted += "    ".repeat(indentLevel) + line + "\n";
      if (line.includes('"""') || line.includes("'''")) {
        inMultilineString = false;
      }
      continue;
    }

    // Check for multiline string start
    if (
      (line.includes('"""') || line.includes("'''")) &&
      !(line.endsWith('"""') || line.endsWith("'''")) &&
      !(
        line.split('"""').length % 2 === 1 && line.split("'''").length % 2 === 1
      )
    ) {
      inMultilineString = true;
      formatted += "    ".repeat(indentLevel) + line + "\n";
      continue;
    }

    // Decrease indent for certain keywords
    if (
      line.startsWith("else:") ||
      line.startsWith("elif ") ||
      line.startsWith("except") ||
      line.startsWith("finally:") ||
      line.startsWith("except:")
    ) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    // Add spacing around operators
    line = addSpacingAroundOperators(line, "python");

    // Add indentation
    formatted += "    ".repeat(indentLevel) + line + "\n";

    // Increase indent for lines ending with colon (if, for, while, etc.)
    if (line.endsWith(":") && !line.startsWith("#") && !inMultilineString) {
      indentLevel++;
    }
  }

  return formatted.trim();
}

// C++ formatter
function formatCpp(code: string): string {
  let formatted = "";
  let indentLevel = 0;
  const lines = code.split("\n");

  // Track if we're inside a multiline comment
  let inMultilineComment = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // Skip empty lines
    if (line.length === 0) {
      formatted += "\n";
      continue;
    }

    // Handle multiline comments
    if (inMultilineComment) {
      formatted += "    ".repeat(indentLevel) + line + "\n";
      if (line.includes("*/")) {
        inMultilineComment = false;
      }
      continue;
    }

    // Check for multiline comment start
    if (line.includes("/") && !line.includes("/")) {
      inMultilineComment = true;
      formatted += "    ".repeat(indentLevel) + line + "\n";
      continue;
    }

    // Decrease indent for closing braces
    if (line.startsWith("}") || line.startsWith(")") || line.startsWith("]")) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    // Add spacing around operators
    line = addSpacingAroundOperators(line, "cpp");

    // Special case for else statements
    if (line.startsWith("else") || line.startsWith("} else")) {
      indentLevel = Math.max(0, indentLevel - 1);
      formatted += "    ".repeat(indentLevel) + line + "\n";
      if (line.endsWith("{")) {
        indentLevel++;
      }
      continue;
    }

    // Add indentation
    formatted += "    ".repeat(indentLevel) + line + "\n";

    // Increase indent for opening braces
    if (line.endsWith("{") || line.endsWith("(") || line.endsWith("[")) {
      indentLevel++;
    }
  }

  return formatted.trim();
}

// Java formatter
function formatJava(code: string): string {
  let formatted = "";
  let indentLevel = 0;
  const lines = code.split("\n");

  // Track if we're inside a multiline comment
  let inMultilineComment = false;
  // Track if we're inside a string
  //   let inString = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // Skip empty lines
    if (line.length === 0) {
      formatted += "\n";
      continue;
    }

    // Handle multiline comments
    if (inMultilineComment) {
      formatted += "    ".repeat(indentLevel) + line + "\n";
      if (line.includes("*/")) {
        inMultilineComment = false;
      }
      continue;
    }

    // Check for multiline comment start
    if (line.includes("/") && !line.includes("/")) {
      inMultilineComment = true;
      formatted += "    ".repeat(indentLevel) + line + "\n";
      continue;
    }

    // Decrease indent for closing braces
    if (line.startsWith("}") || line.startsWith(")")) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    // Add spacing around operators
    line = addSpacingAroundOperators(line, "java");

    // Special case for else statements
    if (line.startsWith("else") || line.startsWith("} else")) {
      indentLevel = Math.max(0, indentLevel - 1);
      formatted += "    ".repeat(indentLevel) + line + "\n";
      if (line.endsWith("{")) {
        indentLevel++;
      }
      continue;
    }

    // Add indentation
    formatted += "    ".repeat(indentLevel) + line + "\n";

    // Increase indent for opening braces
    if (line.endsWith("{")) {
      indentLevel++;
    }
  }

  return formatted.trim();
}
