import { diffLines, diffChars, type Change } from "diff";
import type { DiffOperation } from "./Context/AnimatorContext";
import { tokenizeLine, tokenizeCode, type ShikiToken } from "./shikiTokenizer";

export type CharSegment = {
  text: string;
  type: "unchanged" | "removed" | "added";
  startX: number; // Starting X position in the line
  color?: string;        // Syntax highlight color from Shiki
  fontStyle?: string;    // Font styling (italic, bold, etc.)
};

export type EnhancedDiffOperation =
  | { type: "unchanged"; line: string; lineNumber: number; tokens?: ShikiToken[] }
  | { type: "delete"; line: string; lineNumber: number; tokens?: ShikiToken[] }
  | { type: "insert"; line: string; lineNumber: number; tokens?: ShikiToken[] }
  | {
      type: "modify";
      oldLine: string;
      newLine: string;
      lineNumber: number;
      oldSegments: CharSegment[];
      newSegments: CharSegment[];
    };

/**
 * Apply Shiki token colors to character segments
 * Maps syntax highlighting colors from Shiki tokens to diff segments
 * Splits segments by token boundaries to ensure correct coloring
 */
const applyTokenColors = (
  segments: CharSegment[],
  tokens: ShikiToken[]
): CharSegment[] => {
  if (!tokens || tokens.length === 0) {
    return segments;
  }

  // Build a map of character position to color/fontStyle
  const colorMap: { color: string; fontStyle?: string }[] = [];

  for (const token of tokens) {
    for (let i = 0; i < token.text.length; i++) {
      colorMap[token.startIndex + i] = {
        color: token.color,
        fontStyle: token.fontStyle,
      };
    }
  }

  // Apply colors to segments, splitting by token boundaries
  const result: CharSegment[] = [];
  let currentPos = 0;

  for (const segment of segments) {
    let remainingText = segment.text;
    let segmentOffset = 0;

    // Split this segment by token color boundaries
    while (remainingText.length > 0) {
      const charPos = currentPos + segmentOffset;
      const currentColor = colorMap[charPos];

      // Find how many consecutive characters have the same color
      let sameColorLength = 1;
      for (let i = 1; i < remainingText.length; i++) {
        const nextColor = colorMap[charPos + i];
        if (nextColor?.color !== currentColor?.color ||
            nextColor?.fontStyle !== currentColor?.fontStyle) {
          break;
        }
        sameColorLength++;
      }

      // Create a sub-segment with consistent color
      const subText = remainingText.substring(0, sameColorLength);
      result.push({
        ...segment,
        text: subText,
        startX: segment.startX + segmentOffset,
        color: currentColor?.color,
        fontStyle: currentColor?.fontStyle,
      });

      remainingText = remainingText.substring(sameColorLength);
      segmentOffset += sameColorLength;
    }

    currentPos += segment.text.length;
  }

  return result;
};

/**
 * Apply token colors to old segments, using NEW tokens for unchanged segments
 * This ensures unchanged text uses "after" colors during transitions
 */
const applyTokenColorsWithAfterForUnchanged = (
  segments: CharSegment[],
  oldTokens: ShikiToken[] | undefined,
  newTokens: ShikiToken[] | undefined,
  oldLine: string,
  newLine: string
): CharSegment[] => {
  if (!oldTokens && !newTokens) {
    return segments;
  }

  const result: CharSegment[] = [];

  for (const segment of segments) {
    if (segment.type === "unchanged" && newTokens) {
      // For unchanged segments, use NEW tokens to get "after" colors
      // We need to find where this text appears in the new line
      const textInNewLine = newLine.substring(segment.startX, segment.startX + segment.text.length);

      if (textInNewLine === segment.text) {
        // Apply colors from new tokens using the same position
        const singleSegment = [segment];
        const colored = applyTokenColors(singleSegment, newTokens);
        result.push(...colored);
      } else {
        // Text doesn't match position in new line, fall back to old tokens
        const singleSegment = [segment];
        const colored = oldTokens ? applyTokenColors(singleSegment, oldTokens) : singleSegment;
        result.push(...colored);
      }
    } else if (segment.type === "removed" && oldTokens) {
      // For removed segments, use old tokens
      const singleSegment = [segment];
      const colored = applyTokenColors(singleSegment, oldTokens);
      result.push(...colored);
    } else {
      // No tokens available, keep as is
      result.push(segment);
    }
  }

  return result;
};

