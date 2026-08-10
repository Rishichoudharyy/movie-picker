"use client";

import { useEffect, useRef, useState } from "react";

export interface PickedTitle {
  id: number;
  title: string;
  year: number | null;
  type: string;
  poster: string | null;
}

export default function SearchPicker({
  picked,
  onChange,
  max,
  placeholder = "Search for a movie or show…",
}: {
  picked: PickedTitle[];
  onChange: (picked: PickedTitle[]) => void;
  max: number;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PickedTitle[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) return;

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function addTitle(title: PickedTitle) {
    if (picked.some((p) => p.id === title.id)) return;
    if (picked.length >= max) return;
    onChange([...picked, title]);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  function removeTitle(id: number) {
    onChange(picked.filter((p) => p.id !== id));
  }

  const atMax = picked.length >= max;

  return (
    <div className="space-y-3">
      {picked.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {picked.map((p) => (
            <span
              key={p.id}
              className="flex items-center gap-2 rounded-sm border-2 border-dashed border-[var(--gold)] bg-[var(--surface)] py-1 pr-2 pl-1 text-sm"
            >
              {p.poster && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.poster}
                  alt={p.title}
                  className="h-6 w-6 rounded-full object-cover"
                />
              )}
              <span className="font-medium">{p.title}</span>
              <button
                type="button"
                onClick={() => removeTitle(p.id)}
                className="text-[var(--muted-text)] hover:text-[var(--rose)]"
                aria-label={`Remove ${p.title}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {!atMax && (
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder={placeholder}
            className="w-full rounded-sm border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2.5 text-sm outline-none focus:border-[var(--rose)]"
          />
          {loading && (
            <span className="absolute top-1/2 right-4 -translate-y-1/2 text-xs text-[var(--muted-text)]">
              …
            </span>
          )}
          {open && query.trim() !== "" && results.length > 0 && (
            <div className="absolute z-10 mt-2 max-h-72 w-full overflow-y-auto rounded-sm border border-[var(--surface-border)] bg-[var(--surface)] shadow-lg">
              {results.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => addTitle(r)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-[var(--muted-surface)]"
                >
                  {r.poster ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.poster}
                      alt={r.title}
                      className="h-10 w-8 flex-shrink-0 rounded object-cover"
                    />
                  ) : (
                    <span className="h-10 w-8 flex-shrink-0 rounded bg-[var(--muted-surface)]" />
                  )}
                  <span className="min-w-0 flex-1 truncate">
                    {r.title}
                    {r.year && (
                      <span className="text-[var(--muted-text)]"> · {r.year}</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
