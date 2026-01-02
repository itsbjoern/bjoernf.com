import { useState } from "react";
import { useAnimator } from "./Context/AnimatorContext";
import { Toasts } from "./Toasts";
import { Editor } from "./Components/Editor";
import { Preview } from "./Components/Preview";
import { HistoryBrowser } from "./Components/HistoryBrowser";
import { ExportPanel } from "./Components/ExportPanel";
import { ExportModal } from "./Modals/ExportModal";
import { SettingsModal } from "./Modals/SettingsModal";

const SUPPORTED_LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "markdown", label: "Markdown" },
];

export const Animator = () => {
  const { activeView, setActiveView, snippets, language, setLanguage, addSnippet, saveSessionToHistory } = useAnimator();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-default text-primary">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">Code Animator</h1>
              <p className="text-gray-600">
                Create smooth animations between multiple code stages with syntax highlighting
              </p>
            </div>
            <div className="flex gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded bg-white text-sm"
                title="Language (applies to all stages)"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowSettings(true)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                title="Animation Settings"
              >
                ⚙️ Settings
              </button>
            </div>
          </div>
        </header>

        {/* View Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-300">
          <button
            onClick={() => setActiveView("editor")}
            className={`px-4 py-2 font-medium ${
              activeView === "editor"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-600 hover:text-primary"
            }`}
          >
            Editor
          </button>
          <button
            onClick={() => setActiveView("preview")}
            className={`px-4 py-2 font-medium ${
              activeView === "preview"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-600 hover:text-primary"
            }`}
          >
            Preview
          </button>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {activeView === "editor" && (
            <>
              <div className="space-y-4">
                {snippets.map((_, index) => (
                  <Editor key={snippets[index].id} index={index} />
                ))}
              </div>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={addSnippet}
                  className="px-4 py-2 bg-primary text-white rounded hover:opacity-80"
                >
                  + Add Stage
                </button>
                <button
                  onClick={saveSessionToHistory}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Save to History
                </button>
              </div>
            </>
          )}

          {activeView === "preview" && <Preview />}
        </div>

        {/* Export Panel */}
        <div className="mt-8">
          <ExportPanel />
        </div>

        {/* History Browser */}
        <div className="mt-12">
          <HistoryBrowser />
        </div>
      </div>

      <Toasts />
      <ExportModal />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
};
