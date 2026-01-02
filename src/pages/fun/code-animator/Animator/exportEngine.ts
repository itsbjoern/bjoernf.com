import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import type { ExportSettings } from "./Context/ExportContext";
import type { DiffOperation } from "./Context/AnimatorContext";
import type { Highlighter } from "shiki";
import type { AnimationConfig } from "./util";
import { computeFrameStates } from "./animationEngine";

export type ProgressCallback = (progress: number) => void;

const renderFrame = (
  ctx: CanvasRenderingContext2D,
  frameStates: ReturnType<typeof computeFrameStates>,
  config: AnimationConfig,
  settings: ExportSettings,
  currentScreenIndex: number,
  numScreens: number,
  staticProgress: number
) => {
  // Clear canvas
  ctx.fillStyle = config.backgroundColor;
  ctx.fillRect(0, 0, settings.width, settings.height);

  // Render frame
  ctx.font = `${config.fontSize}px monospace`;
  ctx.textBaseline = "top";
  ctx.textAlign = "left";

  const paddingX = 20;
  const paddingTopY = 30;

  // Render each line with segments
  for (const frame of frameStates) {
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

  // Draw progress bar at the top
  const progressBarHeight = 4;
  const progressBarY = 10;
  const progressBarWidth = settings.width - paddingX * 2;
  const segmentGap = 4;
  const segmentWidth = (progressBarWidth - (numScreens - 1) * segmentGap) / numScreens;

  for (let i = 0; i < numScreens; i++) {
    const segmentX = paddingX + i * (segmentWidth + segmentGap);

    // Background
    ctx.fillStyle = "#30363d";
    ctx.fillRect(segmentX, progressBarY, segmentWidth, progressBarHeight);

    // Fill
    if (i < currentScreenIndex) {
      ctx.fillStyle = "#58a6ff";
      ctx.fillRect(segmentX, progressBarY, segmentWidth, progressBarHeight);
    } else if (i === currentScreenIndex) {
      ctx.fillStyle = "#58a6ff";
      ctx.fillRect(segmentX, progressBarY, segmentWidth * staticProgress, progressBarHeight);
    }
  }
};

export const exportGIF = async (
  canvas: HTMLCanvasElement,
  diffOps: DiffOperation[],
  config: AnimationConfig,
  highlighter: Highlighter,
  settings: ExportSettings,
  onProgress: ProgressCallback
): Promise<Blob> => {
  // Dynamic import for gif.js to handle CommonJS module
  const GIFModule = await import("gif.js");
  const GIF = (GIFModule as any).default || GIFModule;

  return new Promise((resolve, reject) => {
    const gif = new GIF({
      workers: 2,
      quality: 11 - settings.quality, // GIF.js uses 1 (best) to 10 (worst)
      width: settings.width,
      height: settings.height,
      // Let gif.js auto-detect the worker script location
    });

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = settings.width;
    tempCanvas.height = settings.height;
    const ctx = tempCanvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Failed to get canvas context"));
      return;
    }

    // This is a simplified export - just export first transition for now
    // TODO: Update to handle all transitions with static/transition phases
    const totalFrames = Math.ceil((config.duration / 1000) * settings.fps);

    // Generate frames
    for (let i = 0; i < totalFrames; i++) {
      const progress = i / totalFrames;
      const frameStates = computeFrameStates(diffOps, progress, config);

      renderFrame(ctx, frameStates, config, settings, 0, 2, progress);

      // Add frame to GIF
      gif.addFrame(ctx, { copy: true, delay: (1000 / settings.fps) });

      onProgress((i / totalFrames) * 50); // First 50% is frame generation
    }

    gif.on("progress", (p) => {
      onProgress(50 + p * 50); // Second 50% is encoding
    });

    gif.on("finished", (blob) => {
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
    onProgress(progress * 100);
  });

  // Load FFmpeg from local files (single-threaded version)
  const baseURL = "/ffmpeg";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    // Single-threaded version doesn't require a worker
  });

  ffmpegInstance = ffmpeg;
  return ffmpeg;
};

export const exportMP4 = async (
  canvas: HTMLCanvasElement,
  diffOps: DiffOperation[],
  config: AnimationConfig,
  highlighter: Highlighter,
  settings: ExportSettings,
  onProgress: ProgressCallback
): Promise<Blob> => {
  const ffmpeg = await loadFFmpeg((p) => onProgress(p * 0.1)); // Loading is 10%

  const totalFrames = Math.ceil((config.duration / 1000) * settings.fps);
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = settings.width;
  tempCanvas.height = settings.height;
  const ctx = tempCanvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  // Generate and write frames
  for (let i = 0; i < totalFrames; i++) {
    const progress = i / totalFrames;
    const frameStates = computeFrameStates(diffOps, progress, config);

    renderFrame(ctx, frameStates, config, settings, 0, 2, progress);

    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve) => {
      tempCanvas.toBlob((b) => resolve(b!), "image/png");
    });

    // Write to FFmpeg virtual file system
    const frameFileName = `frame${i.toString().padStart(5, "0")}.png`;
    await ffmpeg.writeFile(frameFileName, await fetchFile(blob));

    onProgress(10 + (i / totalFrames) * 40); // Frames are 10-50%
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

  onProgress(90); // Encoding done

  // Read output file
  const data = await ffmpeg.readFile("output.mp4");
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

  onProgress(100);

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
