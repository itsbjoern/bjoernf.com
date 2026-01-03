import type { DiffOperation } from "./Context/AnimatorContext";
import type { AnimationConfig } from "./util";
import type { CharSegment } from "./diffEngine";
import type { ShikiToken } from "./shikiTokenizer";

export type SegmentFrameState = {
  text: string;
  x: number; // X position in pixels
  y: number; // Y position in pixels
  opacity: number;
  blur: number; // Blur amount in pixels
  color: string;              // Syntax highlight color (required)
  backgroundColor?: string;   // Subtle background for diff indicators
  fontStyle?: string;         // Font styling (italic, bold, etc.)
};

export type FrameState = {
  lineNumber: number;
  y: number;
  segments: SegmentFrameState[];
};

export type EasingFunction = (t: number) => number;

// Diff background colors (subtle, semi-transparent)
const DIFF_BG_COLORS = {
  delete: "rgba(255, 107, 107, 0.15)",   // Very light red
  insert: "rgba(81, 207, 102, 0.15)",    // Very light green
  modify: "rgba(255, 212, 59, 0.2)",     // Very light yellow
};

// Default text color when no syntax highlighting is available
const DEFAULT_TEXT_COLOR = "#e6edf3";

// Easing functions
export const easings: Record<string, EasingFunction> = {
  linear: (t: number) => t,
  "ease-in": (t: number) => t * t,
  "ease-out": (t: number) => t * (2 - t),
  "ease-in-out": (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
};

export const applyEasing = (
  t: number,
  easingType: AnimationConfig["easing"]
): number => {
  const easingFn = easings[easingType] || easings.linear;
  return easingFn(Math.max(0, Math.min(1, t)));
};

export const interpolate = (start: number, end: number, progress: number): number => {
  return start + (end - start) * progress;
};

const measureTextWidth = (text: string, fontSize: number): number => {
  // Approximate monospace character width
  return text.length * fontSize * 0.6;
};

const computeSegmentPositions = (
  segments: CharSegment[],
  fontSize: number
): { segment: CharSegment; x: number; width: number }[] => {
  let x = 0;
  const result: { segment: CharSegment; x: number; width: number }[] = [];

  for (const segment of segments) {
    const width = measureTextWidth(segment.text, fontSize);
    result.push({ segment, x, width });
    x += width;
  }

  return result;
};

/**
 * Fades out the alpha channel of an rgba color
 */
const fadeBackgroundColor = (color: string | undefined, fadeAmount: number): string | undefined => {
  if (!color || fadeAmount >= 1) return undefined;

  // Parse rgba color and reduce alpha
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/);
  if (match) {
    const [, r, g, b, a] = match;
    const alpha = parseFloat(a || '1') * (1 - fadeAmount);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
};

/**
 * Create segments for a simple line (unchanged, delete, or insert)
 * with syntax highlighting applied from pre-computed tokens
 */
const createSegmentsFromTokens = (
  line: string,
  tokens: ShikiToken[] | undefined,
  y: number,
  opacity: number,
  blur: number,
  backgroundColor: string | undefined,
  fontSize: number,
  backgroundFade: number = 0
): SegmentFrameState[] => {
  const fadedBackground = fadeBackgroundColor(backgroundColor, backgroundFade);

  // If no tokens provided, return single segment with default color
  if (!tokens || tokens.length === 0) {
    return [{
      text: line,
      x: 0,
      y,
      opacity,
      blur,
      color: DEFAULT_TEXT_COLOR,
      backgroundColor: fadedBackground,
    }];
  }

  const segments: SegmentFrameState[] = [];
  let x = 0;

  for (const token of tokens) {
    if (token.text) {
      segments.push({
        text: token.text,
        x,
        y,
        opacity,
        blur,
        color: token.color,
        backgroundColor: fadedBackground,
        fontStyle: token.fontStyle,
      });
      x += measureTextWidth(token.text, fontSize);
    }
  }

  return segments.length > 0 ? segments : [{
    text: line,
    x: 0,
    y,
    opacity,
    blur,
    color: DEFAULT_TEXT_COLOR,
    backgroundColor: fadedBackground,
  }];
};

export const computeFrameStates = (
  diffOperations: DiffOperation[],
  progress: number,
  config: AnimationConfig
): FrameState[] => {
  // Clamp progress for easing to [0, 1], but allow values > 1 for background fade-out
  const clampedProgress = Math.min(progress, 1);
  const easedProgress = applyEasing(clampedProgress, config.easing);

  // Calculate background fade when progress > 1 (post-transition static phase)
  // Fade out backgrounds over 0.15 progress units (e.g., 1.0 to 1.15) - 15% of static display
  const backgroundFade = Math.min(Math.max(progress - 1, 0) / 0.15, 1);

  const lineHeight = config.fontSize * config.lineHeight;
  const frames: FrameState[] = [];

  let beforeLineIndex = 0;
  let afterLineIndex = 0;

  for (const op of diffOperations) {
    const frameState: FrameState = {
      lineNumber: op.lineNumber,
      y: 0,
      segments: [],
    };

    switch (op.type) {
      case "unchanged": {
        // Line stays the same, may shift position
        const startY = beforeLineIndex * lineHeight;
        const endY = afterLineIndex * lineHeight;
        frameState.y = interpolate(startY, endY, easedProgress);

        // Create segments from pre-computed tokens (uses "after" state tokens)
        const segments = createSegmentsFromTokens(
          op.line,
          op.tokens,
          frameState.y,
          1, // opacity
          0, // blur
          undefined, // no background for unchanged lines
          config.fontSize,
          backgroundFade
        );
        frameState.segments.push(...segments);

        beforeLineIndex++;
        afterLineIndex++;
        break;
      }

      case "delete": {
        // Line fades out and may shift
        const startY = beforeLineIndex * lineHeight;
        const endY = afterLineIndex * lineHeight;
        frameState.y = interpolate(startY, endY, easedProgress);

        // Create segments from pre-computed tokens with red background
        const segments = createSegmentsFromTokens(
          op.line,
          op.tokens,
          frameState.y,
          1 - easedProgress, // fade out
          easedProgress * 5, // blur up to 5px
          DIFF_BG_COLORS.delete, // subtle red background
          config.fontSize,
          backgroundFade
        );
        frameState.segments.push(...segments);

        beforeLineIndex++;
        break;
      }

      case "insert": {
        // Line fades in and may shift
        const startY = beforeLineIndex * lineHeight;
        const endY = afterLineIndex * lineHeight;
        frameState.y = interpolate(startY, endY, easedProgress);

        // Create segments from pre-computed tokens with green background
        const segments = createSegmentsFromTokens(
          op.line,
          op.tokens,
          frameState.y,
          easedProgress, // fade in
          (1 - easedProgress) * 5, // blur reduces as it appears
          DIFF_BG_COLORS.insert, // subtle green background
          config.fontSize,
          backgroundFade
        );
        frameState.segments.push(...segments);

        afterLineIndex++;
        break;
      }

      case "modify": {
        // Character-level animation within the line
        const startY = beforeLineIndex * lineHeight;
        const endY = afterLineIndex * lineHeight;
        frameState.y = interpolate(startY, endY, easedProgress);

        const oldSegmentPositions = computeSegmentPositions(
          op.oldSegments,
          config.fontSize
        );
        const newSegmentPositions = computeSegmentPositions(
          op.newSegments,
          config.fontSize
        );

        // Match unchanged segments by their sequence order
        const unchangedOldPositions: number[] = [];
        const unchangedNewPositions: number[] = [];
        const unchangedNewSegments: CharSegment[] = [];

        oldSegmentPositions.forEach(({ segment, x }) => {
          if (segment.type === "unchanged") {
            unchangedOldPositions.push(x);
          }
        });

        newSegmentPositions.forEach(({ segment, x }) => {
          if (segment.type === "unchanged") {
            unchangedNewPositions.push(x);
            unchangedNewSegments.push(segment);
          }
        });

        // Render unchanged segments (visible throughout entire animation)
        // Always use colors from the "after" state for correct syntax highlighting
        let unchangedIndex = 0;
        for (const { segment, x } of oldSegmentPositions) {
          if (segment.type === "unchanged") {
            const targetX = unchangedNewPositions[unchangedIndex] !== undefined
              ? unchangedNewPositions[unchangedIndex]
              : x;

            // Use the new segment's color and fontStyle (from "after" state)
            const newSegment = unchangedNewSegments[unchangedIndex];

            frameState.segments.push({
              text: segment.text,
              x: interpolate(x, targetX, easedProgress), // Use full progress
              y: frameState.y,
              opacity: 1,
              blur: 0,
              color: newSegment?.color || segment.color || DEFAULT_TEXT_COLOR,
              fontStyle: newSegment?.fontStyle || segment.fontStyle,
              // No background for unchanged segments
            });
            unchangedIndex++;
          }
        }

        // Render based on progress for changed segments only
        if (easedProgress < 0.5) {
          // First half: blur out removed segments
          const blurProgress = easedProgress * 2; // 0 to 1 in first half

          for (const { segment, x } of oldSegmentPositions) {
            if (segment.type === "removed") {
              frameState.segments.push({
                text: segment.text,
                x: x,
                y: frameState.y,
                opacity: 1 - blurProgress,
                blur: blurProgress * 8,
                color: segment.color || DEFAULT_TEXT_COLOR,
                backgroundColor: fadeBackgroundColor(DIFF_BG_COLORS.modify, backgroundFade), // subtle yellow background
                fontStyle: segment.fontStyle,
              });
            }
          }
        } else {
          // Second half: blur in added segments
          const blurProgress = (easedProgress - 0.5) * 2; // 0 to 1 in second half

          for (const { segment, x } of newSegmentPositions) {
            if (segment.type === "added") {
              frameState.segments.push({
                text: segment.text,
                x: x,
                y: frameState.y,
                opacity: blurProgress,
                blur: (1 - blurProgress) * 8,
                color: segment.color || DEFAULT_TEXT_COLOR,
                backgroundColor: fadeBackgroundColor(DIFF_BG_COLORS.modify, backgroundFade), // subtle yellow background
                fontStyle: segment.fontStyle,
              });
            }
          }
        }

        beforeLineIndex++;
        afterLineIndex++;
        break;
      }
    }

    // Only include visible frames
    const visibleSegments = frameState.segments.filter((s) => s.opacity > 0);
    if (visibleSegments.length > 0) {
      frameState.segments = visibleSegments;
      frames.push(frameState);
    }
  }

  return frames;
};
