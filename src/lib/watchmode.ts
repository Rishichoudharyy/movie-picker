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
  params: Record<string, string | number | undefined> = {}
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("apiKey", apiKey());
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  }

  const res = await fetch(url.toString());
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

export async function getGenres(): Promise<WatchmodeGenre[]> {
  if (genreCache) return genreCache;
  const data = await watchmodeFetch<WatchmodeGenre[]>("/genres/");
  genreCache = data;
  return data;
}

export async function getSourcesForRegion(
  region = "IN"
): Promise<WatchmodeSource[]> {
  if (sourceCache[region]) return sourceCache[region];
  const data = await watchmodeFetch<WatchmodeSource[]>("/sources/", {
    regions: region,
  });
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
    }
  );
  return data.titles ?? [];
}

export async function getTitleSources(
  titleId: number,
  region = "IN"
): Promise<WatchmodeTitleSource[]> {
  const data = await watchmodeFetch<WatchmodeTitleSource[]>(
    `/title/${titleId}/sources/`
  );
  return data.filter((s) => s.region === region);
}
