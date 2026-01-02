import GIF from "gif.js";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import type { ExportSettings } from "./Context/ExportContext";
import type { DiffOperation } from "./Context/AnimatorContext";
import type { Highlighter } from "shiki";
import type { AnimationConfig } from "./util";
import { computeFrameStates } from "./animationEngine";

export type ProgressCallback = (progress: number) => void;

export const exportGIF = async (
  canvas: HTMLCanvasElement,
  diffOps: DiffOperation[],
  config: AnimationConfig,
  highlighter: Highlighter,
  settings: ExportSettings,
  onProgress: ProgressCallback
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const gif = new GIF({
      workers: 2,
      quality: 11 - settings.quality, // GIF.js uses 1 (best) to 10 (worst)
      width: settings.width,
      height: settings.height,
      workerScript: "/node_modules/gif.js/dist/gif.worker.js",
    });

    const totalFrames = Math.ceil((config.duration / 1000) * settings.fps);
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = settings.width;
    tempCanvas.height = settings.height;
    const ctx = tempCanvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Failed to get canvas context"));
      return;
    }

    // Generate frames
    for (let i = 0; i < totalFrames; i++) {
      const progress = i / totalFrames;
      const frameStates = computeFrameStates(diffOps, progress, config);

      // Clear canvas
      ctx.fillStyle = config.backgroundColor;
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Render frame
      ctx.font = `${config.fontSize}px monospace`;
      ctx.textBaseline = "top";

      const padding = 20;

      for (const frame of frameStates) {
        ctx.globalAlpha = frame.opacity;
        ctx.fillStyle = frame.color || "#e6edf3";
        ctx.fillText(frame.content, padding, padding + frame.y);
      }

      ctx.globalAlpha = 1;

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

  // Load FFmpeg
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
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

    // Clear canvas
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Render frame
    ctx.font = `${config.fontSize}px monospace`;
    ctx.textBaseline = "top";

    const padding = 20;

    for (const frame of frameStates) {
      ctx.globalAlpha = frame.opacity;
      ctx.fillStyle = frame.color || "#e6edf3";
      ctx.fillText(frame.content, padding, padding + frame.y);
    }

    ctx.globalAlpha = 1;

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
