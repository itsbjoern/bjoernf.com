import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAnimator } from "../Context/AnimatorContext";

type EditorProps = {
  index: number;
  className?: string;
};


export const Editor = ({ index, className = "" }: EditorProps) => {
  const {
    snippets,
    language,
    updateSnippetCode,
    removeSnippet,
    moveSnippetUp,
    moveSnippetDown,
    highlighter,
  } = useAnimator();

  const snippet = snippets[index];
  const [code, setCode] = useState(snippet?.code || "");
  const [highlightedHtml, setHighlightedHtml] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update local state when snippet changes from outside
  useEffect(() => {
    if (snippet) {
      setCode(snippet.code);
    }
  }, [snippet]);

  // Highlight code whenever it changes
  useEffect(() => {
    if (!highlighter || !code) {
      setHighlightedHtml("");
      return;
    }

    try {
      const html = highlighter.codeToHtml(code, {
        lang: language,
        theme: "github-dark",
        transformers: [{
          pre(node) {
            delete node.properties.style
          }
        }]
      });
      setHighlightedHtml(html);
    } catch (error) {
      console.error("Failed to highlight code:", error);
      setHighlightedHtml("");
    }
  }, [code, language, highlighter]);

  // Debounced update to context
  useEffect(() => {
    const timer = setTimeout(() => {
      if (code !== snippet?.code) {
        updateSnippetCode(index, code);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [code, index, snippet, updateSnippetCode]);

  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  }, []);

  const lineCount = code.split("\n").length;
  const lineNumbers = useMemo(
    () => Array.from({ length: lineCount }, (_, i) => i + 1),
    [lineCount]
  );

  const canMoveUp = index > 0;
  const canMoveDown = index < snippets.length - 1;
  const canDelete = snippets.length > 2;

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-lg">Stage {index + 1}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => moveSnippetUp(index)}
            disabled={!canMoveUp}
            className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Move Up"
          >
            ↑
          </button>
          <button
            onClick={() => moveSnippetDown(index)}
            disabled={!canMoveDown}
            className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Move Down"
          >
            ↓
          </button>
          <button
            onClick={() => removeSnippet(index)}
            disabled={!canDelete}
            className="px-3 py-1 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Remove Stage"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="relative border border-gray-300 rounded overflow-hidden bg-[#0d1117]">
        <div className="flex">
          {/* Line numbers */}
          <div className="select-none bg-[#161b22] px-3 py-3 text-gray-500 font-mono text-sm leading-6 text-right border-r border-gray-700">
            {lineNumbers.map((num) => (
              <div key={num}>{num}</div>
            ))}
          </div>

          {/* Editor area */}
          <div className="flex-1 relative">
            {/* Highlighted code overlay */}
            {highlightedHtml && (
              <div
                className="absolute inset-0 pointer-events-none overflow-auto p-3 font-mono text-sm leading-6"
                dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                style={{
                  color: "transparent",
                  caretColor: "#fff",
                }}
              />
            )}

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={handleCodeChange}
              className="w-full h-[400px] p-3 font-mono text-sm leading-6 bg-transparent text-white resize-none outline-none"
              placeholder={`Enter code for stage ${index + 1}...`}
              spellCheck={false}
              style={{
                color: highlightedHtml ? "transparent" : "#fff",
                caretColor: "#fff",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
