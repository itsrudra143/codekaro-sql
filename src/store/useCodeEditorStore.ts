import { CodeEditorState } from "../types/index";
import { LANGUAGE_CONFIG } from "@/app/dashboard/_constants";
import { create } from "zustand";
import { editor as MonacoEditor } from "monaco-editor";

const getInitialState = () => {
  // if we're on the server, return default values
  if (typeof window === "undefined") {
    return {
      language: "javascript",
      fontSize: 16,
      theme: "vs-dark",
    };
  }

  // if we're on the client, return values from local storage bc localStorage is a browser API.
  const savedLanguage = localStorage.getItem("editor-language") || "javascript";
  const savedTheme = localStorage.getItem("editor-theme") || "vs-dark";
  const savedFontSize = localStorage.getItem("editor-font-size") || 16;

  return {
    language: savedLanguage,
    theme: savedTheme,
    fontSize: Number(savedFontSize),
  };
};

export const useCodeEditorStore = create<CodeEditorState>((set, get) => {
  const initialState = getInitialState();

  return {
    ...initialState,
    output: "",
    isRunning: false,
    error: null,
    editor: null,
    executionResult: null,
    userInput: "",
    showInputField: false,

    getCode: () => get().editor?.getValue() || "",

    setEditor: (editor: MonacoEditor.IStandaloneCodeEditor) => {
      const currentLanguage = get().language;
      const savedCode = localStorage.getItem(`editor-code-${currentLanguage}`);
      if (editor && (!editor.getValue() || editor.getValue() !== savedCode)) {
        const initialCode =
          savedCode || LANGUAGE_CONFIG[currentLanguage]?.defaultCode || "";
        editor.setValue(initialCode);
      }
      set({ editor });
    },

    setTheme: (theme: string) => {
      localStorage.setItem("editor-theme", theme);
      set({ theme });
    },

    setFontSize: (fontSize: number) => {
      localStorage.setItem("editor-font-size", fontSize.toString());
      set({ fontSize });
    },

    setLanguage: (language: string) => {
      // Save current language code before switching
      const currentCode = get().editor?.getValue();
      if (currentCode) {
        localStorage.setItem(`editor-code-${get().language}`, currentCode);
      }

      localStorage.setItem("editor-language", language);

      set({
        language,
        output: "",
        error: null,
      });
    },

    setUserInput: (input: string) => set({ userInput: input }),

    toggleInputField: () =>
      set((state) => ({ showInputField: !state.showInputField })),

    runCode: async (userInput?: string) => {
      const { language, getCode } = get();
      const code = getCode();

      if (!code) {
        set({ error: "Please enter some code" });
        return;
      }

      set({ isRunning: true, error: null, output: "" });

      let response: Response | null = null; // Define response variable

      try {
        response = await fetch("/api/code-executions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            language,
            code,
            input: userInput || "",
          }),
        });

        // Check for specific auth error first
        if (response.status === 401) {
          throw new Error(
            "Authentication failed. Please sign in again or refresh the page."
          );
        }

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: "Code execution failed" }));
          // Use a generic message but include status for debugging
          throw new Error(
            errorData.message || `Execution failed (Status: ${response.status})`
          );
        }

        const data = await response.json();

        set({
          output: data.output?.trim() ?? "",
          error: data.error || null,
          executionResult: {
            code,
            input: userInput || "",
            output: data.output?.trim() ?? "",
            error: data.error || null,
          },
        });
      } catch (error) {
        console.error("Error running code:", error);
        const message =
          error instanceof Error ? error.message : "An unknown error occurred";
        set({
          error: message,
          // Ensure executionResult is set even on error, possibly with the error message
          executionResult: {
            code,
            input: userInput || "",
            output: "",
            error: message,
          },
        });
      } finally {
        set({ isRunning: false });
      }
    },
  };
});

export const getExecutionResult = () =>
  useCodeEditorStore.getState().executionResult;
