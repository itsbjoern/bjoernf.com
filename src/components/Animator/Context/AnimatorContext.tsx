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
  type SessionStorage,
  type HistoryStorage,
} from "../util";
import type { EnhancedDiffOperation } from "../diffEngine";

export type DiffOperation = EnhancedDiffOperation;

type AnimatorState = {
  // Snippet management
  snippets: CodeSnippet[];
  language: string;
  history: HistoryStorage;

  // Animation state
  config: AnimationConfig;
  isPlaying: boolean;
  currentTime: number;

  // Diff data
  diffResult: DiffOperation[] | null;

  // UI state
  activeView: "editor" | "preview" | "settings" | "export";

  // Shiki instance
  highlighter: Highlighter | null;
};

type AnimatorActions = {
  // Snippet management
  addSnippet: () => void;
  removeSnippet: (index: number) => void;
  updateSnippetCode: (index: number, code: string) => void;
  moveSnippetUp: (index: number) => void;
  moveSnippetDown: (index: number) => void;
  setLanguage: (language: string) => void;

  // History management
  loadFromHistory: (sessionId: string) => void;
  deleteFromHistory: (sessionId: string) => void;
  clearHistory: () => void;
  addToHistory: (session: SessionStorage) => void;
  saveSessionToHistory: () => void;

  updateConfig: (config: Partial<AnimationConfig>) => void;

  play: () => void;
  pause: () => void;

  setActiveView: (view: "editor" | "preview" | "settings" | "export") => void;

  setDiffResult: (result: DiffOperation[] | null) => void;
  setHighlighter: (highlighter: Highlighter) => void;
};

const DEFAULT_CONFIG: AnimationConfig = {
  staticDuration: 900,
  transitionDuration: 1800,
  easing: "ease-in-out",
  theme: "github-dark",
  backgroundColor: "#1d2025",
  fontSize: 16,
  lineHeight: 1.4,
  showLineNumbers: true,
};

const AnimatorContext = createContext<(AnimatorState & AnimatorActions) | null>(null);

export const AnimatorProvider = ({ children }: { children: ReactNode }) => {
  const [snippets, setSnippets] = useState<CodeSnippet[]>([
    { id: generateId(), code: "", language: "javascript", timestamp: Date.now() },
    { id: generateId(), code: "", language: "javascript", timestamp: Date.now() },
  ]);
  const [language, setLanguageState] = useState<string>("javascript");
  const [history, setHistory] = useState<HistoryStorage>({ sessions: [] });
  const [config, setConfigState] = useState<AnimationConfig>(DEFAULT_CONFIG);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [diffResult, setDiffResult] = useState<DiffOperation[] | null>(null);
  const [activeView, setActiveView] = useState<"editor" | "preview" | "settings" | "export">("editor");
  const [highlighter, setHighlighter] = useState<Highlighter | null>(null);

  // Load saved state on mount
  useEffect(() => {
    const savedHistory = loadHistory();
    if (savedHistory) {
      setHistory({ sessions: savedHistory.sessions.slice(0, 10) });
    }

    const savedConfig = loadConfig();
    if (savedConfig) {
      setConfigState(savedConfig);
    }

    const savedSession = loadSession();
    if (savedSession && savedSession.snippets.length > 0) {
      setSnippets(savedSession.snippets);
      setLanguageState(savedSession.language);
    }
  }, []);

  // Save session whenever snippets or language change
  useEffect(() => {
    saveSession({
      id: generateId(),
      snippets,
      language,
      timestamp: Date.now(),
      metadata: { name: "autosave" },
    });
  }, [snippets, language]);

  // Save config whenever it changes
  useEffect(() => {
    saveConfig(config);
  }, [config]);

  // Snippet management
  const addSnippet = useCallback(() => {
    setSnippets((prev) => [
      ...prev,
      { id: generateId(), code: "", language, timestamp: Date.now() },
    ]);
  }, [language]);

  const removeSnippet = useCallback((index: number) => {
    setSnippets((prev) => {
      if (prev.length <= 2) return prev; // Keep at least 2 snippets
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const updateSnippetCode = useCallback((index: number, code: string) => {
    setSnippets((prev) =>
      prev.map((snippet, i) =>
        i === index ? { ...snippet, code, language, timestamp: Date.now() } : snippet
      )
    );
    setCurrentTime(0);
    setIsPlaying(false);
  }, [language]);

  const moveSnippetUp = useCallback((index: number) => {
    if (index === 0) return;
    setSnippets((prev) => {
      const newSnippets = [...prev];
      [newSnippets[index - 1], newSnippets[index]] = [newSnippets[index], newSnippets[index - 1]];
      return newSnippets;
    });
  }, []);

  const moveSnippetDown = useCallback((index: number) => {
    setSnippets((prev) => {
      if (index === prev.length - 1) return prev;
      const newSnippets = [...prev];
      [newSnippets[index], newSnippets[index + 1]] = [newSnippets[index + 1], newSnippets[index]];
      return newSnippets;
    });
  }, []);

  const setLanguage = useCallback((newLanguage: string) => {
    setLanguageState(newLanguage);
    // Update all snippets to use the new language
    setSnippets((prev) =>
      prev.map((snippet) => ({ ...snippet, language: newLanguage }))
    );
  }, []);

  const addToHistory = useCallback(
    (session: SessionStorage) => {
      setHistory((prev) => {
        const newHistory = [...prev.sessions, session].slice(-10); // Keep only latest 10
        saveHistory({ sessions: newHistory });
        return { sessions: newHistory };
      });
    },
    []
  );

  const saveSessionToHistory = useCallback(() => {
    if (snippets.length === 0) return;

    const name = prompt("Enter a name for this animation session:");
    if (!name) return;

    const session: SessionStorage = {
      id: generateId(),
      snippets,
      language,
      timestamp: Date.now(),
      metadata: { name }
    };

    addToHistory(session);
  }, [snippets, language]);

  const loadFromHistory = useCallback(
    (sessionId: string) => {
      const session = history.sessions.find((s) => s.id === sessionId);
      if (session) {
        setSnippets(session.snippets);
        setLanguageState(session.language);
      }
    },
    [history]
  );

  const deleteFromHistory = useCallback((snippetId: string) => {
    setHistory((prev) => {
      const newHistory = prev.sessions.filter((s) => s.id !== snippetId);
      saveHistory({ sessions: newHistory });
      return { sessions: newHistory };
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory({ sessions: [] });
    saveHistory({ sessions: [] });
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

  const value = {
    // State
    snippets,
    language,
    history,
    config,
    isPlaying,
    currentTime,
    diffResult,
    activeView,
    highlighter,
    // Actions
    addSnippet,
    removeSnippet,
    updateSnippetCode,
    moveSnippetUp,
    moveSnippetDown,
    setLanguage,
    loadFromHistory,
    deleteFromHistory,
    clearHistory,
    addToHistory,
    saveSessionToHistory,
    updateConfig,
    play,
    pause,
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
