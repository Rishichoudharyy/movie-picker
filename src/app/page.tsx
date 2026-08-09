import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 dark:bg-black">
      <main className="flex w-full max-w-xl flex-col items-center gap-6 py-32 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Stop scrolling. Start watching.
        </h1>
        <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Answer a few quick questions and we&apos;ll pick something you can
          actually watch right now, on a service you already pay for.
        </p>
        <Link
          href="/quiz"
          className="mt-4 flex h-12 items-center justify-center rounded-full bg-zinc-950 px-8 text-base font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          Take the quiz
        </Link>
      </main>
    </div>
  );
}
