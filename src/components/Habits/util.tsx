// Color themes for contribution graph
export const COLOR_THEMES = {
  github: {
    name: 'GitHub',
    colors: [
      '#ebedf0', // 0 habits
      '#9be9a8', // 1 habit
      '#40c463', // 2 habits
      '#30a14e', // 3 habits
      '#216e39', // 4+ habits
    ],
  },
  ocean: {
    name: 'Ocean',
    colors: ['#e0f2fe', '#7dd3fc', '#38bdf8', '#0284c7', '#0c4a6e'],
  },
  forest: {
    name: 'Forest',
    colors: ['#d1fae5', '#6ee7b7', '#34d399', '#059669', '#064e3b'],
  },
  sunset: {
    name: 'Sunset',
    colors: ['#fee2e2', '#fca5a5', '#f87171', '#dc2626', '#7f1d1d'],
  },
  monochrome: {
    name: 'Monochrome',
    colors: ['#f5f5f5', '#d4d4d4', '#a3a3a3', '#525252', '#171717'],
  },
} as const;

export type ColorTheme = keyof typeof COLOR_THEMES;

// Generate a unique ID
export function generateId(): string {
  return crypto.randomUUID();
}

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

// Get color for completion count
export function getColorForCount(count: number, theme: ColorTheme): string {
  const colors = COLOR_THEMES[theme].colors;
  if (count === 0) return colors[0];
  if (count === 1) return colors[1];
  if (count === 2) return colors[2];
  if (count === 3) return colors[3];
  return colors[4]; // 4+ habits
}

// LocalStorage helpers
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;

  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
  }
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
