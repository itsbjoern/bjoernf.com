import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import type { ExportSettings, Progress } from "./Context/ExportContext";
import type { Highlighter } from "shiki";
import type { AnimationConfig } from "./util";
import { computeFrameStates } from "./animationEngine";
import { computeDiff } from "./diffEngine";
import { calculateTimeline, getPhaseAtTime, createRenderConfig, calculateCanvasSize } from "./animationTimeline";
import { renderFrameToCanvas } from "./canvasRenderer";

export type ProgressCallback = (progress: Progress) => void;

export const exportGIF = async (
  snippets: Array<{ code: string }>,
  config: AnimationConfig,
  highlighter: Highlighter,
  settings: ExportSettings,
  onProgress: ProgressCallback,
  language: string = "javascript"
): Promise<Blob> => {
  // Dynamic import for gif.js to handle CommonJS module
  const GIFModule = await import("gif.js");
  const GIF = GIFModule.default || GIFModule;

  return new Promise((resolve, reject) => {
    // Calculate canvas size based on content
    const { width, height } = calculateCanvasSize(snippets, config, settings.padding);

    // Use 2x resolution for better quality
    const scale = 2;
    const gif = new GIF({
      workers: 2,
      quality: 11 - settings.quality,
      width: width * scale,
      height: height * scale,
      workerScript: "/gif.worker.js",
    });

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width * scale;
    tempCanvas.height = height * scale;
    const ctx = tempCanvas.getContext("2d", {
      willReadFrequently: true,
    });

    if (!ctx) {
      reject(new Error("Failed to get canvas context"));
      return;
    }

    // Scale context for high-DPI rendering
    ctx.scale(scale, scale);

    // Calculate timeline
    const timeline = calculateTimeline(config.staticDuration, config.transitionDuration, snippets.length);
    const totalFrames = Math.ceil((timeline.totalDuration / 1000) * settings.fps);

    // Calculate max line count for line numbers
    const maxLineCount = Math.max(...snippets.map((s) => s.code.split("\n").length));

    // Create render config (use logical dimensions, context is already scaled)
    const renderConfig = createRenderConfig(width, height, config, settings.padding, maxLineCount);

    // Generate frames
    for (let i = 0; i < totalFrames; i++) {
      const animationTime = (i / totalFrames) * timeline.totalDuration;

      // Get current phase
      const phase = getPhaseAtTime(animationTime, timeline);

      // Compute frame states based on current phase
      let frameStates;
      if (phase.isTransitioning) {
        // Transition from current screen to next
        const diffOps = computeDiff(snippets[phase.currentScreenIndex].code, snippets[phase.currentScreenIndex + 1].code, highlighter, language, "github-dark");
        frameStates = computeFrameStates(diffOps, phase.progress, config);
      } else {
        // Static display with background fade-out
        if (phase.currentScreenIndex > 0) {
          // Use transition to current screen with progress > 1 to fade backgrounds
          const diffOps = computeDiff(snippets[phase.currentScreenIndex - 1].code, snippets[phase.currentScreenIndex].code, highlighter, language, "github-dark");
          const extendedProgress = 1 + Math.min(phase.staticProgress, 0.15);
          frameStates = computeFrameStates(diffOps, extendedProgress, config);
        } else {
          // First screen - show as-is
          const diffOps = computeDiff(snippets[phase.currentScreenIndex].code, snippets[phase.currentScreenIndex].code, highlighter, language, "github-dark");
          frameStates = computeFrameStates(diffOps, 1, config);
        }
      }

      renderFrameToCanvas(ctx, frameStates, renderConfig, phase.currentScreenIndex, snippets.length, phase.staticProgress);

      // Add frame to GIF
      gif.addFrame(ctx, { copy: true, delay: (1000 / settings.fps) });

      onProgress({ percentage: (i / totalFrames) * 50, message: "Generating frames..." }); // First 50% is frame generation
    }

    gif.on("progress", (p: number) => {
      console.log(p)
      onProgress({ percentage: 50 + p * 50, message: "Encoding GIF..." }); // Second 50% is encoding
    });

    gif.on("abort", () => {
      reject(new Error("GIF encoding aborted"));
    });

    gif.on("finished", (blob: Blob) => {
      console.log("GIF encoding finished");
      resolve(blob);
    });

    gif.render();
  });
};

let ffmpegInstance: FFmpeg | null = null;

