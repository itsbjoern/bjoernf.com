import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type ExportFormat = "gif" | "mp4";

export type ExportSettings = {
  format: ExportFormat;
  quality: number; // 1-10 for GIF, bitrate for MP4
  fps: number;
  width: number;
  height: number;
};

type ExportState = {
  isExporting: boolean;
  progress: number; // 0-100
  currentFormat: ExportFormat | null;
  error: string | null;
  ffmpegLoaded: boolean;
  ffmpegSupported: boolean;
};

type ExportActions = {
  setExporting: (isExporting: boolean) => void;
  setProgress: (progress: number) => void;
  setCurrentFormat: (format: ExportFormat | null) => void;
  setError: (error: string | null) => void;
  setFFmpegLoaded: (loaded: boolean) => void;
  setFFmpegSupported: (supported: boolean) => void;
  resetExport: () => void;
};

const ExportContext = createContext<(ExportState & ExportActions) | null>(null);

export const ExportProvider = ({ children }: { children: ReactNode }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFormat, setCurrentFormat] = useState<ExportFormat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ffmpegLoaded, setFFmpegLoaded] = useState(false);
  const [ffmpegSupported, setFFmpegSupported] = useState(true);

  const setExporting = useCallback((value: boolean) => {
    setIsExporting(value);
    if (!value) {
      setProgress(0);
    }
  }, []);

  const resetExport = useCallback(() => {
    setIsExporting(false);
    setProgress(0);
    setCurrentFormat(null);
    setError(null);
  }, []);

  const value = {
    isExporting,
    progress,
    currentFormat,
    error,
    ffmpegLoaded,
    ffmpegSupported,
    setExporting,
    setProgress,
    setCurrentFormat,
    setError,
    setFFmpegLoaded,
    setFFmpegSupported,
    resetExport,
  };

  return <ExportContext.Provider value={value}>{children}</ExportContext.Provider>;
};

export const useExport = () => {
  const context = useContext(ExportContext);
  if (!context) {
    throw new Error("useExport must be used within ExportProvider");
  }
  return context;
};
