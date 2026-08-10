"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Recommendation } from "@/lib/discover";
import { scoreBand, scoreBandClasses } from "@/lib/score";

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

function ScoreBadge({ label, value, max }: { label: string; value: number; max: number }) {
  const band = scoreBand(value, max);
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${scoreBandClasses[band]}`}
    >
      {label} {value}
      {max === 100 ? "%" : `/${max}`}
    </span>
  );
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
      whileHover={{ y: -4 }}
      className="flex flex-col overflow-hidden rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] shadow-sm transition-shadow hover:shadow-xl"
    >
      <div className="flex gap-4 p-4">
        <div className="h-44 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
          {movie.poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={movie.poster}
              alt={movie.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
              No poster
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="truncate font-semibold text-zinc-950 dark:text-zinc-50">
            {movie.title}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {[movie.year, movie.runtime, movie.imdbRating && `★ ${movie.imdbRating}`]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {movie.genre && <p className="text-xs text-zinc-400">{movie.genre}</p>}
          {movie.plot && (
            <p className="mt-1 line-clamp-4 text-xs text-zinc-600 dark:text-zinc-400">
              {movie.plot}
            </p>
          )}
        </div>
      </div>

      {movie.sources.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-[var(--surface-border)] px-4 py-3">
          {movie.sources.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              {s.name}
            </a>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={handleToggle}
        className="border-t border-[var(--surface-border)] px-4 py-2.5 text-left text-xs font-semibold accent-gradient-text hover:opacity-80"
      >
        {expanded ? "Show less ▲" : "Tell me more ▾"}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-t border-[var(--surface-border)]"
          >
            <div className="space-y-4 p-4">
              {loading && (
                <p className="text-xs text-zinc-400">Loading the details…</p>
              )}
              {error && (
                <p className="text-xs text-zinc-400">
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
                      <h3 className="text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                        Worth your time?
                      </h3>
                      <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                        {details.verdict}
                      </p>
                    </div>
                  )}

                  {details.reviewSummary && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {details.reviewSummary}
                    </p>
                  )}

                  {details.trailerEmbedUrl && (
                    <div className="aspect-video overflow-hidden rounded-lg">
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
                      <h3 className="text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                        Watch this next
                      </h3>
                      <div className="mt-2 flex gap-3 overflow-x-auto pb-1">
                        {details.similar.map((s) => (
                          <div key={s.id} className="w-20 flex-shrink-0">
                            <div className="aspect-[2/3] overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
                              {s.poster ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={s.poster}
                                  alt={s.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : null}
                            </div>
                            <p className="mt-1 truncate text-[10px] text-zinc-600 dark:text-zinc-400">
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
