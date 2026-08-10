export default function Loading() {
  return (
    <div className="flex flex-1 flex-col items-center bg-[var(--background)] px-6 py-16">
      <div className="w-full max-w-5xl space-y-8">
        <h1 className="text-2xl font-semibold">
          Finding something <span className="accent-gradient-text">good…</span>
        </h1>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="relative flex gap-4 overflow-hidden rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-4 shimmer"
            >
              <div className="h-44 w-28 flex-shrink-0 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
              <div className="flex flex-1 flex-col gap-2 py-1">
                <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-3 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-3 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
