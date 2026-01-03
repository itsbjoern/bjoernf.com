import { useAnimator } from "../Context/AnimatorContext";
import { useToast } from "../Toasts";

export const HistoryBrowser = () => {
  const { history, loadFromHistory, deleteFromHistory, clearHistory } = useAnimator();
  const { addToast } = useToast();

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  if (history.sessions.length === 0) {
    return (
      <div className="border border-gray-300 rounded p-8 text-center text-gray-600">
        No saved sessions yet. Click "Save to History" in the editor to save code
        snippets.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">
          Saved Snippets ({history.sessions.length}/10)
        </h3>
        <button
          onClick={clearHistory}
          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
        >
          Clear All
        </button>
      </div>

      <div className="grid gap-3">
        {history.sessions.map((session) => (
          <div
            key={session.id}
            className="border border-gray-300 bg-gray-200 rounded p-4 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="font-semibold">
                  {session.metadata?.name || "Untitled Snippet"}
                </h4>
                <div className="text-sm text-gray-600 mt-1">
                  <span className="inline-block px-2 py-0.5 bg-gray-300 rounded text-xs mr-2">
                    {session.language}
                  </span>
                  <span>{formatTimestamp(session.timestamp)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  deleteFromHistory(session.id);
                  addToast({
                    message: "Deleted snippet from history",
                    color: "bg-yellow-500",
                  })
                }}
                className="ml-4 text-red-600 hover:text-red-800 text-sm"
                title="Delete snippet"
              >
                ✕
              </button>
            </div>

            <div className="bg-gray-100 rounded p-3 font-mono text-xs overflow-x-auto mb-3">
              <pre className="whitespace-pre-wrap break-all line-clamp-3">
                {session.snippets[0].code}
              </pre>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  loadFromHistory(session.id)
                  addToast({
                    message: "Loaded snippet from history",
                    color: "bg-green-500",
                  })
                }}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Load
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
