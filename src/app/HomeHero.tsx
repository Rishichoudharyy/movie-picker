"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { TrendingPoster } from "@/lib/discover";

const FEATURES = [
  {
    href: "/quiz",
    numeral: "I.",
    title: "Quiz",
    description: "A few quick questions, one pick for tonight.",
  },
  {
    href: "/fusion",
    numeral: "II.",
    title: "Fusion",
    description: "Blend two or three favorites into something new.",
  },
  {
    href: "/next",
    numeral: "III.",
    title: "Watch Next",
    description: "Log one film, keep the recommendations coming.",
  },
];

export default function HomeHero({ trending }: { trending: TrendingPoster[] }) {
  const posterAccents = trending.slice(0, 3);

  return (
    <div className="flex w-full flex-col items-center gap-16 py-20">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="grid w-full max-w-4xl grid-cols-1 items-center gap-10 px-6 md:grid-cols-[1.1fr_0.9fr]"
      >
        <div className="ticket-stub px-9 py-10">
          <p className="mb-3 text-xs font-bold tracking-widest text-[var(--rose)] uppercase">
            Tonight&rsquo;s Feature
          </p>
          <h1
            className="text-4xl leading-[1.08] font-bold tracking-tight sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Stop scrolling.
            <br />
            Start watching.
          </h1>
          <p className="mt-5 max-w-sm text-base leading-7 text-[var(--muted-text)]">
            Answer a few quick questions and we&apos;ll pick something you can
            actually watch right now, on a service you already pay for.
          </p>
          <Link href="/quiz" className="ticket-cta mt-6">
            Admit One — Take the Quiz →
          </Link>
          <p className="mt-6 border-t border-dashed border-[var(--surface-border)] pt-3 text-[11px] tracking-widest text-[var(--muted-text)] uppercase">
            Screening now · In theatres of your living room
          </p>
        </div>

        {posterAccents.length > 0 && (
          <div className="flex gap-3">
            {posterAccents.map((p) => (
              <div
                key={p.id}
                className="aspect-[2/3] flex-1 overflow-hidden rounded-sm border border-[var(--surface-border)]"
              >
                {p.poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.poster}
                    alt={p.title}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
            ))}
          </div>
        )}
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex w-full max-w-4xl flex-col gap-6 border-t border-dashed border-[var(--surface-border)] px-6 pt-8 sm:flex-row"
      >
        {FEATURES.map((f, i) => (
          <Link
            key={f.href}
            href={f.href}
            className={`flex-1 pr-6 ${
              i < FEATURES.length - 1
                ? "border-b border-dashed border-[var(--surface-border)] pb-4 sm:border-r sm:border-b-0 sm:pb-0"
                : ""
            }`}
          >
            <span
              className="text-sm text-[var(--gold)] italic"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {f.numeral}
            </span>
            <h3
              className="mt-1 text-lg font-bold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {f.title}
            </h3>
            <p className="mt-1 text-sm text-[var(--muted-text)]">
              {f.description}
            </p>
          </Link>
        ))}
      </motion.section>

      {trending.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full"
        >
          <h2 className="mb-4 px-6 text-xs font-bold tracking-widest text-[var(--muted-text)] uppercase">
            Trending now
          </h2>
          <div className="flex w-full gap-4 overflow-x-auto px-6 pb-4 [scrollbar-width:thin]">
            {trending.map((title, i) => (
              <motion.div
                key={title.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * i }}
                className="w-32 flex-shrink-0 sm:w-36"
              >
                <div className="aspect-[2/3] overflow-hidden rounded-sm border border-[var(--surface-border)] bg-[var(--surface)]">
                  {title.poster ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={title.poster}
                      alt={title.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-[var(--muted-text)]">
                      No poster
                    </div>
                  )}
                </div>
                <p className="mt-2 truncate text-xs font-medium text-[var(--foreground)]">
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
