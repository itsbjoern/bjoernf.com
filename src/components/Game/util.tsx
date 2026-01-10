export type Link = {
  text: string;
  choice?: number;
  url: string;
  date: string;
  title: string;
  image?: string;
  summary: string;
  index: number;
  links: Link[];
};

export type Selection = {
  [key: number]: number | null;
};

export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next() {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

export const loadState = (gameType: string) => {
  const state = localStorage.getItem(`wikiSortGameState-${gameType}`);
  return state ? JSON.parse(state) : null;
};

export const saveState = (gameType: string, state: any) => {
  localStorage.setItem(`wikiSortGameState-${gameType}`, JSON.stringify(state));
};

export const colorMap = {
  0: "bg-red-100",
  1: "bg-cyan-100",
  2: "bg-slate-100",
  3: "bg-orange-100",
};

export const formatTime = (startTime: number, cmp?: number) => {
  if (!startTime) {
    return "--:--";
  }
  const time = Math.floor(((cmp || Date.now()) - startTime) / 1000);
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};
