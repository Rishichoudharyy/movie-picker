import Link from "next/link";
import { getRecommendations } from "@/lib/discover";
import type { RuntimeBucket } from "@/lib/omdb";
import MovieCard from "./MovieCard";

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ResultsPage(props: PageProps<"/results">) {
  const searchParams = await props.searchParams;

  const genres = (first(searchParams.genres) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const services = (first(searchParams.services) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const runtime = (first(searchParams.runtime) ?? "any") as RuntimeBucket;
  const type = first(searchParams.type) === "tv_series" ? "tv_series" : "movie";

  const results = await getRecommendations({ genres, services, runtime, type });

  return (
    <div className="flex flex-1 flex-col items-center bg-[var(--background)] px-6 py-16">
      <div className="w-full max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Here&apos;s what we found</h1>
          <Link
            href="/quiz"
            className="text-sm font-medium text-[var(--muted-text)] underline underline-offset-4 hover:text-[var(--rose)]"
          >
            Retake the quiz
          </Link>
        </div>

        {results.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--surface-border)] p-10 text-center text-[var(--muted-text)]">
            <p>
              Nothing matched all of that. Try a different service or set
              runtime to &quot;doesn&apos;t matter.&quot;
            </p>
            <Link
              href="/quiz"
              className="mt-4 inline-block font-medium text-[var(--foreground)] underline underline-offset-4"
            >
              Back to quiz
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((movie, i) => (
              <MovieCard key={movie.id} movie={movie} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
