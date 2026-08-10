"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchPicker, { type PickedTitle } from "@/app/SearchPicker";
import MovieCard from "@/app/results/MovieCard";
import type { Recommendation } from "@/lib/discover";

const STORAGE_KEY = "moviepicker:journey";

interface JourneyState {
  trail: PickedTitle[];
  current: Recommendation | null;
}

export default function WatchNextClient() {
  const [trail, setTrail] = useState<PickedTitle[]>([]);
  const [current, setCurrent] = useState<Recommendation | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // One-time sync from localStorage on mount. Deliberately not read via a
    // lazy useState initializer: that would return different content on the
    // server (no localStorage) vs. the client, causing a hydration mismatch.
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: JourneyState = JSON.parse(raw);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTrail(parsed.trail ?? []);
        setCurrent(parsed.current ?? null);
      }
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ trail, current }));
  }, [trail, current, hydrated]);

  async function fetchNext(seedId: number, excludeIds: number[]) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/journey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seedId, excludeIds }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't find a next suggestion.");
        setCurrent(null);
        return;
      }
      setCurrent(data.next);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleSeedPicked(picked: PickedTitle[]) {
    const seed = picked[0];
    if (!seed) return;
    setTrail([seed]);
    fetchNext(seed.id, []);
  }

  function watchedItNext() {
    if (!current) return;
    const nextTrail = [...trail, toPickedTitle(current)];
    setTrail(nextTrail);
    fetchNext(current.id, nextTrail.map((t) => t.id));
  }

  async function surpriseMe() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/surprise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ watchedIds: trail.map((t) => t.id) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't find a surprise pick.");
        return;
      }
      setCurrent(data.pick);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function startOver() {
    setTrail([]);
    setCurrent(null);
    setError(null);
  }

  const seed = trail[0];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="mb-2 text-xs font-bold tracking-widest text-[var(--rose)] uppercase">
          Now Showing
        </p>
        <h1 className="text-2xl font-bold">Watch Next</h1>
        <p className="mt-2 text-sm text-[var(--muted-text)]">
          Tell us one movie or show you watched — we&apos;ll keep suggesting
          what to watch after it, one at a time.
        </p>
      </div>

      {trail.length === 0 ? (
        <SearchPicker
          picked={[]}
          onChange={handleSeedPicked}
          max={1}
          placeholder="What did you just watch?"
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted-text)]">
              <span>Your journey:</span>
              {trail.map((t, i) => (
                <span key={t.id} className="flex items-center gap-2">
                  {i > 0 && <span>→</span>}
                  <span className="font-medium text-[var(--foreground)]">
                    {t.title}
                  </span>
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={startOver}
              className="text-xs font-medium text-[var(--muted-text)] underline underline-offset-4 hover:text-[var(--rose)]"
            >
              Start over
            </button>
          </div>

          {loading && (
            <p className="text-center text-sm text-[var(--muted-text)]">
              Finding what&apos;s next…
            </p>
          )}

          {error && <p className="text-center text-sm text-score-low">{error}</p>}

          <AnimatePresence mode="wait">
            {current && !loading && (
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <MovieCard movie={current} index={0} />
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={watchedItNext}
                    className="ticket-cta h-12 flex-1 justify-center"
                  >
                    Watched It — Next!
                  </button>
                  <button
                    type="button"
                    onClick={surpriseMe}
                    className="flex h-12 flex-1 items-center justify-center rounded-sm border border-dashed border-[var(--surface-border)] text-sm font-medium transition-colors hover:border-[var(--rose)] hover:text-[var(--rose)]"
                  >
                    Surprise me instead
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!current && !loading && !error && seed && (
            <p className="text-center text-sm text-[var(--muted-text)]">
              That&apos;s everything related we could find — try starting
              over with something else.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function toPickedTitle(r: Recommendation): PickedTitle {
  return {
    id: r.id,
    title: r.title,
    year: r.year ? Number(r.year) : null,
    type: "movie",
    poster: r.poster,
  };
}
