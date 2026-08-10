import { getNextInJourney } from "@/lib/journey";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const seedId = typeof body?.seedId === "number" ? body.seedId : null;
    const excludeIds: number[] = Array.isArray(body?.excludeIds)
      ? body.excludeIds.filter((id: unknown): id is number => typeof id === "number")
      : [];

    if (seedId === null) {
      return Response.json({ error: "seedId is required." }, { status: 400 });
    }

    const next = await getNextInJourney(seedId, excludeIds);
    if (!next) {
      return Response.json(
        { error: "Ran out of related suggestions for this one." },
        { status: 404 }
      );
    }
    return Response.json({ next });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
