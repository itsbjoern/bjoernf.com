import { diffLines, type Change } from "diff";
import type { DiffOperation } from "./Context/AnimatorContext";
import { tokenizeLine, tokenizeCode, type ShikiToken } from "./shikiTokenizer";

export type CharSegment = {
  text: string;
  type: "unchanged" | "removed" | "added";
  startX: number; // Starting X position in the line
  color?: string;        // Syntax highlight color from Shiki
  fontStyle?: string;    // Font styling (italic, bold, etc.)
};

/**
 * Simple LCS-based token diffing algorithm
 * Returns indices of tokens that are common between old and new arrays
 */
const findLCS = (
  oldTokens: ShikiToken[],
  newTokens: ShikiToken[]
): { oldIndices: number[]; newIndices: number[] } => {
  const m = oldTokens.length;
  const n = newTokens.length;

  // Build LCS matrix
  const lcs: number[][] = Array(m + 1)
    .fill(0)
    .map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldTokens[i - 1].text === newTokens[j - 1].text) {
        lcs[i][j] = lcs[i - 1][j - 1] + 1;
      } else {
        lcs[i][j] = Math.max(lcs[i - 1][j], lcs[i][j - 1]);
      }
    }
  }

  // Backtrack to find the actual sequence
  const oldIndices: number[] = [];
  const newIndices: number[] = [];
  let i = m;
  let j = n;

  while (i > 0 && j > 0) {
    if (oldTokens[i - 1].text === newTokens[j - 1].text) {
      oldIndices.unshift(i - 1);
      newIndices.unshift(j - 1);
      i--;
      j--;
    } else if (lcs[i - 1][j] > lcs[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return { oldIndices, newIndices };
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
 * Compute token-level diff between two lines
 * Each token (keyword, identifier, operator, etc.) is treated as an atomic unit
 */
const computeTokenDiff = (
  oldTokens: ShikiToken[],
  newTokens: ShikiToken[]
): {
  oldSegments: CharSegment[];
  newSegments: CharSegment[];
} => {
  // Handle empty cases
  if (oldTokens.length === 0 && newTokens.length === 0) {
    return { oldSegments: [], newSegments: [] };
  }

  if (oldTokens.length === 0) {
    // All tokens are added
    let x = 0;
    const segments: CharSegment[] = newTokens.map(token => {
      const segment: CharSegment = {
        text: token.text,
        type: "added",
        startX: x,
        color: token.color,
        fontStyle: token.fontStyle,
      };
      x += token.text.length;
      return segment;
    });
    return { oldSegments: [], newSegments: segments };
  }

  if (newTokens.length === 0) {
    // All tokens are removed
    let x = 0;
    const segments: CharSegment[] = oldTokens.map(token => {
      const segment: CharSegment = {
        text: token.text,
        type: "removed",
        startX: x,
        color: token.color,
        fontStyle: token.fontStyle,
      };
      x += token.text.length;
      return segment;
    });
    return { oldSegments: segments, newSegments: [] };
  }

  // Find common tokens using LCS
  const { oldIndices, newIndices } = findLCS(oldTokens, newTokens);

  const oldSegments: CharSegment[] = [];
  const newSegments: CharSegment[] = [];

  let oldX = 0;
  let newX = 0;
  let oldIdx = 0;
  let newIdx = 0;
  let lcsIdx = 0;

  // Process all tokens
  while (oldIdx < oldTokens.length || newIdx < newTokens.length) {
    // Check if current tokens are in the LCS (unchanged)
    if (
      lcsIdx < oldIndices.length &&
      oldIdx === oldIndices[lcsIdx] &&
      newIdx === newIndices[lcsIdx]
    ) {
      // Unchanged token - use color from new token for consistency
      const token = newTokens[newIdx];
      oldSegments.push({
        text: token.text,
        type: "unchanged",
        startX: oldX,
        color: token.color,
        fontStyle: token.fontStyle,
      });
      newSegments.push({
        text: token.text,
        type: "unchanged",
        startX: newX,
        color: token.color,
        fontStyle: token.fontStyle,
      });
      oldX += token.text.length;
      newX += token.text.length;
      oldIdx++;
      newIdx++;
      lcsIdx++;
    } else if (
      lcsIdx < oldIndices.length &&
      oldIdx < oldIndices[lcsIdx] &&
      (newIdx >= newIndices[lcsIdx] || lcsIdx >= newIndices.length || newIdx < newIndices[lcsIdx])
    ) {
      // Token removed from old
      const token = oldTokens[oldIdx];
      oldSegments.push({
        text: token.text,
        type: "removed",
        startX: oldX,
        color: token.color,
        fontStyle: token.fontStyle,
      });
      oldX += token.text.length;
      oldIdx++;
    } else if (
      lcsIdx < newIndices.length &&
      newIdx < newIndices[lcsIdx]
    ) {
      // Token added to new
      const token = newTokens[newIdx];
      newSegments.push({
        text: token.text,
        type: "added",
        startX: newX,
        color: token.color,
        fontStyle: token.fontStyle,
      });
      newX += token.text.length;
      newIdx++;
    } else {
      // Beyond LCS - process remaining tokens
      if (oldIdx < oldTokens.length) {
        const token = oldTokens[oldIdx];
        oldSegments.push({
          text: token.text,
          type: "removed",
          startX: oldX,
          color: token.color,
          fontStyle: token.fontStyle,
        });
        oldX += token.text.length;
        oldIdx++;
      }
      if (newIdx < newTokens.length) {
        const token = newTokens[newIdx];
        newSegments.push({
          text: token.text,
          type: "added",
          startX: newX,
          color: token.color,
          fontStyle: token.fontStyle,
        });
        newX += token.text.length;
        newIdx++;
      }
    }
  }

  return { oldSegments, newSegments };
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
          // Both lines exist - modify with token-level diff
          // Use pre-computed tokens from full context tokenization
          const oldTokens = beforeTokensByLine?.[beforeLineOffset + j] || [];
          const newTokens = afterTokensByLine?.[afterLineOffset + j] || [];

          const { oldSegments, newSegments } = computeTokenDiff(
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
