import {
  discoverTitles,
  getTitleSources,
  getTrending,
  type WatchmodeTitleSource,
} from "./watchmode";
import {
  getOmdbByImdbId,
  matchesRuntimeBucket,
  parseRuntimeMinutes,
  type RuntimeBucket,
} from "./omdb";

export interface Recommendation {
  id: number;
  title: string;
  year: string;
  poster: string | null;
  plot: string | null;
  imdbRating: string | null;
  runtime: string | null;
  genre: string | null;
  sources: { name: string; type: string; url: string }[];
}

export interface RecommendationQuery {
  genres: string[];
  services: string[];
  runtime: RuntimeBucket;
  type: "movie" | "tv_series";
}

const CANDIDATE_LIMIT = 20;
const RESULT_LIMIT = 12;

export async function getRecommendations(
  query: RecommendationQuery
): Promise<Recommendation[]> {
  const candidates = await discoverTitles({
    genreNames: query.genres,
    sourceNames: query.services,
    type: query.type,
    region: "IN",
    limit: CANDIDATE_LIMIT,
  });

  const withImdbId = candidates.filter((c) => c.imdb_id);

  const enriched = await Promise.all(
    withImdbId.map(async (c) => {
      const omdb = await getOmdbByImdbId(c.imdb_id!).catch(() => null);
      return { candidate: c, omdb };
    })
  );

  const filtered = enriched.filter(({ omdb }) => {
    const minutes = parseRuntimeMinutes(omdb?.Runtime);
    return matchesRuntimeBucket(minutes, query.runtime);
  });

  const top = filtered.slice(0, RESULT_LIMIT);

  const withSources = await Promise.all(
    top.map(async ({ candidate, omdb }) => {
      const sources = await getTitleSources(candidate.id, "IN").catch(
        () => [] as WatchmodeTitleSource[]
      );
      const badges = dedupeSources(sources);
      return {
        id: candidate.id,
        title: candidate.title,
        year: omdb?.Year ?? String(candidate.year ?? ""),
        poster: omdb?.Poster && omdb.Poster !== "N/A" ? omdb.Poster : null,
        plot: omdb?.Plot && omdb.Plot !== "N/A" ? omdb.Plot : null,
        imdbRating:
          omdb?.imdbRating && omdb.imdbRating !== "N/A"
            ? omdb.imdbRating
            : null,
        runtime: omdb?.Runtime && omdb.Runtime !== "N/A" ? omdb.Runtime : null,
        genre: omdb?.Genre && omdb.Genre !== "N/A" ? omdb.Genre : null,
        sources: badges,
      } satisfies Recommendation;
    })
  );

  return withSources;
}

export interface TrendingPoster {
  id: number;
  title: string;
  year: string;
  poster: string | null;
}

// Homepage strip: trending titles with a poster for each, resolved via OMDb
// (cheap and already-cached) rather than Watchmode's heavier details call.
export async function getTrendingWithPosters(
  type: "movie" | "tv_series" = "movie",
  limit = 10
): Promise<TrendingPoster[]> {
  const trending = await getTrending(type, "IN", limit);
  const withImdbId = trending.filter((t) => t.imdb_id);

  const enriched = await Promise.all(
    withImdbId.map(async (t) => {
      const omdb = await getOmdbByImdbId(t.imdb_id!).catch(() => null);
      return {
        id: t.id,
        title: t.title,
        year: omdb?.Year ?? String(t.year ?? ""),
        poster: omdb?.Poster && omdb.Poster !== "N/A" ? omdb.Poster : null,
      } satisfies TrendingPoster;
    })
  );

  return enriched.filter((t) => t.poster !== null);
}

function dedupeSources(
  sources: WatchmodeTitleSource[]
): { name: string; type: string; url: string }[] {
  const seen = new Set<string>();
  const result: { name: string; type: string; url: string }[] = [];
  for (const s of sources) {
    if (seen.has(s.name)) continue;
    seen.add(s.name);
    result.push({ name: s.name, type: s.type, url: s.web_url });
  }
  return result;
}
