import { getSourcesForRegion } from "@/lib/watchmode";

// Popular India streaming services — keeps the quiz from being cluttered
// with niche add-on channels (e.g. "MGM+ (Via Amazon Prime)").
const CURATED = [
  "Netflix",
  "Prime Video",
  "JioHotstar",
  "Sony LIV",
  "Zee5",
  "AppleTV+",
  "MUBI",
  "Discovery+",
  "Sun Nxt",
];

export async function GET() {
  try {
    const sources = await getSourcesForRegion("IN");
    const names = new Set(
      sources.filter((s) => s.type === "sub").map((s) => s.name)
    );
    const available = CURATED.filter((name) => names.has(name));
    return Response.json({ services: available });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
