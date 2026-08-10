export type ScoreBand = "good" | "mid" | "low";

// Normalizes a rating on any 0-max scale to a color band.
export function scoreBand(value: number, max: number): ScoreBand {
  const percent = (value / max) * 100;
  if (percent >= 65) return "good";
  if (percent >= 40) return "mid";
  return "low";
}

export const scoreBandClasses: Record<ScoreBand, string> = {
  good: "bg-score-good/15 text-score-good",
  mid: "bg-score-mid/15 text-score-mid",
  low: "bg-score-low/15 text-score-low",
};
