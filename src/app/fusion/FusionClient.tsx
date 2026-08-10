"use client";

import { useState } from "react";
import SearchPicker, { type PickedTitle } from "@/app/SearchPicker";
import FusionResultView, { type FusionResponse } from "@/app/FusionResultView";

export default function FusionClient() {
  const [picked, setPicked] = useState<PickedTitle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FusionResponse | null>(null);

  async function handleFuse() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/fusion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: picked.map((p) => p.id) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setResult(data);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setPicked([]);
    setResult(null);
    setError(null);
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="mb-2 text-xs font-bold tracking-widest text-[var(--rose)] uppercase">
          Double Feature
        </p>
        <h1 className="text-2xl font-bold">Movie Fusion</h1>
        <p className="mt-2 text-sm text-[var(--muted-text)]">
          Pick 2 or 3 favorites and blend them into one new pick — a single
          one-off mashup. Looking for an ongoing chain of suggestions
          instead? Try{" "}
          <a href="/next" className="underline underline-offset-4 hover:text-[var(--rose)]">
            Watch Next
          </a>
          .
        </p>
      </div>

      {!result && (
        <div className="space-y-4">
          <SearchPicker picked={picked} onChange={setPicked} max={3} />
          <button
            type="button"
            disabled={picked.length < 2 || loading}
            onClick={handleFuse}
            className="ticket-cta h-12 w-full justify-center disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Fusing…" : "Fuse Them"}
          </button>
          {error && <p className="text-center text-sm text-score-low">{error}</p>}
        </div>
      )}

      {result && (
        <FusionResultView
          result={result}
          onReset={reset}
          resetLabel="Try another combo"
        />
      )}
    </div>
  );
}