export const loadFFmpeg = async (onProgress: ProgressCallback): Promise<FFmpeg> => {
  if (ffmpegInstance) {
    return ffmpegInstance;
  }

  const ffmpeg = new FFmpeg();

  ffmpeg.on("log", ({ message }) => {
    console.log(message);
  });

  ffmpeg.on("progress", ({ progress }) => {
    console.log(progress)
    onProgress({ percentage: progress * 100, message: "Loading video encoder (this may take a moment)..." });
  });

  // Load FFmpeg from unpkg CDN
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  ffmpegInstance = ffmpeg;
  return ffmpeg;
};

export const exportMP4 = async (
  snippets: Array<{ code: string }>,
  config: AnimationConfig,
  highlighter: Highlighter,
  settings: ExportSettings,
  onProgress: ProgressCallback,
  language: string = "javascript"
): Promise<Blob> => {
  const ffmpeg = await loadFFmpeg(onProgress);

  // Calculate canvas size based on content (always even integers)
  const { width, height } = calculateCanvasSize(snippets, config, settings.padding);

  // Use 2x resolution for better quality
  const scale = 2;

  // Calculate timeline
  const timeline = calculateTimeline(config.staticDuration, config.transitionDuration, snippets.length);
  const totalFrames = Math.ceil((timeline.totalDuration / 1000) * settings.fps);

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = width * scale;
  tempCanvas.height = height * scale;
  const ctx = tempCanvas.getContext("2d", {
    willReadFrequently: true,
  });

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  // Scale context for high-DPI rendering
  ctx.scale(scale, scale);

  // Calculate max line count for line numbers
  const maxLineCount = Math.max(...snippets.map((s) => s.code.split("\n").length));

  // Create render config (use logical dimensions, context is already scaled)
  const renderConfig = createRenderConfig(width, height, config, settings.padding, maxLineCount);

  // Generate and write frames
  for (let i = 0; i < totalFrames; i++) {
    const animationTime = (i / totalFrames) * timeline.totalDuration;

    // Get current phase
    const phase = getPhaseAtTime(animationTime, timeline);

    // Compute frame states based on current phase
    let frameStates;
    if (phase.isTransitioning) {
      // Transition from current screen to next
      const diffOps = computeDiff(snippets[phase.currentScreenIndex].code, snippets[phase.currentScreenIndex + 1].code, highlighter, language, "github-dark");
      frameStates = computeFrameStates(diffOps, phase.progress, config);
    } else {
      // Static display with background fade-out
      if (phase.currentScreenIndex > 0) {
        // Use transition to current screen with progress > 1 to fade backgrounds
        const diffOps = computeDiff(snippets[phase.currentScreenIndex - 1].code, snippets[phase.currentScreenIndex].code, highlighter, language, "github-dark");
        const extendedProgress = 1 + Math.min(phase.staticProgress, 0.15);
        frameStates = computeFrameStates(diffOps, extendedProgress, config);
      } else {
        // First screen - show as-is
        const diffOps = computeDiff(snippets[phase.currentScreenIndex].code, snippets[phase.currentScreenIndex].code, highlighter, language, "github-dark");
        frameStates = computeFrameStates(diffOps, 1, config);
      }
    }

    renderFrameToCanvas(ctx, frameStates, renderConfig, phase.currentScreenIndex, snippets.length, phase.staticProgress);

    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve) => {
      tempCanvas.toBlob((b) => resolve(b!), "image/png");
    });

    // Write to FFmpeg virtual file system
    const frameFileName = `frame${i.toString().padStart(5, "0")}.png`;
    await ffmpeg.writeFile(frameFileName, await fetchFile(blob));

    onProgress({ percentage: (i / totalFrames) * 80, message: "Generating frames..." }); // First 80% is frame generation
  }

  // Encode video
  await ffmpeg.exec([
    "-framerate",
    settings.fps.toString(),
    "-i",
    "frame%05d.png",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-preset",
    "medium",
    "-crf",
    "23",
    "output.mp4",
  ]);

  onProgress({ percentage: 100, message: "Encoding video..." }); // Encoding done

  // Read output file
  const data = await ffmpeg.readFile("output.mp4");
  // @ts-ignore
  const videoBlob = new Blob([data], { type: "video/mp4" });

  // Cleanup
  for (let i = 0; i < totalFrames; i++) {
    const frameFileName = `frame${i.toString().padStart(5, "0")}.png`;
    try {
      await ffmpeg.deleteFile(frameFileName);
    } catch (e) {
      // Ignore errors
    }
  }

  try {
    await ffmpeg.deleteFile("output.mp4");
  } catch (e) {
    // Ignore errors
  }


  return videoBlob;
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
