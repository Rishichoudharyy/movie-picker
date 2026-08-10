import { getTitleDetails } from "@/lib/watchmode";
import { youtubeEmbedUrl } from "@/lib/youtube";

const SIMILAR_LIMIT = 3;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const titleId = Number(id);

  if (!Number.isFinite(titleId)) {
    return Response.json({ error: "Invalid title id" }, { status: 400 });
  }

  try {
    const details = await getTitleDetails(titleId);

    const similarIds = details.similar_titles.slice(0, SIMILAR_LIMIT);
    const similar = await Promise.all(
      similarIds.map(async (similarId) => {
        try {
          const s = await getTitleDetails(similarId);
          return {
            id: s.id,
            title: s.title,
            year: s.year,
            poster: s.posterMedium ?? s.poster,
          };
        } catch {
          return null;
        }
      })
    );

    return Response.json({
      id: details.id,
      title: details.title,
      verdict: details.will_you_like_this,
      reviewSummary: details.review_summary,
      criticScore: details.critic_score,
      userRating: details.user_rating,
      trailerEmbedUrl: youtubeEmbedUrl(details.trailer),
      similar: similar.filter((s) => s !== null),
    });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
