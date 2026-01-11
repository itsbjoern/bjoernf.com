// Generate a unique ID
export function generateId(): string {
  return crypto.randomUUID();
}

export const DEFAULT_COLOR = '#317e49';

// Format date to YYYY-MM-DD
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parse YYYY-MM-DD to Date
export function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  // Convert hex to RGB first
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

// Get color for completion count with improved visual distribution
export function getColorForCount(count: number, maxCount: number, color: string): string {
  if (count === 0) {
    return 'transparent'; // No color for zero
  }

  const hsl = hexToHsl(color);
  const ratio = count / Math.max(maxCount, 1);

  // Use a power curve for better visual distribution (makes lower values more distinct)
  const adjustedRatio = Math.pow(ratio, 0.9);

  // Define color stops similar to GitHub's approach
  // Low values: lighter with reduced saturation (subtle)
  // High values: darker with full saturation (vibrant)

  const minLightness = Math.max(hsl.l - 25, 25); // Don't go too dark
  const maxLightness = Math.min(hsl.l + 65, 92); // Start lighter

  const minSaturation = Math.max(hsl.s - 65, 10); // Reduce saturation for low values
  const maxSaturation = Math.min(hsl.s + 10, 100); // Boost saturation for high values

  // Interpolate from light/desaturated to dark/saturated
  const lightness = maxLightness - adjustedRatio * (maxLightness - minLightness);
  const saturation = minSaturation + adjustedRatio * (maxSaturation - minSaturation);

  return `hsl(${hsl.h}, ${saturation}%, ${lightness}%)`; // Slightly increase opacity with count
}

// Get all days in a year
export function getDaysInYear(year: number): Date[] {
  const days: Date[] = [];
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

  return days;
}

// Get week number of year (for contribution graph layout)
export function getWeekOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.floor(diff / oneWeek);
}

// Format date for display
export function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
