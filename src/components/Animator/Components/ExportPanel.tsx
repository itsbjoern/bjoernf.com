import { useState } from "react";
import { useAnimator } from "../Context/AnimatorContext";
import { useExport, type ExportSettings } from "../Context/ExportContext";
import { useToast } from "../Toasts";
import { exportGIF, exportMP4, downloadBlob } from "../exportEngine";

export const ExportPanel = () => {
  const { snippets, config, highlighter, language } = useAnimator();
  const { setExporting, setProgress, setCurrentFormat, setError, ffmpegLoaded, resetExport } =
    useExport();
  const { addToast } = useToast();

  const [settings, setSettings] = useState<ExportSettings>({
    format: "gif",
    quality: 8,
    fps: 30,
    padding: 40,
  });

  const handleExport = async (format: "gif" | "mp4") => {
    if (snippets.length < 2 || !highlighter) {
      addToast({ message: "Please enter code in at least 2 snippets first", color: "bg-red-500" });
      return;
    }

    setExporting(true);
    setCurrentFormat(format);
    setError(null);
    setProgress({ percentage: 0, message: "Starting export..." });

    try {
      let blob: Blob;

      if (format === "gif") {
        blob = await exportGIF(
          snippets,
          config,
          highlighter,
          { ...settings, format: "gif" },
          setProgress,
          language
        );
        downloadBlob(blob, `code-animation-${Date.now()}.gif`);
        addToast({ message: "GIF exported successfully!", color: "bg-green-500" });
      } else {
        blob = await exportMP4(
          snippets,
          config,
          highlighter,
          { ...settings, format: "mp4" },
          setProgress,
          language
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
    <div className="border border-gray-300 rounded p-6 bg-white max-w-3xl">
      <h3 className="font-semibold text-lg mb-4">Export Animation</h3>

      {/* Export Settings */}
      <div className="mb-6">
        <h4 className="font-medium text-base mb-4">Export Settings</h4>
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded">
          <div>
            <label className="block text-sm font-medium mb-1">Padding (px)</label>
            <input
              type="number"
              value={settings.padding}
              onChange={(e) =>
                setSettings({ ...settings, padding: parseInt(e.target.value) })
              }
              className="w-full px-3 py-1 border border-gray-300 rounded"
              min="10"
              max="100"
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
        <p className="text-xs text-gray-600 mt-2">
          Canvas size is automatically calculated based on code content. Padding is added on all sides.
        </p>
      </div>

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
          {!ffmpegLoaded && <span className="text-xs block">~31MB loaded from unpkg.com</span>}
        </button>
      </div>

      <p className="text-sm text-gray-600 mt-4">
        Exports all transitions between snippets. Exports are processed entirely in your browser. No data is sent to any server. MP4 export requires FFmpeg (~31MB) loaded from unpkg.com.
      </p>
    </div>
  );
};
