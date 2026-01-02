import { useState } from "react";
import { useAnimator } from "./Context/AnimatorContext";
import { Toasts } from "./Toasts";
import { Editor } from "./Components/Editor";
import { DiffView } from "./Components/DiffView";
import { Preview } from "./Components/Preview";
import { HistoryBrowser } from "./Components/HistoryBrowser";
import { ExportPanel } from "./Components/ExportPanel";
import { ExportModal } from "./Modals/ExportModal";
import { SettingsModal } from "./Modals/SettingsModal";

export const Animator = () => {
  const { activeView, setActiveView } = useAnimator();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-default text-primary">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">Code Animator</h1>
              <p className="text-gray-600">
                Create smooth animations between code snippets with syntax highlighting
              </p>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              title="Animation Settings"
            >
              ⚙️ Settings
            </button>
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
            onClick={() => setActiveView("diff")}
            className={`px-4 py-2 font-medium ${
              activeView === "diff"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-600 hover:text-primary"
            }`}
          >
            Diff
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
            <div className="grid md:grid-cols-2 gap-4">
              <Editor which="before" />
              <Editor which="after" />
            </div>
          )}

          {activeView === "diff" && <DiffView />}

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
