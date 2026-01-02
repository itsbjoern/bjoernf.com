import { useEffect, useMemo } from "react";
import { useAnimator } from "../Context/AnimatorContext";
import { computeDiff, getDiffStats } from "../diffEngine";

export const DiffView = () => {
  const { beforeSnippet, afterSnippet, diffResult, setDiffResult, highlighter } = useAnimator();

  // Compute diff when snippets change
  useEffect(() => {
    if (beforeSnippet && afterSnippet) {
      const result = computeDiff(beforeSnippet.code, afterSnippet.code);
      setDiffResult(result);
    } else {
      setDiffResult(null);
    }
  }, [beforeSnippet, afterSnippet, setDiffResult]);

  const stats = useMemo(() => {
    if (!diffResult) return null;
    return getDiffStats(diffResult);
  }, [diffResult]);

  const highlightLine = (code: string, language: string) => {
    if (!highlighter || !code) return "";
    try {
      return highlighter.codeToHtml(code, {
        lang: language,
        theme: "github-dark",
      });
    } catch {
      return `<pre>${code}</pre>`;
    }
  };

  if (!beforeSnippet || !afterSnippet) {
    return (
      <div className="text-center py-20 text-gray-600">
        Enter code in both editors to see the diff
      </div>
    );
  }

  if (!diffResult || diffResult.length === 0) {
    return (
      <div className="text-center py-20 text-gray-600">
        No differences found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      {stats && (
        <div className="flex gap-4 text-sm">
          <span className="text-gray-600">
            Total lines: <strong>{stats.total}</strong>
          </span>
          <span className="text-gray-600">
            Unchanged: <strong>{stats.unchanged}</strong>
          </span>
          <span className="text-green-600">
            Added: <strong>{stats.inserted}</strong>
          </span>
          <span className="text-red-600">
            Removed: <strong>{stats.deleted}</strong>
          </span>
          <span className="text-yellow-600">
            Modified: <strong>{stats.modified}</strong>
          </span>
        </div>
      )}

      {/* Diff Display */}
      <div className="border border-gray-300 rounded overflow-hidden bg-[#0d1117]">
        <div className="grid grid-cols-2 border-b border-gray-700">
          <div className="px-4 py-2 font-semibold bg-[#161b22] border-r border-gray-700 text-white">
            Before
          </div>
          <div className="px-4 py-2 font-semibold bg-[#161b22] text-white">After</div>
        </div>

        <div className="grid grid-cols-2">
          {/* Before column */}
          <div className="border-r border-gray-700 overflow-auto max-h-[600px]">
            {diffResult.map((op, index) => {
              if (op.type === "insert") {
                return (
                  <div
                    key={index}
                    className="px-4 py-1 font-mono text-sm bg-[#0d1117] text-gray-500"
                  >
                    {/* Empty line for insertions */}
                  </div>
                );
              }

              const line = op.type === "modify" ? op.oldLine : op.line;
              const bgColor =
                op.type === "delete"
                  ? "bg-red-900/30"
                  : op.type === "modify"
                  ? "bg-yellow-900/30"
                  : "bg-[#0d1117]";

              return (
                <div key={index} className={`px-4 py-1 font-mono text-sm ${bgColor}`}>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: highlightLine(line, beforeSnippet.language),
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* After column */}
          <div className="overflow-auto max-h-[600px]">
            {diffResult.map((op, index) => {
              if (op.type === "delete") {
                return (
                  <div
                    key={index}
                    className="px-4 py-1 font-mono text-sm bg-[#0d1117] text-gray-500"
                  >
                    {/* Empty line for deletions */}
                  </div>
                );
              }

              const line = op.type === "modify" ? op.newLine : op.line;
              const bgColor =
                op.type === "insert"
                  ? "bg-green-900/30"
                  : op.type === "modify"
                  ? "bg-yellow-900/30"
                  : "bg-[#0d1117]";

              return (
                <div key={index} className={`px-4 py-1 font-mono text-sm ${bgColor}`}>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: highlightLine(line, afterSnippet.language),
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
