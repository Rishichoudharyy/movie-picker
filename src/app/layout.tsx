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
        <header className="flex items-center justify-between border-b border-dashed border-[var(--surface-border)] bg-[var(--surface)] px-6 py-4">
          <Link
            href="/"
            className="text-base font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Movie Picker
          </Link>
          <nav className="flex gap-6 text-xs font-semibold tracking-widest text-[var(--muted-text)] uppercase">
            <Link href="/quiz" className="hover:text-[var(--rose)]">
              Quiz
            </Link>
            <Link href="/fusion" className="hover:text-[var(--rose)]">
              Fusion
            </Link>
            <Link href="/next" className="hover:text-[var(--rose)]">
              Watch Next
            </Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
