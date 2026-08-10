"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Recommendation } from "@/lib/discover";
import ScoreBadge from "@/app/ScoreBadge";

interface SimilarTitle {
  id: number;
  title: string;
  year: number | null;
  poster: string | null;
}

interface TitleDetails {
  verdict: string | null;
  reviewSummary: string | null;
  criticScore: number | null;
  userRating: number | null;
  trailerEmbedUrl: string | null;
  similar: SimilarTitle[];
}

export default function MovieCard({
  movie,
  index,
}: {
  movie: Recommendation;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<TitleDetails | null>(null);
  const [error, setError] = useState(false);

  async function handleToggle() {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);
    if (details || loading) return;

    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/title/${movie.id}/details`);
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setDetails(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
      className="flex flex-col overflow-hidden rounded-sm border border-[var(--surface-border)] bg-[var(--surface)]"
    >
      <div className="flex gap-4 p-4">
        <div className="h-44 w-28 flex-shrink-0 overflow-hidden rounded-sm bg-[var(--muted-surface)]">
          {movie.poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={movie.poster}
              alt={movie.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-[var(--muted-text)]">
              No poster
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="truncate font-semibold text-[var(--foreground)]">
            {movie.title}
          </h2>
          <p className="text-xs text-[var(--muted-text)]">
            {[movie.year, movie.runtime, movie.imdbRating && `★ ${movie.imdbRating}`]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {movie.genre && <p className="text-xs text-[var(--muted-text)]">{movie.genre}</p>}
          {movie.plot && (
            <p className="mt-1 line-clamp-4 text-xs text-[var(--muted-text)]">
              {movie.plot}
            </p>
          )}
        </div>
      </div>

      {movie.sources.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-dashed border-[var(--surface-border)] px-4 py-3">
          {movie.sources.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm border border-dashed border-[var(--surface-border)] px-3 py-1 text-xs font-medium text-[var(--foreground)] hover:border-[var(--rose)] hover:text-[var(--rose)]"
            >
              {s.name}
            </a>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={handleToggle}
        className="border-t border-dashed border-[var(--surface-border)] px-4 py-2.5 text-left text-xs font-bold tracking-wide text-[var(--rose)] uppercase hover:text-[var(--rose-deep)]"
      >
        {expanded ? "Show less" : "Tell me more"}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-t border-dashed border-[var(--surface-border)]"
          >
            <div className="space-y-4 p-4">
              {loading && (
                <p className="text-xs text-[var(--muted-text)]">Loading the details…</p>
              )}
              {error && (
                <p className="text-xs text-[var(--muted-text)]">
                  Couldn&apos;t load extra details for this one.
                </p>
              )}
              {details && (
                <>
                  {(details.criticScore !== null || details.userRating !== null) && (
                    <div className="flex flex-wrap gap-2">
                      {details.criticScore !== null && (
                        <ScoreBadge label="Critics" value={details.criticScore} max={100} />
                      )}
                      {details.userRating !== null && (
                        <ScoreBadge label="Audience" value={details.userRating} max={10} />
                      )}
                    </div>
                  )}

                  {details.verdict && (
                    <div>
                      <h3 className="text-xs font-semibold tracking-wide text-[var(--muted-text)] uppercase">
                        Worth your time?
                      </h3>
                      <p className="mt-1 text-sm text-[var(--foreground)]">
                        {details.verdict}
                      </p>
                    </div>
                  )}

                  {details.reviewSummary && (
                    <p className="text-xs text-[var(--muted-text)]">
                      {details.reviewSummary}
                    </p>
                  )}

                  {details.trailerEmbedUrl && (
                    <div className="aspect-video overflow-hidden rounded-sm">
                      <iframe
                        src={details.trailerEmbedUrl}
                        title={`${movie.title} trailer`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full"
                      />
                    </div>
                  )}

                  {details.similar.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold tracking-wide text-[var(--muted-text)] uppercase">
                        Watch this next
                      </h3>
                      <div className="mt-2 flex gap-3 overflow-x-auto pb-1">
                        {details.similar.map((s) => (
                          <div key={s.id} className="w-20 flex-shrink-0">
                            <div className="aspect-[2/3] overflow-hidden rounded-sm bg-[var(--muted-surface)]">
                              {s.poster ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={s.poster}
                                  alt={s.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : null}
                            </div>
                            <p className="mt-1 truncate text-[10px] text-[var(--muted-text)]">
                              {s.title}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
