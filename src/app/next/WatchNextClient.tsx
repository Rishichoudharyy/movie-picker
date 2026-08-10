"use client";

import { useEffect, useState } from "react";
import SearchPicker, { type PickedTitle } from "@/app/SearchPicker";
import FusionResultView, { type FusionResponse } from "@/app/FusionResultView";
import MovieCard from "@/app/results/MovieCard";
import type { Recommendation } from "@/lib/discover";

const STORAGE_KEY = "moviepicker:watched";
const MAX_LOGGED = 5;

export default function WatchNextClient() {
  const [watched, setWatched] = useState<PickedTitle[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const [fusionResult, setFusionResult] = useState<FusionResponse | null>(null);
  const [fusionLoading, setFusionLoading] = useState(false);
  const [fusionError, setFusionError] = useState<string | null>(null);

  const [surprisePick, setSurprisePick] = useState<Recommendation | null>(null);
  const [surpriseLoading, setSurpriseLoading] = useState(false);
  const [surpriseError, setSurpriseError] = useState<string | null>(null);

  useEffect(() => {
    // One-time sync from localStorage on mount. Deliberately not read via a
    // lazy useState initializer: that would return different content on the
    // server (no localStorage) vs. the client, causing a hydration mismatch.
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setWatched(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watched));
  }, [watched, hydrated]);

  function handleChange(next: PickedTitle[]) {
    setWatched(next);
    setFusionResult(null);
    setSurprisePick(null);
  }

  async function continueVibe() {
    const lastTwo = watched.slice(-2).map((w) => w.id);
    setFusionLoading(true);
    setFusionError(null);
    setFusionResult(null);
    setSurprisePick(null);
    try {
      const res = await fetch("/api/fusion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: lastTwo }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFusionError(data.error ?? "Something went wrong.");
        return;
      }
      setFusionResult(data);
    } catch {
      setFusionError("Something went wrong.");
    } finally {
      setFusionLoading(false);
    }
  }

  async function surpriseMe() {
    setSurpriseLoading(true);
    setSurpriseError(null);
    setSurprisePick(null);
    setFusionResult(null);
    try {
      const res = await fetch("/api/surprise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ watchedIds: watched.map((w) => w.id) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSurpriseError(data.error ?? "Something went wrong.");
        return;
      }
      setSurprisePick(data.pick);
    } catch {
      setSurpriseError("Something went wrong.");
    } finally {
      setSurpriseLoading(false);
    }
  }

  const canRecommend = watched.length >= 1;
  const canContinueVibe = watched.length >= 2;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">
          <span className="accent-gradient-text">Watch Next</span>
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Log what you&apos;ve recently watched — saved on this device only.
        </p>
      </div>

      <SearchPicker
        picked={watched}
        onChange={handleChange}
        max={MAX_LOGGED}
        placeholder="Log a movie or show you watched…"
      />

      {watched.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled={!canContinueVibe || fusionLoading}
            onClick={continueVibe}
            className="accent-gradient flex h-12 flex-1 items-center justify-center rounded-full text-sm font-medium text-white shadow-lg shadow-pink-500/20 transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
          >
            {fusionLoading ? "Thinking…" : "Continue the vibe"}
          </button>
          <button
            type="button"
            disabled={!canRecommend || surpriseLoading}
            onClick={surpriseMe}
            className="flex h-12 flex-1 items-center justify-center rounded-full border border-[var(--surface-border)] text-sm font-medium transition-colors hover:border-pink-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {surpriseLoading ? "Thinking…" : "Surprise me"}
          </button>
        </div>
      )}

      {watched.length === 1 && (
        <p className="text-center text-xs text-zinc-400">
          Log one more to unlock &quot;Continue the vibe.&quot;
        </p>
      )}

      {fusionError && (
        <p className="text-center text-sm text-red-500">{fusionError}</p>
      )}
      {surpriseError && (
        <p className="text-center text-sm text-red-500">{surpriseError}</p>
      )}

      {fusionResult && (
        <FusionResultView
          result={fusionResult}
          onReset={() => setFusionResult(null)}
          resetLabel="Hide"
        />
      )}

      {surprisePick && (
        <div className="space-y-2">
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            Something different, for a change of pace.
          </p>
          <MovieCard movie={surprisePick} index={0} />
        </div>
      )}
    </div>
  );
}
