import { useEffect, useRef, useState } from "react";
import { useAnimator } from "../Context/AnimatorContext";
import { computeFrameStates } from "../animationEngine";
import { computeDiff } from "../diffEngine";
import { calculateTimeline, getPhaseAtTime, createRenderConfig } from "../animationTimeline";
import { renderFrameToCanvas } from "../canvasRenderer";

export const Preview = () => {
  const { snippets, config, highlighter, language } = useAnimator();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<number>(0);

  // Auto-play animation loop
  useEffect(() => {
    if (snippets.length < 2 || !highlighter || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Calculate timeline
    const timeline = calculateTimeline(config.duration, snippets.length);

    // Compute diffs for all transitions
    const transitions = snippets.slice(0, -1).map((snippet, i) => ({
      from: snippet,
      to: snippets[i + 1],
      diffOps: computeDiff(snippet.code, snippets[i + 1].code, highlighter, language, "github-dark"),
    }));

    // Create render config with default padding for preview
    const renderConfig = createRenderConfig(canvas.width, canvas.height, config, 20);

    let startTime = performance.now();
    let pausedTime = 0;

    const animate = (timestamp: number) => {

      if (isPaused) {
        pausedTime = timestamp - startTime;
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      renderConfig.width = canvas.width;
      renderConfig.height = canvas.height;

      const elapsed = timestamp - startTime - pausedTime;
      const animationTime = elapsed % timeline.totalDuration;

      // Get current phase
      const phase = getPhaseAtTime(animationTime, timeline);

      // Compute frame states based on current phase
      let frameStates;
      if (phase.isTransitioning) {
        // Show transition animation
        const currentTransition = transitions[phase.currentScreenIndex];
        if (!currentTransition || currentTransition.diffOps.length === 0) {
          animationRef.current = requestAnimationFrame(animate);
          return;
        }
        frameStates = computeFrameStates(currentTransition.diffOps, phase.progress, config);
      } else {
        // Show static screen
        const snippet = snippets[phase.currentScreenIndex];
        const staticDiff = computeDiff(snippet.code, snippet.code, highlighter, language, "github-dark");
        frameStates = computeFrameStates(staticDiff, 0, config);
      }

      // Render to canvas
      renderFrameToCanvas(ctx, frameStates, renderConfig, phase.currentScreenIndex, snippets.length, phase.staticProgress);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [snippets, config, highlighter, isPaused]);

  // Resize canvas to fit container
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const container = canvasRef.current.parentElement;
        if (container) {
          canvasRef.current.width = container.clientWidth;
          canvasRef.current.height = 600;
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate timeline for display in UI
  const timeline = calculateTimeline(config.duration, snippets.length);

  if (snippets.length < 2) {
    return (
      <div className="text-center py-20 text-gray-600">
        Add at least 2 code stages to see the animation preview
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Animation Preview</h3>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 font-medium"
          >
            {isPaused ? "▶ Play" : "⏸ Pause"}
          </button>
          <div className="text-sm text-gray-600">
            {snippets.length} stages • {timeline.totalDuration}ms total
          </div>
        </div>
      </div>

      <div className="border border-gray-300 rounded overflow-hidden bg-[#0d1117]">
        <canvas ref={canvasRef} className="w-full" />
      </div>

      <div className="text-sm text-gray-600 text-center">
        Each stage displays for {timeline.staticDuration}ms before transitioning to the next
      </div>
    </div>
  );
};
