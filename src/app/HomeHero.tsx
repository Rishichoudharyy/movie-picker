"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { TrendingPoster } from "@/lib/discover";

export default function HomeHero({ trending }: { trending: TrendingPoster[] }) {
  return (
    <div className="flex w-full flex-col items-center gap-14 py-24">
      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex w-full max-w-xl flex-col items-center gap-6 px-6 text-center"
      >
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Stop scrolling.
          <br />
          <span className="accent-gradient-text">Start watching.</span>
        </h1>
        <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Answer a few quick questions and we&apos;ll pick something you can
          actually watch right now, on a service you already pay for.
        </p>
        <Link
          href="/quiz"
          className="accent-gradient mt-4 flex h-12 items-center justify-center rounded-full px-8 text-base font-medium text-white shadow-lg shadow-pink-500/20 transition-transform hover:scale-105"
        >
          Take the quiz
        </Link>
      </motion.main>

      {trending.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full"
        >
          <h2 className="mb-4 px-6 text-sm font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
            Trending now
          </h2>
          <div className="flex w-full gap-4 overflow-x-auto px-6 pb-4 [scrollbar-width:thin]">
            {trending.map((title, i) => (
              <motion.div
                key={title.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * i }}
                whileHover={{ scale: 1.05, y: -4 }}
                className="w-32 flex-shrink-0 sm:w-36"
              >
                <div className="aspect-[2/3] overflow-hidden rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] shadow-md">
                  {title.poster ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={title.poster}
                      alt={title.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                      No poster
                    </div>
                  )}
                </div>
                <p className="mt-2 truncate text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  {title.title}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}
