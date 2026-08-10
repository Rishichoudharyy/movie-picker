const BASE_URL = "https://api.watchmode.com/v1";

export interface WatchmodeGenre {
  id: number;
  name: string;
}

export interface WatchmodeSource {
  id: number;
  name: string;
  type: string; // sub | free | purchase | rent
  regions: string[];
}

export interface WatchmodeListItem {
  id: number;
  title: string;
  year: number | null;
  imdb_id: string | null;
  tmdb_id: number | null;
  type: string;
}

export interface WatchmodeTitleSource {
  source_id: number;
  name: string;
  type: string;
  region: string;
  web_url: string;
  format?: string;
  price?: number | null;
}

function apiKey(): string {
  const key = process.env.WATCHMODE_API_KEY;
  if (!key) throw new Error("WATCHMODE_API_KEY is not set");
  return key;
}

async function watchmodeFetch<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
  revalidateSeconds?: number
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("apiKey", apiKey());
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  }

  const res = await fetch(
    url.toString(),
    revalidateSeconds !== undefined
      ? { next: { revalidate: revalidateSeconds } }
      : undefined
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Watchmode ${path} failed: ${res.status} ${body}`);
  }
  return res.json() as Promise<T>;
}

// Simple in-memory caches — genres/sources barely change, so refetching every
// request would just burn free-tier quota for no reason.
let genreCache: WatchmodeGenre[] | null = null;
const sourceCache: Record<string, WatchmodeSource[]> = {};

const DAY = 60 * 60 * 24;
const SIX_HOURS = 60 * 60 * 6;

export async function getGenres(): Promise<WatchmodeGenre[]> {
  if (genreCache) return genreCache;
  const data = await watchmodeFetch<WatchmodeGenre[]>("/genres/", {}, 7 * DAY);
  genreCache = data;
  return data;
}

export async function getSourcesForRegion(
  region = "IN"
): Promise<WatchmodeSource[]> {
  if (sourceCache[region]) return sourceCache[region];
  const data = await watchmodeFetch<WatchmodeSource[]>(
    "/sources/",
    { regions: region },
    7 * DAY
  );
  sourceCache[region] = data;
  return data;
}

async function resolveGenreIds(names: string[]): Promise<number[]> {
  if (names.length === 0) return [];
  const genres = await getGenres();
  const wanted = names.map((n) => n.toLowerCase());
  return genres
    .filter((g) => wanted.includes(g.name.toLowerCase()))
    .map((g) => g.id);
}

async function resolveSourceIds(
  names: string[],
  region: string
): Promise<number[]> {
  if (names.length === 0) return [];
  const sources = await getSourcesForRegion(region);
  const wanted = names.map((n) => n.toLowerCase());
  return sources
    .filter((s) => wanted.includes(s.name.toLowerCase()))
    .map((s) => s.id);
}

export interface DiscoverParams {
  genreNames: string[];
  sourceNames: string[];
  type: "movie" | "tv_series";
  region?: string;
  limit?: number;
}

export async function discoverTitles(
  params: DiscoverParams
): Promise<WatchmodeListItem[]> {
  const region = params.region ?? "IN";
  const [genreIds, sourceIds] = await Promise.all([
    resolveGenreIds(params.genreNames),
    resolveSourceIds(params.sourceNames, region),
  ]);

  const data = await watchmodeFetch<{ titles: WatchmodeListItem[] }>(
    "/list-titles/",
    {
      types: params.type,
      genres: genreIds.join(",") || undefined,
      source_ids: sourceIds.join(",") || undefined,
      regions: region,
      sort_by: "popularity_desc",
      limit: params.limit ?? 20,
    },
    60 * 60 // 1 hour — results should feel reasonably fresh
  );
  return data.titles ?? [];
}

export async function getTitleSources(
  titleId: number,
  region = "IN"
): Promise<WatchmodeTitleSource[]> {
  const data = await watchmodeFetch<WatchmodeTitleSource[]>(
    `/title/${titleId}/sources/`,
    {},
    60 * 60 * 12
  );
  return data.filter((s) => s.region === region);
}

export interface WatchmodeTitleDetails {
  id: number;
  title: string;
  year: number | null;
  imdb_id: string | null;
  plot_overview: string | null;
  will_you_like_this: string | null;
  review_summary: string | null;
  critic_score: number | null;
  user_rating: number | null;
  runtime_minutes: number | null;
  genre_names: string[];
  poster: string | null;
  posterMedium: string | null;
  posterLarge: string | null;
  backdrop: string | null;
  trailer: string | null;
  trailer_thumbnail: string | null;
  similar_titles: number[];
}

// Full title details (verdict, scores, trailer, similar titles). This is a
// heavier call than list-titles/sources, so it's only ever fetched on demand
// (per-card "tell me more" click), never eagerly for a whole results grid —
// the account's monthly Watchmode quota can't cover that. Cached for a day
// since the same popular titles get expanded by many different visitors.
export async function getTitleDetails(
  titleId: number
): Promise<WatchmodeTitleDetails> {
  return watchmodeFetch<WatchmodeTitleDetails>(
    `/title/${titleId}/details/`,
    { append_to_response: "similar_titles" },
    DAY
  );
}

export interface WatchmodeSearchResult {
  id: number;
  name: string;
  year: number | null;
  type: string;
  image_url: string | null;
}

// Type-ahead title search, used by the "pick your movies" inputs on the
// Fusion and Watch Next pages. Cached an hour — the same partial query
// string gets typed by many different visitors.
export async function searchTitles(
  query: string
): Promise<WatchmodeSearchResult[]> {
  if (!query.trim()) return [];
  const data = await watchmodeFetch<{ results: WatchmodeSearchResult[] }>(
    "/autocomplete-search/",
    { search_value: query, search_type: 2 },
    60 * 60
  );
  return (data.results ?? []).filter(
    (r) => r.type === "movie" || r.type === "tv_series"
  );
}

export interface WatchmodeTrendingItem {
  id: number;
  title: string;
  year: number | null;
  imdb_id: string | null;
  type: string;
  popularity_percentile: number | null;
}

// Cheap, shared-across-all-visitors call for a homepage "trending now" strip.
export async function getTrending(
  type: "movie" | "tv_series",
  region = "IN",
  limit = 10
): Promise<WatchmodeTrendingItem[]> {
  const data = await watchmodeFetch<{ titles: WatchmodeTrendingItem[] }>(
    "/list-titles/",
    {
      types: type,
      regions: region,
      sort_by: "popularity_desc",
      limit,
    },
    SIX_HOURS
  );
  return data.titles ?? [];
}
