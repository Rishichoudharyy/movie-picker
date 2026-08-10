import { getTitleDetails, getTitleSources } from "./watchmode";
import { dedupeSources, type Recommendation } from "./discover";

// Watch Next's core mechanic: given one seed title, suggest the single next
// thing to watch from Watchmode's own similar_titles ranking (already
// ordered by their relevance), skipping anything already seen in this
// chain. Cheap by design — 2 details calls per step (seed + chosen next),
// no candidate-pool fan-out like the Fusion engine, because this runs
// repeatedly as the user keeps clicking "what's next".
export async function getNextInJourney(
  seedId: number,
  excludeIds: number[]
): Promise<Recommendation | null> {
  const seed = await getTitleDetails(seedId).catch(() => null);
  if (!seed) return null;

  const excludeSet = new Set([seedId, ...excludeIds]);
  const nextId = seed.similar_titles.find((id) => !excludeSet.has(id));
  if (nextId === undefined) return null;

  const details = await getTitleDetails(nextId).catch(() => null);
  if (!details) return null;

  const sources = await getTitleSources(nextId, "IN").catch(() => []);

  return {
    id: details.id,
    title: details.title,
    year: details.year ? String(details.year) : "",
    poster: details.posterMedium ?? details.poster,
    plot: details.plot_overview,
    imdbRating:
      details.user_rating !== null ? String(details.user_rating) : null,
    runtime: details.runtime_minutes ? `${details.runtime_minutes} min` : null,
    genre: details.genre_names.length > 0 ? details.genre_names.join(", ") : null,
    sources: dedupeSources(sources),
  } satisfies Recommendation;
}
