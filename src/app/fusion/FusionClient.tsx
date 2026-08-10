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
        <h1 className="text-2xl font-semibold">
          <span className="accent-gradient-text">Movie Fusion</span>
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Pick 2 or 3 movies or shows you love. We&apos;ll blend them into
          something new.
        </p>
      </div>

      {!result && (
        <div className="space-y-4">
          <SearchPicker picked={picked} onChange={setPicked} max={3} />
          <button
            type="button"
            disabled={picked.length < 2 || loading}
            onClick={handleFuse}
            className="accent-gradient flex h-12 w-full items-center justify-center rounded-full text-base font-medium text-white shadow-lg shadow-pink-500/20 transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
          >
            {loading ? "Fusing…" : "Fuse them"}
          </button>
          {error && <p className="text-center text-sm text-red-500">{error}</p>}
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
