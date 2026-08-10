import { getGenres } from "@/lib/watchmode";
import { CURATED_GENRES as CURATED } from "@/lib/genres";

export async function GET() {
  try {
    const genres = await getGenres();
    const names = new Set(genres.map((g) => g.name));
    const available = CURATED.filter((name) => names.has(name));
    return Response.json({ genres: available });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
