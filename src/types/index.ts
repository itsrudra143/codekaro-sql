import { Monaco } from "@monaco-editor/react";
import { editor as MonacoEditor } from "monaco-editor";

export interface Theme {
  id: string;
  label: string;
  color: string;
}

export interface Language {
  id: string;
  label: string;
  logoPath: string;
  monacoLanguage: string;
  defaultCode: string;
  pistonRuntime: LanguageRuntime;
}

export interface LanguageRuntime {
  language: string;
  version: string;
}

export interface ExecuteCodeResponse {
  compile?: {
    output: string;
  };
  run?: {
    output: string;
    stderr: string;
  };
}

export interface ExecutionResult {
  code: string;
  input?: string;
  output: string;
  error: string | null;
}

export interface CodeEditorState {
  language: string;
  output: string;
  isRunning: boolean;
  error: string | null;
  theme: string;
  fontSize: number;
  editor: MonacoEditor.IStandaloneCodeEditor | null;
  executionResult: ExecutionResult | null;
  userInput: string;
  showInputField: boolean;

  setEditor: (editor: MonacoEditor.IStandaloneCodeEditor) => void;
  getCode: () => string;
  setLanguage: (language: string) => void;
  setTheme: (theme: string) => void;
  setFontSize: (fontSize: number) => void;
  runCode: (userInput?: string) => Promise<void>;
  setUserInput: (input: string) => void;
  toggleInputField: () => void;
}

export interface Snippet {
  id: string;
  userId: string;
  title: string;
  language: string;
  code: string;
  userName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SnippetComment {
  id: string;
  snippetId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CodeExecution {
  id: string;
  userId: string;
  language: string;
  code: string;
  output: string | null;
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserData {
  id: string;
  userId: string;
  email: string;
  name: string;
  isPro: boolean;
  proSince?: Date | null;
  lemonSqueezyCustomerId?: string | null;
  lemonSqueezyOrderId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStats {
  totalExecutions: number;
  languagesUsed: string[];
  totalSnippets: number;
  totalStars: number;
  last24Hours?: number;
  favoriteLanguage?: string | null;
  mostStarredLanguage?: string | null;
}
