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
 * Check if two strings have significant overlap (one is a substring or they share a common prefix/suffix)
 */
const hasSignificantOverlap = (str1: string, str2: string): boolean => {
  if (str1.length < 3 || str2.length < 3) return false;

  // Check if one is a substring of the other
  if (str1.includes(str2) || str2.includes(str1)) return true;

  // Check for common prefix (at least 3 characters)
  let prefixLen = 0;
  const minLen = Math.min(str1.length, str2.length);
  for (let i = 0; i < minLen; i++) {
    if (str1[i] === str2[i]) prefixLen++;
    else break;
  }
  if (prefixLen >= 3) return true;

  // Check for common suffix (at least 3 characters)
  let suffixLen = 0;
  for (let i = 1; i <= minLen; i++) {
    if (str1[str1.length - i] === str2[str2.length - i]) suffixLen++;
    else break;
  }
  if (suffixLen >= 3) return true;

  return false;
};

/**
 * Character-level diff within a token (for partial string changes)
 */
const diffWithinToken = (
  oldToken: ShikiToken,
  newToken: ShikiToken,
  oldStartX: number,
  newStartX: number
): { oldSegments: CharSegment[]; newSegments: CharSegment[] } => {
  const oldSegments: CharSegment[] = [];
  const newSegments: CharSegment[] = [];

  let oldIdx = 0;
  let newIdx = 0;
  let oldX = oldStartX;
  let newX = newStartX;

  // Simple character-by-character comparison
  while (oldIdx < oldToken.text.length || newIdx < newToken.text.length) {
    if (oldIdx < oldToken.text.length && newIdx < newToken.text.length &&
        oldToken.text[oldIdx] === newToken.text[newIdx]) {
      // Character unchanged
      oldSegments.push({
        text: oldToken.text[oldIdx],
        type: "unchanged",
        startX: oldX,
        color: newToken.color,
        fontStyle: newToken.fontStyle,
      });
      newSegments.push({
        text: newToken.text[newIdx],
        type: "unchanged",
        startX: newX,
        color: newToken.color,
        fontStyle: newToken.fontStyle,
      });
      oldX++;
      newX++;
      oldIdx++;
      newIdx++;
    } else if (oldIdx < oldToken.text.length &&
               (newIdx >= newToken.text.length || oldToken.text[oldIdx] !== newToken.text[newIdx])) {
      // Character removed
      oldSegments.push({
        text: oldToken.text[oldIdx],
        type: "removed",
        startX: oldX,
        color: oldToken.color,
        fontStyle: oldToken.fontStyle,
      });
      oldX++;
      oldIdx++;
    } else if (newIdx < newToken.text.length) {
      // Character added
      newSegments.push({
        text: newToken.text[newIdx],
        type: "added",
        startX: newX,
        color: newToken.color,
        fontStyle: newToken.fontStyle,
      });
      newX++;
      newIdx++;
    }
  }

  return { oldSegments, newSegments };
};

/**
 * Compute hybrid token/character-level diff between two lines
 * Uses token-level diffing for most code, but falls back to character-level
 * for tokens that partially match (e.g., string edits)
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
    } else {
      // Tokens don't match - check if we should do character-level diff
      const oldToken = oldIdx < oldTokens.length ? oldTokens[oldIdx] : null;
      const newToken = newIdx < newTokens.length ? newTokens[newIdx] : null;

      // If both tokens exist and have significant overlap, use character-level diff
      if (oldToken && newToken &&
          oldToken.color === newToken.color &&
          hasSignificantOverlap(oldToken.text, newToken.text)) {
        const { oldSegments: charOldSegs, newSegments: charNewSegs } =
          diffWithinToken(oldToken, newToken, oldX, newX);
        oldSegments.push(...charOldSegs);
        newSegments.push(...charNewSegs);
        oldX += oldToken.text.length;
        newX += newToken.text.length;
        oldIdx++;
        newIdx++;
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
