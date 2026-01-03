import { useAnimator } from "../Context/AnimatorContext";

export const HistoryBrowser = () => {
  const { history, loadFromHistory, deleteFromHistory, clearHistory } = useAnimator();

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  if (history.length === 0) {
    return (
      <div className="border border-gray-300 rounded p-8 text-center text-gray-600">
        No saved snippets yet. Click "Save to History" in the editor to save code
        snippets.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">
          Saved Snippets ({history.length}/10)
        </h3>
        <button
          onClick={clearHistory}
          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
        >
          Clear All
        </button>
      </div>

      <div className="grid gap-3">
        {history.map((snippet) => (
          <div
            key={snippet.id}
            className="border border-gray-300 rounded p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="font-semibold">
                  {snippet.metadata?.name || "Untitled Snippet"}
                </h4>
                <div className="text-sm text-gray-600 mt-1">
                  <span className="inline-block px-2 py-0.5 bg-gray-200 rounded text-xs mr-2">
                    {snippet.language}
                  </span>
                  <span>{formatTimestamp(snippet.timestamp)}</span>
                </div>
                {snippet.metadata?.description && (
                  <p className="text-sm text-gray-600 mt-2">
                    {snippet.metadata.description}
                  </p>
                )}
              </div>

              <button
                onClick={() => deleteFromHistory(snippet.id)}
                className="ml-4 text-red-600 hover:text-red-800 text-sm"
                title="Delete snippet"
              >
                ✕
              </button>
            </div>

            <div className="bg-gray-100 rounded p-3 font-mono text-xs overflow-x-auto mb-3">
              <pre className="whitespace-pre-wrap break-all line-clamp-3">
                {snippet.code}
              </pre>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => loadFromHistory(snippet.id, "before")}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Load as Before
              </button>
              <button
                onClick={() => loadFromHistory(snippet.id, "after")}
                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
              >
                Load as After
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
