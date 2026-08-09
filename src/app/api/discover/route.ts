import { NextRequest } from "next/server";
import { getRecommendations } from "@/lib/discover";
import type { RuntimeBucket } from "@/lib/omdb";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const genres = (params.get("genres") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const services = (params.get("services") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const runtime = (params.get("runtime") ?? "any") as RuntimeBucket;
  const type = params.get("type") === "tv_series" ? "tv_series" : "movie";

  try {
    const results = await getRecommendations({ genres, services, runtime, type });
    return Response.json({ results });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
