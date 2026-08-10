const BASE_URL = "https://www.omdbapi.com/";

export interface OmdbTitle {
  Title: string;
  Year: string;
  Runtime: string; // e.g. "128 min" or "N/A"
  Genre: string;
  Poster: string; // URL or "N/A"
  imdbRating: string;
  Plot: string;
  Rated: string;
  Response: "True" | "False";
}

function apiKey(): string {
  const key = process.env.OMDB_API_KEY;
  if (!key) throw new Error("OMDB_API_KEY is not set");
  return key;
}

export async function getOmdbByImdbId(
  imdbId: string
): Promise<OmdbTitle | null> {
  const url = new URL(BASE_URL);
  url.searchParams.set("apikey", apiKey());
  url.searchParams.set("i", imdbId);

  // Poster/plot/rating barely change once a title exists, so cache generously.
  const res = await fetch(url.toString(), {
    next: { revalidate: 60 * 60 * 24 },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as OmdbTitle;
  if (data.Response === "False") return null;
  return data;
}

export function parseRuntimeMinutes(runtime: string | undefined): number | null {
  if (!runtime) return null;
  const match = runtime.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

export type RuntimeBucket = "short" | "medium" | "long" | "any";

export function matchesRuntimeBucket(
  minutes: number | null,
  bucket: RuntimeBucket
): boolean {
  if (bucket === "any") return true;
  if (minutes === null) return true; // don't punish unknown runtime
  if (bucket === "short") return minutes < 90;
  if (bucket === "medium") return minutes >= 90 && minutes <= 130;
  return minutes > 130; // long
}
