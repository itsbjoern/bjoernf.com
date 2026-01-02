import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAnimator } from "../Context/AnimatorContext";

type EditorProps = {
  which: "before" | "after";
  className?: string;
};

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

export const Editor = ({ which, className = "" }: EditorProps) => {
  const { beforeSnippet, afterSnippet, updateSnippet, highlighter, addToHistory } =
    useAnimator();

  const snippet = which === "before" ? beforeSnippet : afterSnippet;
  const [code, setCode] = useState(snippet?.code || "");
  const [language, setLanguage] = useState(snippet?.language || "javascript");
  const [highlightedHtml, setHighlightedHtml] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update local state when snippet changes from outside
  useEffect(() => {
    if (snippet) {
      setCode(snippet.code);
      setLanguage(snippet.language);
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
      if (code !== snippet?.code || language !== snippet?.language) {
        updateSnippet(which, code, language);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [code, language, which, snippet, updateSnippet]);

  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  }, []);

  const handleLanguageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setLanguage(e.target.value);
    },
    []
  );

  const handleSaveToHistory = useCallback(() => {
    if (snippet) {
      const name = prompt("Enter a name for this snippet:");
      if (name) {
        addToHistory({
          ...snippet,
          metadata: { ...snippet.metadata, name },
        });
      }
    }
  }, [snippet, addToHistory]);

  const lineCount = code.split("\n").length;
  const lineNumbers = useMemo(
    () => Array.from({ length: lineCount }, (_, i) => i + 1),
    [lineCount]
  );

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-lg">
          {which === "before" ? "Before" : "After"}
        </h3>
        <div className="flex gap-2">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="px-3 py-1 border border-gray-300 rounded bg-white text-sm"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleSaveToHistory}
            className="px-3 py-1 bg-primary text-white rounded text-sm hover:opacity-80"
            disabled={!code}
          >
            Save to History
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
              placeholder={`Enter ${which === "before" ? "initial" : "final"} code here...`}
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
