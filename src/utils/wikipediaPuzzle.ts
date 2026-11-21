/**
 * Generates a daily puzzle for the Wikipedia Connections game.
 *
 * A puzzle is a tree of Wikipedia articles: a random start article, BREADTH
 * articles it links to, and below each of those a chain of single links until
 * DEPTH is reached. Articles whose titles share words with any other article in
 * the puzzle are skipped, so the connections can't be guessed from the names alone.
 *
 * The tree is built greedily: a link is only followed if its own article has
 * enough links to continue from, so we rarely have to backtrack.
 *
 * Only used on the server: src/db/wikipedia.ts calls it on the first request of each day.
 */
import { Parser } from "htmlparser2";

const BREADTH = 4;
const DEPTH = 6;
const MIN_LINKS_PER_ARTICLE = 10;
const CANDIDATES_PER_STEP = 8;
const MAX_ATTEMPTS = 10;

const WIKI = "https://en.wikipedia.org";
const USER_AGENT =
  "bjoernf.com Wikipedia Connections (https://bjoernf.com/games/wikipedia-connections)";

export type PuzzleNode = {
  text: string;
  url: string;
  title: string;
  summary: string;
  image: string;
  links: PuzzleNode[];
};

export type Puzzle = PuzzleNode & { date: string };

type ArticleLink = { title: string; url: string };

/** Everything already in the puzzle, so nothing repeats or gives the answer away. */
type Used = { urls: Set<string>; words: Set<string> };

const STOP_WORDS = new Set(
  (
    "the of and in on a an is was are were be been being to from by with as at for or not " +
    "this that these those it its it's they their them he his him she her hers i me my mine " +
    "you your yours we us our ours all any some none more most much many about into over " +
    "under through around up down left right back front"
  ).split(" "),
);

export async function generatePuzzle(date: string): Promise<Puzzle> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const start = await getJson(`${WIKI}/api/rest_v1/page/random/summary`).catch(() => null);
    if (!start?.title) continue;

    const title: string = start.title;
    const url: string = start.content_urls.desktop.page;
    const used: Used = { urls: new Set([url]), words: new Set(titleWords(title)) };

    const startLinks = await getArticleLinks(title);
    const links =
      startLinks.length >= MIN_LINKS_PER_ARTICLE
        ? await pickChildren(startLinks, 1, BREADTH, used)
        : null;

    if (links) {
      return {
        date,
        text: title,
        url,
        title,
        summary: start.extract ?? "",
        image: start.thumbnail?.source ?? "",
        links,
      };
    }
    console.log(`[wikipedia] "${title}" didn't work out (attempt ${attempt}), trying another`);
  }
  throw new Error(`Could not generate a puzzle after ${MAX_ATTEMPTS} attempts`);
}

/**
 * Picks `count` of `candidates` as the children at `depth`, each with its own
 * chain of children below it. Returns null if not enough candidates work out.
 */
async function pickChildren(
  candidates: ArticleLink[],
  depth: number,
  count: number,
  used: Used,
): Promise<PuzzleNode[] | null> {
  const nodes: PuzzleNode[] = [];
  let tried = 0;

  for (const link of shuffle(candidates)) {
    if (nodes.length === count) break;
    if (tried >= CANDIDATES_PER_STEP * count) break;

    const words = titleWords(link.title);
    if (used.urls.has(link.url) || words.some((w) => used.words.has(w))) continue;
    tried++;

    const snapshot: Used = { urls: new Set(used.urls), words: new Set(used.words) };
    used.urls.add(link.url);
    words.forEach((w) => used.words.add(w));

    let children: PuzzleNode[] | null = [];
    if (depth < DEPTH) {
      const links = await getArticleLinks(link.title);
      children =
        links.length >= MIN_LINKS_PER_ARTICLE ? await pickChildren(links, depth + 1, 1, used) : null;
    }

    if (!children) {
      used.urls = snapshot.urls;
      used.words = snapshot.words;
      continue;
    }

    const summary = await getJson(
      `${WIKI}/api/rest_v1/page/summary/${encodeTitle(link.title)}`,
    ).catch(() => ({}));
    nodes.push({
      text: link.title,
      url: link.url,
      title: link.title,
      summary: summary.extract ?? "",
      image: summary.thumbnail?.source ?? "",
      links: children,
    });
  }

  return nodes.length === count ? nodes : null;
}

/** Article links that appear in the body text (`section p > a[rel=mw:WikiLink]`). */
async function getArticleLinks(title: string): Promise<ArticleLink[]> {
  const html = await getText(`${WIKI}/api/rest_v1/page/html/${encodeTitle(title)}`).catch(
    () => "",
  );

  const links = new Map<string, ArticleLink>();
  const stack: string[] = [];
  const parser = new Parser({
    onopentag(name, attrs) {
      const parent = stack[stack.length - 1];
      const href = attrs.href ?? "";
      if (
        name === "a" &&
        parent === "p" &&
        stack.includes("section") &&
        attrs.rel?.split(" ").includes("mw:WikiLink") &&
        href.startsWith("./") &&
        !href.includes(":") && // skips File:, Category:, Help: etc.
        !href.includes("redlink")
      ) {
        const path = href.slice(2).split("#")[0];
        const url = `${WIKI}/wiki/${path}`;
        const linkTitle = attrs.title || decodeURIComponent(path).replace(/_/g, " ");
        if (!links.has(url)) links.set(url, { url, title: linkTitle });
      }
      stack.push(name);
    },
    onclosetag() {
      stack.pop();
    },
  });
  parser.write(html);
  parser.end();
  return [...links.values()];
}

function titleWords(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .split(/\s+/)
    .filter((w) => w && !STOP_WORDS.has(w));
}

function encodeTitle(title: string) {
  return encodeURIComponent(title.replace(/ /g, "_"));
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

async function fetchWiki(url: string) {
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`${response.status} for ${url}`);
  return response;
}

const getJson = async (url: string) => (await fetchWiki(url)).json();
const getText = async (url: string) => (await fetchWiki(url)).text();
