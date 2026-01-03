export type CodeSnippet = {
  id: string;
  code: string;
  language: string;
  timestamp: number;
  metadata?: {
    name?: string;
    description?: string;
  };
};

export type AnimationConfig = {
  duration: number; // ms
  fps: number;
  easing: "linear" | "ease-in" | "ease-out" | "ease-in-out";
  theme: string; // Shiki theme
  backgroundColor: string;
  fontSize: number;
  lineHeight: number;
  showLineNumbers: boolean; // Show line numbers in gutter
};

export type HistoryStorage = {
  snippets: CodeSnippet[];
  maxHistory: number;
};

export type SessionStorage = {
  snippets: CodeSnippet[];
  language: string;
  timestamp: number;
};

const HISTORY_KEY = "code-animator-history";
const CONFIG_KEY = "code-animator-config";
const SESSION_KEY = "code-animator-current-session";

export const loadHistory = (): HistoryStorage | null => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Failed to load history:", error);
    return null;
  }
};

export const saveHistory = (history: HistoryStorage): void => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Failed to save history:", error);
  }
};

export const loadConfig = (): AnimationConfig | null => {
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Failed to load config:", error);
    return null;
  }
};

export const saveConfig = (config: AnimationConfig): void => {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Failed to save config:", error);
  }
};

export const loadSession = (): SessionStorage | null => {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Failed to load session:", error);
    return null;
  }
};

export const saveSession = (session: SessionStorage): void => {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error("Failed to save session:", error);
  }
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
