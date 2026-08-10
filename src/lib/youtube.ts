export function youtubeEmbedUrl(trailerUrl: string | null): string | null {
  if (!trailerUrl) return null;
  const watchMatch = trailerUrl.match(/[?&]v=([^&]+)/);
  const shortMatch = trailerUrl.match(/youtu\.be\/([^?&]+)/);
  const videoId = watchMatch?.[1] ?? shortMatch?.[1];
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}
