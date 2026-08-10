import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Movie Picker — What to watch tonight",
  description:
    "Answer a few questions and get a movie or show to watch, filtered to the streaming services you already have in India.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <header className="flex items-center justify-between border-b border-[var(--surface-border)] px-6 py-4">
          <Link href="/" className="text-sm font-semibold accent-gradient-text">
            Movie Picker
          </Link>
          <nav className="flex gap-5 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <Link href="/quiz" className="hover:text-pink-500">
              Quiz
            </Link>
            <Link href="/fusion" className="hover:text-pink-500">
              Fusion
            </Link>
            <Link href="/next" className="hover:text-pink-500">
              Watch Next
            </Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
