import type { Highlighter } from "shiki";

/**
 * Represents a single syntax token from Shiki with color information
 */
export type ShikiToken = {
  text: string;
  color: string;        // Syntax highlight color from theme
  fontStyle?: string;   // italic, bold, etc.
  startIndex: number;   // Character position in line
};

/**
 * Tokenize a single line of code using Shiki and extract color information
 *
 * @param line - The line of code to tokenize
 * @param language - The programming language (e.g., "typescript", "python")
 * @param highlighter - The Shiki highlighter instance
 * @param theme - The theme to use (e.g., "github-dark")
 * @returns Array of tokens with text, color, and position information
 */
export const tokenizeLine = (
  line: string,
  language: string,
  highlighter: Highlighter,
  theme: string
): ShikiToken[] => {
  // Handle empty lines
  if (!line) {
    return [{
      text: "",
      color: "#e6edf3", // Default text color
      startIndex: 0,
    }];
  }

  try {
    // Use Shiki's codeToTokens API to get token information
    const result = highlighter.codeToTokens(line, {
      lang: language,
      theme: theme,
    });

    // Extract tokens from the first (and only) line
    const tokens: ShikiToken[] = [];
    let currentIndex = 0;

    if (result.tokens && result.tokens.length > 0) {
      const lineTokens = result.tokens[0]; // First line of tokens

      for (const token of lineTokens) {
        tokens.push({
          text: token.content,
          color: token.color || "#e6edf3", // Use token color or default
          fontStyle: token.fontStyle ? String(token.fontStyle) : undefined,
          startIndex: currentIndex,
        });
        currentIndex += token.content.length;
      }
    }

    // If no tokens were generated, return the whole line with default color
    if (tokens.length === 0) {
      return [{
        text: line,
        color: "#e6edf3",
        startIndex: 0,
      }];
    }

    return tokens;
  } catch (error) {
    console.error("Failed to tokenize line:", error);
    // Fallback: return entire line as single token with default color
    return [{
      text: line,
      color: "#e6edf3",
      startIndex: 0,
    }];
  }
};

/**
 * Tokenize multiple lines of code with full context
 * This is the preferred method as it maintains proper syntax context across lines
 *
 * @param code - Multi-line code string
 * @param language - The programming language
 * @param highlighter - The Shiki highlighter instance
 * @param theme - The theme to use
 * @returns Array of token arrays, one per line
 */
export const tokenizeCode = (
  code: string,
  language: string,
  highlighter: Highlighter,
  theme: string
): ShikiToken[][] => {
  try {
    // Tokenize the entire code block at once to maintain context
    const result = highlighter.codeToTokens(code, {
      lang: language,
      theme: theme,
    });

    // Convert each line's tokens to our ShikiToken format
    return result.tokens.map(lineTokens => {
      const tokens: ShikiToken[] = [];
      let currentIndex = 0;

      for (const token of lineTokens) {
        tokens.push({
          text: token.content,
          color: token.color || "#e6edf3",
          fontStyle: token.fontStyle ? String(token.fontStyle) : undefined,
          startIndex: currentIndex,
        });
        currentIndex += token.content.length;
      }

      // Return empty line token if no tokens
      if (tokens.length === 0) {
        return [{
          text: "",
          color: "#e6edf3",
          startIndex: 0,
        }];
      }

      return tokens;
    });
  } catch (error) {
    console.error("Failed to tokenize code:", error);
    // Fallback: split into lines and return default-colored tokens
    const lines = code.split("\n");
    return lines.map(line => [{
      text: line,
      color: "#e6edf3",
      startIndex: 0,
    }]);
  }
};
