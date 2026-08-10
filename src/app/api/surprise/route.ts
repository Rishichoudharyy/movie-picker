import { getSurpriseMe } from "@/lib/discover";
import { getTitleDetails } from "@/lib/watchmode";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const watchedIds: number[] = Array.isArray(body?.watchedIds)
      ? body.watchedIds.filter((id: unknown): id is number => typeof id === "number")
      : [];

    const watched = await Promise.all(
      watchedIds.map((id) => getTitleDetails(id).catch(() => null))
    );
    const excludeGenres = Array.from(
      new Set(watched.filter((w) => w !== null).flatMap((w) => w.genre_names))
    );

    const pick = await getSurpriseMe(excludeGenres, "movie");
    if (!pick) {
      return Response.json({ error: "Couldn't find a surprise pick." }, { status: 404 });
    }
    return Response.json({ pick });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
