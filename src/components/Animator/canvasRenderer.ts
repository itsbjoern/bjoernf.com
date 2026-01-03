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
    ctx.filter = "none";
    ctx.globalAlpha = 1.0;

    // Find the maximum line number across all frames
    const maxLineNumber = Math.max(
      0,
      ...frameStates.map((frame) => frame.lineNumber)
    );

    // Create a map of line numbers to their y positions
    const linePositions = new Map<number, number>();
    for (const frame of frameStates) {
      if (!linePositions.has(frame.lineNumber)) {
        linePositions.set(frame.lineNumber, frame.y);
      }
    }

    // Render line numbers for ALL lines from 0 to max to maintain continuity
    // Note: frameState lineNumbers are 0-indexed, but we display them as 1-indexed
    const lineHeightPx = fontSize * lineHeight;
    for (let lineNum = 0; lineNum <= maxLineNumber; lineNum++) {
      // Get y position from map, or calculate it if line was filtered out (opacity = 0)
      let y = linePositions.get(lineNum);
      if (y === undefined) {
        // Calculate position based on line number and line height
        // This ensures continuous line numbers even when lines are deleted/hidden
        y = lineNum * lineHeightPx;
      }

      const lineNumberX = paddingX - 10;
      const lineNumberY = paddingTopY + y;
      ctx.fillText((lineNum + 1).toString(), lineNumberX, lineNumberY);
    }

    // Reset text alignment for code rendering
    ctx.textAlign = "left";
  }

  // First pass: Render merged backgrounds for each line
  for (const frame of frameStates) {
    // Group consecutive segments with the same background color
    type BackgroundGroup = {
      backgroundColor: string;
      startX: number;
      endX: number;
      y: number;
      opacity: number;
    };

    const backgroundGroups: BackgroundGroup[] = [];
    let currentGroup: BackgroundGroup | null = null;

    for (const segment of frame.segments) {
      if (segment.backgroundColor) {
        const charWidth = fontSize * 0.6;
        const segmentStartX = segment.x;
        const segmentEndX = segment.x + segment.text.length * charWidth;

        if (
          currentGroup &&
          currentGroup.backgroundColor === segment.backgroundColor &&
          currentGroup.y === segment.y &&
          Math.abs(currentGroup.endX - segmentStartX) < 1 // Allow small gaps
        ) {
          // Extend current group
          currentGroup.endX = segmentEndX;
          currentGroup.opacity = Math.max(currentGroup.opacity, segment.opacity);
        } else {
          // Start new group
          if (currentGroup) {
            backgroundGroups.push(currentGroup);
          }
          currentGroup = {
            backgroundColor: segment.backgroundColor,
            startX: segmentStartX,
            endX: segmentEndX,
            y: segment.y,
            opacity: segment.opacity,
          };
        }
      } else if (currentGroup) {
        // No background for this segment, save current group
        backgroundGroups.push(currentGroup);
        currentGroup = null;
      }
    }

    // Don't forget the last group
    if (currentGroup) {
      backgroundGroups.push(currentGroup);
    }

    // Render merged background groups
    ctx.filter = "none";
    const pxWidthPad = 4;
    const pxHeightPad = 1;
    const bgHeight = fontSize * lineHeight;

    for (const group of backgroundGroups) {
      ctx.globalAlpha = group.opacity;
      ctx.fillStyle = group.backgroundColor;

      const bgY = paddingTopY + group.y - fontSize * 0.25;
      const bgWidth = group.endX - group.startX;

      ctx.beginPath();
      ctx.roundRect(
        paddingX + group.startX - pxWidthPad,
        bgY - pxHeightPad,
        bgWidth + pxWidthPad * 2,
        bgHeight + pxHeightPad * 2,
        4
      );
      ctx.fill();
    }
  }

  // Second pass: Render text for each line
  for (const frame of frameStates) {
    for (const segment of frame.segments) {
      ctx.globalAlpha = segment.opacity;

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
