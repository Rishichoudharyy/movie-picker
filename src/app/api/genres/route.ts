import { getGenres } from "@/lib/watchmode";

// Curated set of genres we want to offer in the quiz, if Watchmode has them.
const CURATED = [
  "Comedy",
  "Drama",
  "Action",
  "Thriller",
  "Horror",
  "Romance",
  "Science Fiction",
  "Documentary",
  "Animation",
  "Family",
  "Fantasy",
  "Mystery",
  "Crime",
];

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
