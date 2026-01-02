import { useState } from "react";
import { useAnimator } from "../Context/AnimatorContext";
import type { AnimationConfig } from "../util";

type SettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const THEMES = [
  { value: "github-dark", label: "GitHub Dark" },
  { value: "github-light", label: "GitHub Light" },
];

const EASING_OPTIONS = [
  { value: "linear", label: "Linear" },
  { value: "ease-in", label: "Ease In" },
  { value: "ease-out", label: "Ease Out" },
  { value: "ease-in-out", label: "Ease In-Out" },
];

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { config, updateConfig } = useAnimator();
  const [localConfig, setLocalConfig] = useState<AnimationConfig>(config);

  const handleSave = () => {
    updateConfig(localConfig);
    onClose();
  };

  const handleReset = () => {
    const defaultConfig: AnimationConfig = {
      duration: 2000,
      fps: 60,
      easing: "ease-in-out",
      theme: "github-dark",
      backgroundColor: "#0d1117",
      fontSize: 14,
      lineHeight: 1.5,
    };
    setLocalConfig(defaultConfig);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Animation Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Duration */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Animation Duration: {localConfig.duration}ms
            </label>
            <input
              type="range"
              min="500"
              max="5000"
              step="100"
              value={localConfig.duration}
              onChange={(e) =>
                setLocalConfig({ ...localConfig, duration: parseInt(e.target.value) })
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>0.5s</span>
              <span>5s</span>
            </div>
          </div>

          {/* FPS */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Frame Rate: {localConfig.fps} FPS
            </label>
            <input
              type="range"
              min="15"
              max="60"
              step="5"
              value={localConfig.fps}
              onChange={(e) =>
                setLocalConfig({ ...localConfig, fps: parseInt(e.target.value) })
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>15 FPS</span>
              <span>60 FPS</span>
            </div>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm font-medium mb-2">Color Theme</label>
            <select
              value={localConfig.theme}
              onChange={(e) =>
                setLocalConfig({
                  ...localConfig,
                  theme: e.target.value,
                  backgroundColor:
                    e.target.value === "github-dark" ? "#0d1117" : "#ffffff",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              {THEMES.map((theme) => (
                <option key={theme.value} value={theme.value}>
                  {theme.label}
                </option>
              ))}
            </select>
          </div>

          {/* Easing */}
          <div>
            <label className="block text-sm font-medium mb-2">Easing Function</label>
            <select
              value={localConfig.easing}
              onChange={(e) =>
                setLocalConfig({
                  ...localConfig,
                  easing: e.target.value as AnimationConfig["easing"],
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              {EASING_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Font Size: {localConfig.fontSize}px
            </label>
            <input
              type="range"
              min="10"
              max="24"
              step="1"
              value={localConfig.fontSize}
              onChange={(e) =>
                setLocalConfig({ ...localConfig, fontSize: parseInt(e.target.value) })
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>10px</span>
              <span>24px</span>
            </div>
          </div>

          {/* Line Height */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Line Height: {localConfig.lineHeight.toFixed(1)}
            </label>
            <input
              type="range"
              min="1.0"
              max="2.0"
              step="0.1"
              value={localConfig.lineHeight}
              onChange={(e) =>
                setLocalConfig({
                  ...localConfig,
                  lineHeight: parseFloat(e.target.value),
                })
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>1.0</span>
              <span>2.0</span>
            </div>
          </div>

          {/* Background Color */}
          <div>
            <label className="block text-sm font-medium mb-2">Background Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localConfig.backgroundColor}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, backgroundColor: e.target.value })
                }
                className="h-10 w-20"
              />
              <input
                type="text"
                value={localConfig.backgroundColor}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, backgroundColor: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Reset to Defaults
          </button>
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
