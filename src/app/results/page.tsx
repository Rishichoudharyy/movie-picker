import Link from "next/link";
import { getRecommendations } from "@/lib/discover";
import type { RuntimeBucket } from "@/lib/omdb";

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
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="w-full max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
            Here&apos;s what we found
          </h1>
          <Link
            href="/quiz"
            className="text-sm font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Retake the quiz
          </Link>
        </div>

        {results.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-10 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            <p>
              Nothing matched all of that. Try a different service or set
              runtime to &quot;doesn&apos;t matter.&quot;
            </p>
            <Link
              href="/quiz"
              className="mt-4 inline-block font-medium text-zinc-950 underline underline-offset-4 dark:text-zinc-50"
            >
              Back to quiz
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((movie) => (
              <div
                key={movie.id}
                className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex gap-4 p-4">
                  <div className="h-36 w-24 flex-shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
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
                    {movie.genre && (
                      <p className="text-xs text-zinc-400">{movie.genre}</p>
                    )}
                    {movie.plot && (
                      <p className="mt-1 line-clamp-4 text-xs text-zinc-600 dark:text-zinc-400">
                        {movie.plot}
                      </p>
                    )}
                  </div>
                </div>
                {movie.sources.length > 0 && (
                  <div className="flex flex-wrap gap-2 border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
