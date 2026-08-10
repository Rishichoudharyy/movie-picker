import { scoreBand, scoreBandClasses } from "@/lib/score";

export default function ScoreBadge({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const band = scoreBand(value, max);
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${scoreBandClasses[band]}`}
    >
      {label} {value}
      {max === 100 ? "%" : `/${max}`}
    </span>
  );
}
