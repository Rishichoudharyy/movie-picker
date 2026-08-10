import { NextRequest } from "next/server";
import { searchTitles } from "@/lib/watchmode";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";

  try {
    const results = await searchTitles(q);
    return Response.json({
      results: results.map((r) => ({
        id: r.id,
        title: r.name,
        year: r.year,
        type: r.type,
        poster: r.image_url,
      })),
    });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