const computeCharacterDiff = (
  oldLine: string,
  newLine: string,
  oldTokens?: ShikiToken[],
  newTokens?: ShikiToken[]
): {
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

  // Apply Shiki token colors to segments
  // For unchanged segments: use NEW tokens for both old and new to ensure consistent splitting
  // This ensures the "after" colors are always shown during transitions
  const coloredOldSegments = applyTokenColorsWithAfterForUnchanged(oldSegments, oldTokens, newTokens, oldLine, newLine);
  const coloredNewSegments = newTokens ? applyTokenColors(newSegments, newTokens) : newSegments;

  return { oldSegments: coloredOldSegments, newSegments: coloredNewSegments };
};

export const computeDiff = (
  before: string,
  after: string,
  highlighter?: any,
  language: string = "javascript",
  theme: string = "github-dark"
): EnhancedDiffOperation[] => {
  // Pre-tokenize the entire before and after code blocks for full context
  const beforeTokensByLine = highlighter ? tokenizeCode(before, language, highlighter, theme) : null;
  const afterTokensByLine = highlighter ? tokenizeCode(after, language, highlighter, theme) : null;

  const changes = diffLines(before, after);
  const operations: EnhancedDiffOperation[] = [];
  let lineNumber = 0;
  let beforeLineOffset = 0; // Track position in the before code
  let afterLineOffset = 0;  // Track position in the after code

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
          // Use pre-computed tokens from full context tokenization
          const oldTokens = beforeTokensByLine?.[beforeLineOffset + j];
          const newTokens = afterTokensByLine?.[afterLineOffset + j];

          const { oldSegments, newSegments } = computeCharacterDiff(
            oldLines[j],
            newLines[j],
            oldTokens,
            newTokens
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
            tokens: beforeTokensByLine?.[beforeLineOffset + j],
          });
        } else {
          // Only new line exists - insert
          operations.push({
            type: "insert",
            line: newLines[j],
            lineNumber: lineNumber++,
            tokens: afterTokensByLine?.[afterLineOffset + j],
          });
        }
      }

      beforeLineOffset += oldLines.length;
      afterLineOffset += newLines.length;
      i += 2; // Skip both changes
    } else if (change.added) {
      // Pure insertion
      const lines = change.value.split("\n");
      // Remove trailing empty line only if it's from a trailing newline
      if (lines.length > 0 && lines[lines.length - 1] === "" && change.value.endsWith("\n")) {
        lines.pop();
      }
      for (let j = 0; j < lines.length; j++) {
        operations.push({
          type: "insert",
          line: lines[j],
          lineNumber: lineNumber++,
          tokens: afterTokensByLine?.[afterLineOffset + j],
        });
      }
      afterLineOffset += lines.length;
      i++;
    } else if (change.removed) {
      // Pure deletion
      const lines = change.value.split("\n");
      // Remove trailing empty line only if it's from a trailing newline
      if (lines.length > 0 && lines[lines.length - 1] === "" && change.value.endsWith("\n")) {
        lines.pop();
      }
      for (let j = 0; j < lines.length; j++) {
        operations.push({
          type: "delete",
          line: lines[j],
          lineNumber: lineNumber++,
          tokens: beforeTokensByLine?.[beforeLineOffset + j],
        });
      }
      beforeLineOffset += lines.length;
      i++;
    } else {
      // Unchanged - use tokens from "after" state for consistent highlighting
      const lines = change.value.split("\n");
      // Remove trailing empty line only if it's from a trailing newline
      if (lines.length > 0 && lines[lines.length - 1] === "" && change.value.endsWith("\n")) {
        lines.pop();
      }
      for (let j = 0; j < lines.length; j++) {
        operations.push({
          type: "unchanged",
          line: lines[j],
          lineNumber: lineNumber++,
          tokens: afterTokensByLine?.[afterLineOffset + j], // Use "after" tokens
        });
      }
      beforeLineOffset += lines.length;
      afterLineOffset += lines.length;
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
