import type { AnimationConfig } from "./util";

/**
 * Represents the timing configuration for the entire animation
 */
export type AnimationTimeline = {
  staticDuration: number;      // Time each screen displays (ms)
  transitionDuration: number;   // Time for transition between screens (ms)
  cycleDuration: number;        // Time for one screen + transition (ms)
  totalDuration: number;        // Total animation duration (ms)
  numScreens: number;           // Total number of screens/snippets
};

/**
 * Represents the current phase of the animation at a given time
 */
export type AnimationPhase = {
  currentScreenIndex: number;   // Which screen we're showing (0-based)
  isTransitioning: boolean;     // Are we in a transition or static display?
  progress: number;             // Transition progress (0-1)
  staticProgress: number;       // Progress bar fill (0-1, paused during transition)
  accumulatedTime: number;      // Time accumulated so far in the timeline
};

/**
 * Configuration needed to render a single frame
 */
export type RenderConfig = {
  width: number;
  height: number;
  backgroundColor: string;
  fontSize: number;
  paddingX: number;
  paddingTopY: number;
  progressBarY: number;
  progressBarHeight: number;
  segmentGap: number;
};

/**
 * Calculate animation timeline from config and number of snippets
 */
export const calculateTimeline = (
  duration: number,
  numScreens: number
): AnimationTimeline => {
  const staticDuration = duration * 0.4;
  const transitionDuration = duration * 0.6;
  const cycleDuration = staticDuration + transitionDuration;
  const totalDuration = numScreens * staticDuration + (numScreens - 1) * transitionDuration;

  return {
    staticDuration,
    transitionDuration,
    cycleDuration,
    totalDuration,
    numScreens,
  };
};

/**
 * Determine the animation phase at a specific time in the timeline
 */
export const getPhaseAtTime = (
  animationTime: number,
  timeline: AnimationTimeline
): AnimationPhase => {
  const { staticDuration, transitionDuration, numScreens } = timeline;

  let accumulatedTime = 0;
  let currentScreenIndex = 0;
  let isTransitioning = false;
  let progress = 0;
  let staticProgress = 0;

  for (let i = 0; i < numScreens; i++) {
    // Static display phase
    const timeInStatic = animationTime - accumulatedTime;

    if (animationTime < accumulatedTime + staticDuration) {
      currentScreenIndex = i;
      isTransitioning = false;
      staticProgress = timeInStatic / staticDuration;
      progress = 0; // No transition progress during static
      break;
    }
    accumulatedTime += staticDuration;

    // Transition phase (if not the last screen)
    if (i < numScreens - 1) {
      const timeInTransition = animationTime - accumulatedTime;

      if (animationTime < accumulatedTime + transitionDuration) {
        currentScreenIndex = i;
        isTransitioning = true;
        progress = timeInTransition / transitionDuration;
        staticProgress = 1; // Progress bar stays full during transition
        break;
      }
      accumulatedTime += transitionDuration;
    }
  }

  return {
    currentScreenIndex,
    isTransitioning,
    progress,
    staticProgress,
    accumulatedTime,
  };
};

/**
 * Calculate canvas dimensions based on content
 */
export const calculateCanvasSize = (
  snippets: Array<{ code: string }>,
  config: AnimationConfig,
  padding: number
): { width: number; height: number } => {
  // Find the longest line and maximum number of lines across all snippets
  let maxLineLength = 0;
  let maxLineCount = 0;

  for (const snippet of snippets) {
    const lines = snippet.code.split("\n");
    maxLineCount = Math.max(maxLineCount, lines.length);

    for (const line of lines) {
      maxLineLength = Math.max(maxLineLength, line.length);
    }
  }

  // Calculate dimensions
  // Approximate monospace character width (0.6 * fontSize)
  const charWidth = config.fontSize * 0.6;
  const lineHeight = config.fontSize * config.lineHeight;

  // Progress bar needs space at top
  const progressBarHeight = 4;
  const progressBarY = 10;
  const progressBarSpacing = progressBarY + progressBarHeight + 10; // Top space for progress bar

  const width = maxLineLength * charWidth + 2 * padding;
  const height = maxLineCount * lineHeight + 2 * padding + progressBarSpacing;

  return { width, height };
};

/**
 * Create render configuration from animation config and dimensions
 */
export const createRenderConfig = (
  width: number,
  height: number,
  config: AnimationConfig,
  padding: number
): RenderConfig => {
  return {
    width,
    height,
    backgroundColor: config.backgroundColor,
    fontSize: config.fontSize,
    paddingX: padding,
    paddingTopY: padding + 20, // Extra space for progress bar
    progressBarY: 10,
    progressBarHeight: 4,
    segmentGap: 4,
  };
};
