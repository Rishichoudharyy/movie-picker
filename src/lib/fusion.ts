import {
  getTitleDetails,
  getTitleSources,
  type WatchmodeTitleDetails,
} from "./watchmode";
import { dedupeSources } from "./discover";
import { youtubeEmbedUrl } from "./youtube";

// How many candidates get a full details fetch. Bounds the feature's
// Watchmode cost regardless of how many inputs or how large their
// similar_titles lists are — pre-ranking below is free (no API calls).
const CANDIDATE_CAP = 15;
const RUNNERS_UP = 2;

export interface FusionResult {
  id: number;
  title: string;
  year: number | null;
  poster: string | null;
  genreOverlapPercent: number;
  matchedFromMultiple: boolean;
  criticScore: number | null;
  userRating: number | null;
  verdict: string | null;
  trailerEmbedUrl: string | null;
  sources: { name: string; type: string; url: string }[];
}

export interface FusionResponse {
  inputs: { id: number; title: string; genreNames: string[] }[];
  top: FusionResult | null;
  runnersUp: FusionResult[];
}

function jaccard(a: string[], b: string[]): number {
  const setA = new Set(a.map((s) => s.toLowerCase()));
  const setB = new Set(b.map((s) => s.toLowerCase()));
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const x of setA) if (setB.has(x)) intersection++;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

function toFusionResult(
  details: WatchmodeTitleDetails,
  genreOverlapPercent: number,
  matchedFromMultiple: boolean,
  sources: FusionResult["sources"]
): FusionResult {
  return {
    id: details.id,
    title: details.title,
    year: details.year,
    poster: details.posterLarge ?? details.posterMedium ?? details.poster,
    genreOverlapPercent,
    matchedFromMultiple,
    criticScore: details.critic_score,
    userRating: details.user_rating,
    verdict: details.will_you_like_this,
    trailerEmbedUrl: youtubeEmbedUrl(details.trailer),
    sources,
  };
}

export async function getFusion(inputIds: number[]): Promise<FusionResponse> {
  const inputs = await Promise.all(inputIds.map((id) => getTitleDetails(id)));
  const inputIdSet = new Set(inputIds);

  // Cheap pre-rank over raw similar_titles IDs — no API calls yet. A
  // candidate that shows up in more than one input's list, and appears
  // early in those lists, is a much stronger fusion signal than genre
  // matching alone.
  const freq = new Map<number, number>();
  const bestPosition = new Map<number, number>();
  for (const input of inputs) {
    input.similar_titles.forEach((candidateId, index) => {
      if (inputIdSet.has(candidateId)) return;
      freq.set(candidateId, (freq.get(candidateId) ?? 0) + 1);
      const prev = bestPosition.get(candidateId);
      if (prev === undefined || index < prev) bestPosition.set(candidateId, index);
    });
  }

  const rankedIds = Array.from(freq.keys()).sort((a, b) => {
    const freqDiff = (freq.get(b) ?? 0) - (freq.get(a) ?? 0);
    if (freqDiff !== 0) return freqDiff;
    return (bestPosition.get(a) ?? 0) - (bestPosition.get(b) ?? 0);
  });

  const candidateIds = rankedIds.slice(0, CANDIDATE_CAP);
  const inputSummary = inputs.map((i) => ({
    id: i.id,
    title: i.title,
    genreNames: i.genre_names,
  }));

  if (candidateIds.length === 0) {
    return { inputs: inputSummary, top: null, runnersUp: [] };
  }

  const unionGenres = Array.from(
    new Set(inputs.flatMap((i) => i.genre_names))
  );

  const candidates = await Promise.all(
    candidateIds.map((id) => getTitleDetails(id).catch(() => null))
  );

  const scored = candidates
    .filter((c): c is WatchmodeTitleDetails => c !== null)
    .map((details) => ({
      details,
      genreOverlapPercent: Math.round(
        jaccard(details.genre_names, unionGenres) * 100
      ),
      matchedFromMultiple: (freq.get(details.id) ?? 0) > 1,
    }))
    .sort((a, b) => {
      if (a.matchedFromMultiple !== b.matchedFromMultiple) {
        return a.matchedFromMultiple ? -1 : 1;
      }
      if (b.genreOverlapPercent !== a.genreOverlapPercent) {
        return b.genreOverlapPercent - a.genreOverlapPercent;
      }
      return (b.details.critic_score ?? 0) - (a.details.critic_score ?? 0);
    });

  if (scored.length === 0) {
    return { inputs: inputSummary, top: null, runnersUp: [] };
  }

  const [topScored, ...rest] = scored;
  const runnersUpScored = rest.slice(0, RUNNERS_UP);

  const topSources = await getTitleSources(topScored.details.id, "IN").catch(
    () => []
  );

  return {
    inputs: inputSummary,
    top: toFusionResult(
      topScored.details,
      topScored.genreOverlapPercent,
      topScored.matchedFromMultiple,
      dedupeSources(topSources)
    ),
    runnersUp: runnersUpScored.map((s) =>
      toFusionResult(s.details, s.genreOverlapPercent, s.matchedFromMultiple, [])
    ),
  };
}
