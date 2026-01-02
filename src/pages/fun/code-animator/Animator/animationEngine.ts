import type { DiffOperation } from "./Context/AnimatorContext";
import type { AnimationConfig } from "./util";
import type { CharSegment } from "./diffEngine";

export type SegmentFrameState = {
  text: string;
  x: number; // X position in pixels
  y: number; // Y position in pixels
  opacity: number;
  blur: number; // Blur amount in pixels
  color?: string;
};

export type FrameState = {
  lineNumber: number;
  y: number;
  segments: SegmentFrameState[];
};

export type EasingFunction = (t: number) => number;

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

export const computeFrameStates = (
  diffOperations: DiffOperation[],
  progress: number,
  config: AnimationConfig
): FrameState[] => {
  const easedProgress = applyEasing(progress, config.easing);
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

        // Single segment for the entire line
        frameState.segments.push({
          text: op.line,
          x: 0,
          y: frameState.y,
          opacity: 1,
          blur: 0,
        });

        beforeLineIndex++;
        afterLineIndex++;
        break;
      }

      case "delete": {
        // Line fades out and may shift
        const startY = beforeLineIndex * lineHeight;
        const endY = afterLineIndex * lineHeight;
        frameState.y = interpolate(startY, endY, easedProgress);

        frameState.segments.push({
          text: op.line,
          x: 0,
          y: frameState.y,
          opacity: 1 - easedProgress,
          blur: easedProgress * 5, // Blur up to 5px
          color: "#ff6b6b",
        });

        beforeLineIndex++;
        break;
      }

      case "insert": {
        // Line fades in and may shift
        const startY = beforeLineIndex * lineHeight;
        const endY = afterLineIndex * lineHeight;
        frameState.y = interpolate(startY, endY, easedProgress);

        frameState.segments.push({
          text: op.line,
          x: 0,
          y: frameState.y,
          opacity: easedProgress,
          blur: (1 - easedProgress) * 5, // Blur reduces as it appears
          color: "#51cf66",
        });

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

        oldSegmentPositions.forEach(({ segment, x }) => {
          if (segment.type === "unchanged") {
            unchangedOldPositions.push(x);
          }
        });

        newSegmentPositions.forEach(({ segment, x }) => {
          if (segment.type === "unchanged") {
            unchangedNewPositions.push(x);
          }
        });

        // Render unchanged segments (visible throughout entire animation)
        let unchangedIndex = 0;
        for (const { segment, x } of oldSegmentPositions) {
          if (segment.type === "unchanged") {
            const targetX = unchangedNewPositions[unchangedIndex] !== undefined
              ? unchangedNewPositions[unchangedIndex]
              : x;

            frameState.segments.push({
              text: segment.text,
              x: interpolate(x, targetX, easedProgress), // Use full progress
              y: frameState.y,
              opacity: 1,
              blur: 0,
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
                color: "#ffd43b",
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
                color: "#ffd43b",
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

export const getTotalFrames = (config: AnimationConfig): number => {
  return Math.ceil((config.duration / 1000) * config.fps);
};

export const getFrameAtTime = (time: number, config: AnimationConfig): number => {
  const progress = time / config.duration;
  return Math.floor(progress * getTotalFrames(config));
};

export const getTimeAtFrame = (frame: number, config: AnimationConfig): number => {
  const totalFrames = getTotalFrames(config);
  return (frame / totalFrames) * config.duration;
};
