import type { FrameState } from "./animationEngine";
import type { RenderConfig } from "./animationTimeline";

/**
 * Renders frame states and progress bar to a canvas context
 * This function is used by both Preview and Export
 */
export const renderFrameToCanvas = (
  ctx: CanvasRenderingContext2D,
  frameStates: FrameState[],
  renderConfig: RenderConfig,
  currentScreenIndex: number,
  numScreens: number,
  staticProgress: number
): void => {
  const {
    width,
    height,
    backgroundColor,
    fontSize,
    paddingX,
    paddingTopY,
    progressBarY,
    progressBarHeight,
    segmentGap,
    showLineNumbers,
    lineNumberGutterWidth,
    lineNumberColor,
  } = renderConfig;

  // Clear canvas
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // Set up text rendering
  ctx.font = `${fontSize}px "Fira Code", "Courier New", monospace`;
  ctx.textBaseline = "top";
  ctx.textAlign = "left";

  const lineHeight = 1.5; // Line height multiplier

  // Render line numbers first (if enabled)
  if (showLineNumbers && lineNumberGutterWidth > 0) {
    ctx.fillStyle = lineNumberColor;
    ctx.textAlign = "right";
    ctx.globalAlpha = 1;
    ctx.filter = "none";

    for (const frame of frameStates) {
      // Only render line number if the line is visible (opacity > 0)
      const hasVisibleSegments = frame.segments.some((s) => s.opacity > 0);
      if (hasVisibleSegments) {
        const lineNumberX = paddingX - 10; // Right-align with some spacing
        const lineNumberY = paddingTopY + frame.y;

        // Use the maximum opacity of segments for the line number
        const maxOpacity = Math.max(...frame.segments.map((s) => s.opacity));
        ctx.globalAlpha = maxOpacity;

        ctx.fillText(frame.lineNumber.toString(), lineNumberX, lineNumberY);
      }
    }

    // Reset text alignment for code rendering
    ctx.textAlign = "left";
  }

  // Render each line with segments
  for (const frame of frameStates) {
    for (const segment of frame.segments) {
      ctx.globalAlpha = segment.opacity;

      // Render background if present (before text, no blur)
      if (segment.backgroundColor) {

        // Calculate background dimensions
        const charWidth = fontSize * 0.6; // Approximate monospace width
        const bgWidth = segment.text.length * charWidth;
        const bgHeight = fontSize * lineHeight;
        const bgY = paddingTopY + segment.y - fontSize * 0.25; // Slight vertical adjustment

        const pxWidthPad = 4;
        const pxHeightPad = 1;

        ctx.beginPath();

        ctx.filter = "none";
        ctx.fillStyle = segment.backgroundColor;
        ctx.roundRect(
          paddingX + segment.x - pxWidthPad,
          bgY - pxHeightPad,
          bgWidth + pxWidthPad * 2,
          bgHeight + pxHeightPad * 2,
          4
        );
        ctx.fill();
      }

      // Apply blur filter for text
      if (segment.blur > 0) {
        ctx.filter = `blur(${segment.blur}px)`;
      } else {
        ctx.filter = "none";
      }

      // Apply font style if present
      const originalFont = ctx.font;
      if (segment.fontStyle) {
        let fontStyle = "";
        if (segment.fontStyle.includes("italic")) fontStyle += "italic ";
        if (segment.fontStyle.includes("bold")) fontStyle += "bold ";
        ctx.font = `${fontStyle}${fontSize}px "Fira Code", "Courier New", monospace`;
      }

      // Render text with syntax color
      ctx.fillStyle = segment.color;
      ctx.fillText(segment.text, paddingX + segment.x, paddingTopY + segment.y);

      // Restore original font
      if (segment.fontStyle) {
        ctx.font = originalFont;
      }
    }
  }

  // Reset filters and alpha
  ctx.filter = "none";
  ctx.globalAlpha = 1;

  // Draw segmented progress bar
  renderProgressBar(
    ctx,
    paddingX,
    progressBarY,
    width,
    progressBarHeight,
    segmentGap,
    numScreens,
    currentScreenIndex,
    staticProgress
  );
};

/**
 * Renders the segmented progress bar
 */
const renderProgressBar = (
  ctx: CanvasRenderingContext2D,
  paddingX: number,
  progressBarY: number,
  canvasWidth: number,
  progressBarHeight: number,
  segmentGap: number,
  numScreens: number,
  currentScreenIndex: number,
  staticProgress: number
): void => {
  const progressBarWidth = canvasWidth - paddingX * 2;
  const segmentWidth = (progressBarWidth - (numScreens - 1) * segmentGap) / numScreens;

  for (let i = 0; i < numScreens; i++) {
    const segmentX = paddingX + i * (segmentWidth + segmentGap);

    // Background
    ctx.fillStyle = "#30363d";
    ctx.fillRect(segmentX, progressBarY, segmentWidth, progressBarHeight);

    // Fill
    if (i < currentScreenIndex) {
      // Completed segment (past screens)
      ctx.fillStyle = "#58a6ff";
      ctx.fillRect(segmentX, progressBarY, segmentWidth, progressBarHeight);
    } else if (i === currentScreenIndex) {
      // Current segment - show static progress
      ctx.fillStyle = "#58a6ff";
      ctx.fillRect(segmentX, progressBarY, segmentWidth * staticProgress, progressBarHeight);
    }
  }
};
