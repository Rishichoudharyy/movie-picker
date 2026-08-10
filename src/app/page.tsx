import { getTrendingWithPosters } from "@/lib/discover";
import HomeHero from "./HomeHero";

export default async function Home() {
  const trending = await getTrendingWithPosters("movie", 10).catch(() => []);

  return (
    <div className="flex flex-1 flex-col items-center bg-[var(--background)]">
      <HomeHero trending={trending} />
    </div>
  );
}
