import { useEffect, useRef, useState } from "react";
import { useAnimator } from "../Context/AnimatorContext";
import { computeFrameStates } from "../animationEngine";
import { computeDiff } from "../diffEngine";

export const Preview = () => {
  const { beforeSnippet, afterSnippet, config, highlighter } = useAnimator();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const animationRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(0);

  // Auto-play animation loop
  useEffect(() => {
    if (!beforeSnippet || !afterSnippet || !highlighter || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Compute diff
    const diffOps = computeDiff(beforeSnippet.code, afterSnippet.code);
    if (diffOps.length === 0) return;

    let startTime = performance.now();
    let animationTime = 0;

    const animate = (timestamp: number) => {
      const elapsed = timestamp - startTime;

      // Loop animation
      animationTime = elapsed % (config.duration * 2); // Duration * 2 for back-and-forth
      let progress: number;

      if (animationTime < config.duration) {
        // Forward animation (0 to 1)
        progress = animationTime / config.duration;
      } else {
        // Backward animation (1 to 0)
        progress = 1 - ((animationTime - config.duration) / config.duration);
      }

      // Compute frame states
      const frameStates = computeFrameStates(diffOps, progress, config);

      // Clear canvas
      ctx.fillStyle = config.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set up text rendering
      ctx.font = `${config.fontSize}px monospace`;
      ctx.textBaseline = "top";

      const padding = 20;
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
          ctx.fillText(segment.text, padding + segment.x, padding + segment.y);
        }
      }

      // Reset filters and alpha
      ctx.filter = "none";
      ctx.globalAlpha = 1;

      // Progress bar at the bottom
      const progressBarHeight = 4;
      const progressBarY = canvas.height - progressBarHeight - 10;
      const progressBarWidth = canvas.width - padding * 2;

      // Background
      ctx.fillStyle = "#30363d";
      ctx.fillRect(padding, progressBarY, progressBarWidth, progressBarHeight);

      // Progress
      ctx.fillStyle = "#58a6ff";
      ctx.fillRect(
        padding,
        progressBarY,
        progressBarWidth * (animationTime < config.duration ? progress : 1 - progress),
        progressBarHeight
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [beforeSnippet, afterSnippet, config, highlighter]);

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

  if (!beforeSnippet || !afterSnippet) {
    return (
      <div className="text-center py-20 text-gray-600">
        Enter code in both editors to see the animation preview
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Animation Preview</h3>
        <div className="text-sm text-gray-600">
          Auto-playing • {config.duration}ms duration
        </div>
      </div>

      <div className="border border-gray-300 rounded overflow-hidden bg-[#0d1117]">
        <canvas ref={canvasRef} className="w-full" />
      </div>

      <div className="text-sm text-gray-600 text-center">
        Animation loops continuously between before and after states
      </div>
    </div>
  );
};
