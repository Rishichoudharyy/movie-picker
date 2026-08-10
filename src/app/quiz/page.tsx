"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

type RuntimeBucket = "short" | "medium" | "long" | "any";
type MediaType = "movie" | "tv_series";

const RUNTIME_OPTIONS: { value: RuntimeBucket; label: string }[] = [
  { value: "short", label: "Short — under 90 min" },
  { value: "medium", label: "Medium — 90 to 130 min" },
  { value: "long", label: "Long — over 130 min" },
  { value: "any", label: "Doesn't matter" },
];

function OptionButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-sm border px-4 py-2 text-sm font-medium transition-colors ${
        selected
          ? "border-[var(--rose)] bg-[var(--rose)] text-[var(--surface)]"
          : "border-dashed border-[var(--surface-border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--rose)]"
      }`}
    >
      {children}
    </button>
  );
}

export default function QuizPage() {
  const router = useRouter();

  const [genres, setGenres] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [genre, setGenre] = useState<string | null>(null);
  const [runtime, setRuntime] = useState<RuntimeBucket>("any");
  const [type, setType] = useState<MediaType>("movie");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/genres").then((r) => r.json()),
      fetch("/api/sources").then((r) => r.json()),
    ])
      .then(([genresData, sourcesData]) => {
        setGenres(genresData.genres ?? []);
        setServices(sourcesData.services ?? []);
      })
      .finally(() => setLoadingOptions(false));
  }, []);

  function toggleService(name: string) {
    setSelectedServices((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  }

  function handleSubmit() {
    const params = new URLSearchParams();
    if (genre) params.set("genres", genre);
    params.set("runtime", runtime);
    params.set("type", type);
    if (selectedServices.length > 0)
      params.set("services", selectedServices.join(","));
    router.push(`/results?${params.toString()}`);
  }

  const canSubmit = !loadingOptions && genre !== null;

  return (
    <div className="flex flex-1 flex-col items-center bg-[var(--background)] px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl space-y-10"
      >
        <p className="mb-2 text-xs font-bold tracking-widest text-[var(--rose)] uppercase">
          Tonight&rsquo;s Feature
        </p>
        <h1 className="text-2xl font-bold">
          A few questions, then we&apos;ll pick something.
        </h1>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-[var(--muted-text)]">
            What are you in the mood for?
          </h2>
          {loadingOptions ? (
            <p className="text-sm text-[var(--muted-text)]">Loading genres…</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => (
                <OptionButton
                  key={g}
                  selected={genre === g}
                  onClick={() => setGenre(g)}
                >
                  {g}
                </OptionButton>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-[var(--muted-text)]">
            How long have you got?
          </h2>
          <div className="flex flex-wrap gap-2">
            {RUNTIME_OPTIONS.map((opt) => (
              <OptionButton
                key={opt.value}
                selected={runtime === opt.value}
                onClick={() => setRuntime(opt.value)}
              >
                {opt.label}
              </OptionButton>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-[var(--muted-text)]">
            Movie or a show?
          </h2>
          <div className="flex flex-wrap gap-2">
            <OptionButton
              selected={type === "movie"}
              onClick={() => setType("movie")}
            >
              Movie
            </OptionButton>
            <OptionButton
              selected={type === "tv_series"}
              onClick={() => setType("tv_series")}
            >
              TV Show
            </OptionButton>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-[var(--muted-text)]">
            Which of these do you have? (optional — leave blank for
            everything)
          </h2>
          {loadingOptions ? (
            <p className="text-sm text-[var(--muted-text)]">Loading services…</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {services.map((s) => (
                <OptionButton
                  key={s}
                  selected={selectedServices.includes(s)}
                  onClick={() => toggleService(s)}
                >
                  {s}
                </OptionButton>
              ))}
            </div>
          )}
        </section>

        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="ticket-cta h-12 w-full justify-center disabled:cursor-not-allowed disabled:opacity-40"
        >
          Find Me Something to Watch
        </button>
      </motion.div>
    </div>
  );
}
