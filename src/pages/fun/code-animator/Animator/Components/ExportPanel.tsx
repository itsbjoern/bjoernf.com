import { useState } from "react";
import { useAnimator } from "../Context/AnimatorContext";
import { useExport, type ExportSettings } from "../Context/ExportContext";
import { useToast } from "../Toasts";
import { computeDiff } from "../diffEngine";
import { exportGIF, exportMP4, downloadBlob } from "../exportEngine";

export const ExportPanel = () => {
  const { snippets, config, highlighter } = useAnimator();
  const { setExporting, setProgress, setCurrentFormat, setError, ffmpegLoaded, resetExport } =
    useExport();
  const { addToast } = useToast();

  const [settings, setSettings] = useState<ExportSettings>({
    format: "gif",
    quality: 8,
    fps: 30,
    width: 800,
    height: 600,
  });

  const [showSettings, setShowSettings] = useState(false);

  const handleExport = async (format: "gif" | "mp4") => {
    if (snippets.length < 2 || !highlighter) {
      addToast({ message: "Please enter code in at least 2 stages first", color: "bg-red-500" });
      return;
    }

    setExporting(true);
    setCurrentFormat(format);
    setError(null);
    setProgress(0);

    try {
      // Create a temporary canvas for export
      const canvas = document.createElement("canvas");
      canvas.width = settings.width;
      canvas.height = settings.height;

      // For now, export the first transition (we can enhance this later to export all)
      const beforeSnippet = snippets[0];
      const afterSnippet = snippets[1];

      // Compute diff
      const diffOps = computeDiff(beforeSnippet.code, afterSnippet.code);

      let blob: Blob;

      if (format === "gif") {
        blob = await exportGIF(
          canvas,
          diffOps,
          config,
          highlighter,
          { ...settings, format: "gif" },
          setProgress
        );
        downloadBlob(blob, `code-animation-${Date.now()}.gif`);
        addToast({ message: "GIF exported successfully!", color: "bg-green-500" });
      } else {
        blob = await exportMP4(
          canvas,
          diffOps,
          config,
          highlighter,
          { ...settings, format: "mp4" },
          setProgress
        );
        downloadBlob(blob, `code-animation-${Date.now()}.mp4`);
        addToast({ message: "MP4 exported successfully!", color: "bg-green-500" });
      }
    } catch (error) {
      console.error("Export failed:", error);
      const message = error instanceof Error ? error.message : "Export failed";
      setError(message);
      addToast({ message: `Export failed: ${message}`, color: "bg-red-500" });
    } finally {
      resetExport();
    }
  };

  return (
    <div className="border border-gray-300 rounded p-6 bg-white">
      <h3 className="font-semibold text-lg mb-4">Export Animation</h3>

      {/* Settings Toggle */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="text-sm text-blue-600 hover:underline mb-4"
      >
        {showSettings ? "Hide" : "Show"} Export Settings
      </button>

      {/* Export Settings */}
      {showSettings && (
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded">
          <div>
            <label className="block text-sm font-medium mb-1">Width (px)</label>
            <input
              type="number"
              value={settings.width}
              onChange={(e) =>
                setSettings({ ...settings, width: parseInt(e.target.value) })
              }
              className="w-full px-3 py-1 border border-gray-300 rounded"
              min="400"
              max="1920"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Height (px)</label>
            <input
              type="number"
              value={settings.height}
              onChange={(e) =>
                setSettings({ ...settings, height: parseInt(e.target.value) })
              }
              className="w-full px-3 py-1 border border-gray-300 rounded"
              min="300"
              max="1080"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">FPS</label>
            <input
              type="number"
              value={settings.fps}
              onChange={(e) => setSettings({ ...settings, fps: parseInt(e.target.value) })}
              className="w-full px-3 py-1 border border-gray-300 rounded"
              min="15"
              max="60"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Quality (1-10)
            </label>
            <input
              type="number"
              value={settings.quality}
              onChange={(e) =>
                setSettings({ ...settings, quality: parseInt(e.target.value) })
              }
              className="w-full px-3 py-1 border border-gray-300 rounded"
              min="1"
              max="10"
            />
          </div>
        </div>
      )}

      {/* Export Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => handleExport("gif")}
          disabled={snippets.length < 2}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Export as GIF
        </button>

        <button
          onClick={() => handleExport("mp4")}
          disabled={snippets.length < 2}
          className="flex-1 px-6 py-3 bg-green-600 text-white rounded font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Export as MP4
          {!ffmpegLoaded && <span className="text-xs block">~31MB initial load</span>}
        </button>
      </div>

      <p className="text-sm text-gray-600 mt-4">
        Exports the first transition (Stage 1 → 2). Exports are processed entirely in your browser. No data is sent to any server.
      </p>
    </div>
  );
};
