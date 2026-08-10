"use client";

import { motion, AnimatePresence } from "framer-motion";
import ScoreBadge from "@/app/ScoreBadge";

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

function RunnerUpCard({ result }: { result: FusionResult }) {
  return (
    <div className="flex gap-3 rounded-sm border border-[var(--surface-border)] bg-[var(--surface)] p-3">
      <div className="h-24 w-16 flex-shrink-0 overflow-hidden rounded-sm bg-[var(--muted-surface)]">
        {result.poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={result.poster}
            alt={result.title}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <p className="truncate text-sm font-semibold">{result.title}</p>
        <p className="text-xs text-[var(--muted-text)]">
          {result.year} · {result.genreOverlapPercent}% genre match
        </p>
        {result.matchedFromMultiple && (
          <p className="text-xs font-medium text-score-good">
            Picked by more than one of your movies
          </p>
        )}
      </div>
    </div>
  );
}

export default function FusionResultView({
  result,
  onReset,
  resetLabel = "Try another combo",
}: {
  result: FusionResponse;
  onReset: () => void;
  resetLabel?: string;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <p className="text-center text-sm text-[var(--muted-text)]">
          If {result.inputs.map((i) => i.title).join(" + ")} had a movie
          child…
        </p>

        {result.top ? (
          <div className="ticket-stub overflow-hidden">
            <div className="flex gap-5 p-6">
              <div className="h-56 w-36 flex-shrink-0 overflow-hidden rounded-sm bg-[var(--muted-surface)]">
                {result.top.poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={result.top.poster}
                    alt={result.top.title}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="flex min-w-0 flex-col gap-2">
                <h2
                  className="text-xl font-bold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {result.top.title}
                </h2>
                <p className="text-xs text-[var(--muted-text)]">
                  {result.top.year}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-sm border border-dashed border-[var(--surface-border)] px-2.5 py-1 text-xs font-semibold text-[var(--muted-text)]">
                    Genre match {result.top.genreOverlapPercent}%
                  </span>
                  {result.top.matchedFromMultiple && (
                    <span className="rounded-sm bg-score-good/15 px-2.5 py-1 text-xs font-semibold text-score-good">
                      Picked by both your movies
                    </span>
                  )}
                  {result.top.criticScore !== null && (
                    <ScoreBadge label="Critics" value={result.top.criticScore} max={100} />
                  )}
                  {result.top.userRating !== null && (
                    <ScoreBadge label="Audience" value={result.top.userRating} max={10} />
                  )}
                </div>
                {result.top.verdict && (
                  <p className="text-sm text-[var(--foreground)]">
                    {result.top.verdict}
                  </p>
                )}
              </div>
            </div>

            {result.top.sources.length > 0 && (
              <div className="flex flex-wrap gap-2 border-t border-dashed border-[var(--surface-border)] px-6 py-3">
                {result.top.sources.map((s) => (
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

            {result.top.trailerEmbedUrl && (
              <div className="aspect-video border-t border-dashed border-[var(--surface-border)]">
                <iframe
                  src={result.top.trailerEmbedUrl}
                  title={`${result.top.title} trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-sm text-[var(--muted-text)]">
            Couldn&apos;t find a good fusion for these — try a different
            combination.
          </p>
        )}

        {result.runnersUp.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-semibold tracking-wide text-[var(--muted-text)] uppercase">
              Other possible fusions
            </h3>
            <div className="space-y-2">
              {result.runnersUp.map((r) => (
                <RunnerUpCard key={r.id} result={r} />
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onReset}
          className="mx-auto flex h-11 items-center justify-center rounded-sm border border-dashed border-[var(--surface-border)] px-6 text-sm font-medium hover:border-[var(--rose)] hover:text-[var(--rose)]"
        >
          {resetLabel}
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
