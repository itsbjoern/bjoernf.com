import { diffLines, diffChars, type Change } from "diff";
import type { DiffOperation } from "./Context/AnimatorContext";

export type CharSegment = {
  text: string;
  type: "unchanged" | "removed" | "added";
  startX: number; // Starting X position in the line
};

export type EnhancedDiffOperation =
  | { type: "unchanged"; line: string; lineNumber: number }
  | { type: "delete"; line: string; lineNumber: number }
  | { type: "insert"; line: string; lineNumber: number }
  | {
      type: "modify";
      oldLine: string;
      newLine: string;
      lineNumber: number;
      oldSegments: CharSegment[];
      newSegments: CharSegment[];
    };

const computeCharacterDiff = (oldLine: string, newLine: string): {
  oldSegments: CharSegment[];
  newSegments: CharSegment[];
} => {
  const changes = diffChars(oldLine, newLine);
  const oldSegments: CharSegment[] = [];
  const newSegments: CharSegment[] = [];

  let oldX = 0;
  let newX = 0;

  for (const change of changes) {
    if (change.removed) {
      oldSegments.push({
        text: change.value,
        type: "removed",
        startX: oldX,
      });
      oldX += change.value.length;
    } else if (change.added) {
      newSegments.push({
        text: change.value,
        type: "added",
        startX: newX,
      });
      newX += change.value.length;
    } else {
      // Unchanged segment
      oldSegments.push({
        text: change.value,
        type: "unchanged",
        startX: oldX,
      });
      newSegments.push({
        text: change.value,
        type: "unchanged",
        startX: newX,
      });
      oldX += change.value.length;
      newX += change.value.length;
    }
  }

  return { oldSegments, newSegments };
};

export const computeDiff = (before: string, after: string): EnhancedDiffOperation[] => {
  const changes = diffLines(before, after);
  const operations: EnhancedDiffOperation[] = [];
  let lineNumber = 0;

  let i = 0;
  while (i < changes.length) {
    const change = changes[i];

    // Group consecutive add/delete as modify
    if (change.removed && i + 1 < changes.length && changes[i + 1].added) {
      const oldLine = change.value;
      const newLine = changes[i + 1].value;

      // Split into individual lines and create modify operations
      const oldLines = oldLine.split("\n");
      const newLines = newLine.split("\n");

      // Remove trailing empty line only if it's from a trailing newline
      if (oldLines.length > 0 && oldLines[oldLines.length - 1] === "" && oldLine.endsWith("\n")) {
        oldLines.pop();
      }
      if (newLines.length > 0 && newLines[newLines.length - 1] === "" && newLine.endsWith("\n")) {
        newLines.pop();
      }

      const maxLines = Math.max(oldLines.length, newLines.length);

      for (let j = 0; j < maxLines; j++) {
        if (j < oldLines.length && j < newLines.length) {
          // Both lines exist - modify with character-level diff
          const { oldSegments, newSegments } = computeCharacterDiff(
            oldLines[j],
            newLines[j]
          );
          operations.push({
            type: "modify",
            oldLine: oldLines[j],
            newLine: newLines[j],
            lineNumber: lineNumber++,
            oldSegments,
            newSegments,
          });
        } else if (j < oldLines.length) {
          // Only old line exists - delete
          operations.push({
            type: "delete",
            line: oldLines[j],
            lineNumber: lineNumber++,
          });
        } else {
          // Only new line exists - insert
          operations.push({
            type: "insert",
            line: newLines[j],
            lineNumber: lineNumber++,
          });
        }
      }

      i += 2; // Skip both changes
    } else if (change.added) {
      // Pure insertion
      const lines = change.value.split("\n");
      // Remove trailing empty line only if it's from a trailing newline
      if (lines.length > 0 && lines[lines.length - 1] === "" && change.value.endsWith("\n")) {
        lines.pop();
      }
      for (const line of lines) {
        operations.push({
          type: "insert",
          line,
          lineNumber: lineNumber++,
        });
      }
      i++;
    } else if (change.removed) {
      // Pure deletion
      const lines = change.value.split("\n");
      // Remove trailing empty line only if it's from a trailing newline
      if (lines.length > 0 && lines[lines.length - 1] === "" && change.value.endsWith("\n")) {
        lines.pop();
      }
      for (const line of lines) {
        operations.push({
          type: "delete",
          line,
          lineNumber: lineNumber++,
        });
      }
      i++;
    } else {
      // Unchanged
      const lines = change.value.split("\n");
      // Remove trailing empty line only if it's from a trailing newline
      if (lines.length > 0 && lines[lines.length - 1] === "" && change.value.endsWith("\n")) {
        lines.pop();
      }
      for (const line of lines) {
        operations.push({
          type: "unchanged",
          line,
          lineNumber: lineNumber++,
        });
      }
      i++;
    }
  }

  return operations;
};

export const getDiffStats = (operations: EnhancedDiffOperation[]) => {
  const stats = {
    total: operations.length,
    unchanged: 0,
    inserted: 0,
    deleted: 0,
    modified: 0,
  };

  for (const op of operations) {
    switch (op.type) {
      case "unchanged":
        stats.unchanged++;
        break;
      case "insert":
        stats.inserted++;
        break;
      case "delete":
        stats.deleted++;
        break;
      case "modify":
        stats.modified++;
        break;
    }
  }

  return stats;
};
