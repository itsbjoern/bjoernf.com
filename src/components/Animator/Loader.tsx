import { useEffect, useState } from "react";
import { createHighlighter } from "shiki";
import { AnimatorProvider, useAnimator } from "./Context/AnimatorContext";
import { ExportProvider } from "./Context/ExportContext";
import { ToastProvider } from "./Toasts";
import { Animator } from "./Animator";

const LoaderInner = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setHighlighter } = useAnimator();

  useEffect(() => {
    const initShiki = async () => {
      try {
        const highlighter = await createHighlighter({
          themes: ["github-dark", "github-light"],
          langs: [
            "javascript",
            "typescript",
            "python",
            "rust",
            "go",
            "java",
            "cpp",
            "c",
            "html",
            "css",
            "json",
            "markdown",
          ],
        });

        setHighlighter(highlighter);
        setLoading(false);
      } catch (err) {
        console.error("Failed to initialize Shiki:", err);
        setError("Failed to load syntax highlighter");
        setLoading(false);
      }
    };

    initShiki();
  }, [setHighlighter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Code Animator...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded hover:opacity-80"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return <Animator />;
};

export const Loader = () => {
  return (
    <AnimatorProvider>
      <ExportProvider>
        <ToastProvider>
          <LoaderInner />
        </ToastProvider>
      </ExportProvider>
    </AnimatorProvider>
  );
};
