import { getFusion } from "@/lib/fusion";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ids = Array.isArray(body?.ids)
      ? body.ids.filter((id: unknown): id is number => typeof id === "number")
      : [];

    if (ids.length < 2 || ids.length > 3) {
      return Response.json(
        { error: "Pick 2 or 3 titles to fuse." },
        { status: 400 }
      );
    }

    const fusion = await getFusion(ids);
    return Response.json(fusion);
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
