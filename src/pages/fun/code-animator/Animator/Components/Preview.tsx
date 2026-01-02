import { useEffect, useRef, useState } from "react";
import { useAnimator } from "../Context/AnimatorContext";
import { computeFrameStates } from "../animationEngine";
import { computeDiff } from "../diffEngine";

export const Preview = () => {
  const { snippets, config, highlighter } = useAnimator();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(0);

  // Auto-play animation loop
  useEffect(() => {
    if (snippets.length < 2 || !highlighter || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Calculate total duration and prepare transitions
    const staticDuration = config.duration; // Time to show each static screen
    const transitionDuration = config.duration * 0.5; // Time for transition animation
    const cycleDuration = staticDuration + transitionDuration; // Time for one screen + transition
    const totalDuration = snippets.length * staticDuration + (snippets.length - 1) * transitionDuration;

    // Compute diffs for all transitions
    const transitions = snippets.slice(0, -1).map((snippet, i) => ({
      from: snippet,
      to: snippets[i + 1],
      diffOps: computeDiff(snippet.code, snippets[i + 1].code),
    }));

    let startTime = performance.now();
    let pausedTime = 0;

    const animate = (timestamp: number) => {
      if (isPaused) {
        pausedTime = timestamp - startTime;
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const elapsed = timestamp - startTime - pausedTime;
      const animationTime = elapsed % totalDuration;

      // Determine current state: which screen we're on and whether we're static or transitioning
      let currentScreenIndex = 0;
      let isTransitioning = false;
      let progress = 0;
      let staticProgress = 0; // Progress during static display (for progress bar)

      let accumulatedTime = 0;
      for (let i = 0; i < snippets.length; i++) {
        // Static display phase
        if (animationTime < accumulatedTime + staticDuration) {
          currentScreenIndex = i;
          isTransitioning = false;
          const timeInStatic = animationTime - accumulatedTime;
          staticProgress = timeInStatic / staticDuration;
          progress = 0; // No transition progress during static
          break;
        }
        accumulatedTime += staticDuration;

        // Transition phase (if not the last screen)
        if (i < snippets.length - 1) {
          if (animationTime < accumulatedTime + transitionDuration) {
            currentScreenIndex = i;
            isTransitioning = true;
            const timeInTransition = animationTime - accumulatedTime;
            progress = timeInTransition / transitionDuration;
            staticProgress = 1; // Progress bar stays full during transition
            break;
          }
          accumulatedTime += transitionDuration;
        }
      }

      let frameStates;

      if (isTransitioning) {
        // Show transition animation
        const currentTransition = transitions[currentScreenIndex];
        if (!currentTransition || currentTransition.diffOps.length === 0) {
          animationRef.current = requestAnimationFrame(animate);
          return;
        }
        frameStates = computeFrameStates(currentTransition.diffOps, progress, config);
      } else {
        // Show static screen
        const snippet = snippets[currentScreenIndex];
        const staticDiff = computeDiff(snippet.code, snippet.code);
        frameStates = computeFrameStates(staticDiff, 0, config);
      }

      // Clear canvas
      ctx.fillStyle = config.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set up text rendering
      ctx.font = `${config.fontSize}px monospace`;
      ctx.textBaseline = "top";
      ctx.textAlign = "left";

      const paddingX = 20;
      const paddingTopY = 30; // Extra padding at top for progress bar
      const lineHeight = config.fontSize * config.lineHeight;

      // Render each line with segments
      for (const frame of frameStates) {
        // Render each segment in the line
        for (const segment of frame.segments) {
          ctx.globalAlpha = segment.opacity;

          // Apply blur filter
          if (segment.blur > 0) {
            ctx.filter = `blur(${segment.blur}px)`;
          } else {
            ctx.filter = "none";
          }

          // Render the segment
          ctx.fillStyle = segment.color || "#e6edf3";
          ctx.fillText(segment.text, paddingX + segment.x, paddingTopY + segment.y);
        }
      }

      // Reset filters and alpha
      ctx.filter = "none";
      ctx.globalAlpha = 1;

      // Segmented progress bars at the top - one segment per screen
      const progressBarHeight = 4;
      const progressBarY = 10;
      const progressBarWidth = canvas.width - paddingX * 2;
      const segmentGap = 4;
      const numScreens = snippets.length;
      const segmentWidth = (progressBarWidth - (numScreens - 1) * segmentGap) / numScreens;

      // Draw all segments
      for (let i = 0; i < numScreens; i++) {
        const segmentX = paddingX + i * (segmentWidth + segmentGap);

        // Background
        ctx.fillStyle = "#30363d";
        ctx.fillRect(segmentX, progressBarY, segmentWidth, progressBarHeight);

        // Determine fill for this segment
        if (i < currentScreenIndex) {
          // Completed segment (past screens)
          ctx.fillStyle = "#58a6ff";
          ctx.fillRect(segmentX, progressBarY, segmentWidth, progressBarHeight);
        } else if (i === currentScreenIndex) {
          // Current segment - show static progress (paused during transition)
          ctx.fillStyle = "#58a6ff";
          ctx.fillRect(segmentX, progressBarY, segmentWidth * staticProgress, progressBarHeight);
        }
      }

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

  const staticDuration = config.duration;
  const transitionDuration = config.duration * 0.5;
  const totalDuration = snippets.length * staticDuration + (snippets.length - 1) * transitionDuration;

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
            {snippets.length} stages • {staticDuration}ms display • {transitionDuration}ms transition • {totalDuration}ms total
          </div>
        </div>
      </div>

      <div className="border border-gray-300 rounded overflow-hidden bg-[#0d1117]">
        <canvas ref={canvasRef} className="w-full" />
      </div>

      <div className="text-sm text-gray-600 text-center">
        Each stage displays for {staticDuration}ms before transitioning to the next
      </div>
    </div>
  );
};
