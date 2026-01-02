import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Highlighter } from "shiki";
import {
  type CodeSnippet,
  type AnimationConfig,
  generateId,
  loadHistory,
  saveHistory,
  loadConfig,
  saveConfig,
  loadSession,
  saveSession,
} from "../util";
import type { EnhancedDiffOperation } from "../diffEngine";

export type DiffOperation = EnhancedDiffOperation;

type AnimatorState = {
  // Snippet management
  beforeSnippet: CodeSnippet | null;
  afterSnippet: CodeSnippet | null;
  history: CodeSnippet[];
  maxHistory: number;

  // Animation state
  config: AnimationConfig;
  isPlaying: boolean;
  currentTime: number;

  // Diff data
  diffResult: DiffOperation[] | null;

  // UI state
  activeView: "editor" | "diff" | "preview";

  // Shiki instance
  highlighter: Highlighter | null;
};

type AnimatorActions = {
  setBeforeSnippet: (snippet: CodeSnippet) => void;
  setAfterSnippet: (snippet: CodeSnippet) => void;
  updateSnippet: (which: "before" | "after", code: string, language: string) => void;
  loadFromHistory: (snippetId: string, which: "before" | "after") => void;
  deleteFromHistory: (snippetId: string) => void;
  clearHistory: () => void;
  addToHistory: (snippet: CodeSnippet) => void;

  updateConfig: (config: Partial<AnimationConfig>) => void;

  play: () => void;
  pause: () => void;
  reset: () => void;
  seek: (time: number) => void;

  setActiveView: (view: "editor" | "diff" | "preview") => void;

  setDiffResult: (result: DiffOperation[] | null) => void;
  setHighlighter: (highlighter: Highlighter) => void;
};

const DEFAULT_CONFIG: AnimationConfig = {
  duration: 2000,
  fps: 60,
  easing: "ease-in-out",
  theme: "github-dark",
  backgroundColor: "#0d1117",
  fontSize: 14,
  lineHeight: 1.5,
};

const AnimatorContext = createContext<(AnimatorState & AnimatorActions) | null>(null);

export const AnimatorProvider = ({ children }: { children: ReactNode }) => {
  const [beforeSnippet, setBeforeSnippetState] = useState<CodeSnippet | null>(null);
  const [afterSnippet, setAfterSnippetState] = useState<CodeSnippet | null>(null);
  const [history, setHistory] = useState<CodeSnippet[]>([]);
  const [maxHistory] = useState(10);
  const [config, setConfigState] = useState<AnimationConfig>(DEFAULT_CONFIG);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [diffResult, setDiffResult] = useState<DiffOperation[] | null>(null);
  const [activeView, setActiveView] = useState<"editor" | "diff" | "preview">("editor");
  const [highlighter, setHighlighter] = useState<Highlighter | null>(null);

  // Load saved state on mount
  useEffect(() => {
    const savedHistory = loadHistory();
    if (savedHistory) {
      setHistory(savedHistory.snippets.slice(0, savedHistory.maxHistory));
    }

    const savedConfig = loadConfig();
    if (savedConfig) {
      setConfigState(savedConfig);
    }

    const savedSession = loadSession();
    if (savedSession) {
      setBeforeSnippetState(savedSession.beforeSnippet);
      setAfterSnippetState(savedSession.afterSnippet);
    }
  }, []);

  // Save session whenever snippets change
  useEffect(() => {
    saveSession({
      beforeSnippet,
      afterSnippet,
      timestamp: Date.now(),
    });
  }, [beforeSnippet, afterSnippet]);

  // Save config whenever it changes
  useEffect(() => {
    saveConfig(config);
  }, [config]);

  const setBeforeSnippet = useCallback((snippet: CodeSnippet) => {
    setBeforeSnippetState(snippet);
    setCurrentTime(0);
    setIsPlaying(false);
  }, []);

  const setAfterSnippet = useCallback((snippet: CodeSnippet) => {
    setAfterSnippetState(snippet);
    setCurrentTime(0);
    setIsPlaying(false);
  }, []);

  const updateSnippet = useCallback(
    (which: "before" | "after", code: string, language: string) => {
      const snippet: CodeSnippet = {
        id: generateId(),
        code,
        language,
        timestamp: Date.now(),
      };

      if (which === "before") {
        setBeforeSnippet(snippet);
      } else {
        setAfterSnippet(snippet);
      }
    },
    [setBeforeSnippet, setAfterSnippet]
  );

  const addToHistory = useCallback(
    (snippet: CodeSnippet) => {
      setHistory((prev) => {
        const newHistory = [snippet, ...prev].slice(0, maxHistory);
        saveHistory({ snippets: newHistory, maxHistory });
        return newHistory;
      });
    },
    [maxHistory]
  );

  const loadFromHistory = useCallback(
    (snippetId: string, which: "before" | "after") => {
      const snippet = history.find((s) => s.id === snippetId);
      if (snippet) {
        if (which === "before") {
          setBeforeSnippet(snippet);
        } else {
          setAfterSnippet(snippet);
        }
      }
    },
    [history, setBeforeSnippet, setAfterSnippet]
  );

  const deleteFromHistory = useCallback((snippetId: string) => {
    setHistory((prev) => {
      const newHistory = prev.filter((s) => s.id !== snippetId);
      saveHistory({ snippets: newHistory, maxHistory: 10 });
      return newHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory({ snippets: [], maxHistory: 10 });
  }, []);

  const updateConfig = useCallback((newConfig: Partial<AnimationConfig>) => {
    setConfigState((prev) => ({ ...prev, ...newConfig }));
  }, []);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const reset = useCallback(() => {
    setCurrentTime(0);
    setIsPlaying(false);
  }, []);

  const seek = useCallback((time: number) => {
    setCurrentTime(Math.max(0, Math.min(time, config.duration)));
  }, [config.duration]);

  const value = {
    // State
    beforeSnippet,
    afterSnippet,
    history,
    maxHistory,
    config,
    isPlaying,
    currentTime,
    diffResult,
    activeView,
    highlighter,
    // Actions
    setBeforeSnippet,
    setAfterSnippet,
    updateSnippet,
    loadFromHistory,
    deleteFromHistory,
    clearHistory,
    addToHistory,
    updateConfig,
    play,
    pause,
    reset,
    seek,
    setActiveView,
    setDiffResult,
    setHighlighter,
  };

  return <AnimatorContext.Provider value={value}>{children}</AnimatorContext.Provider>;
};

export const useAnimator = () => {
  const context = useContext(AnimatorContext);
  if (!context) {
    throw new Error("useAnimator must be used within AnimatorProvider");
  }
  return context;
};
