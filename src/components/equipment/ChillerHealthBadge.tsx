interface ChillerHealthBadgeProps {
  score: number;
  riskBand: "low" | "medium" | "high" | "critical";
}

const riskStyles: Record<ChillerHealthBadgeProps["riskBand"], string> = {
  low: "bg-emerald-100 text-emerald-800 border-emerald-300",
  medium: "bg-amber-100 text-amber-800 border-amber-300",
  high: "bg-orange-100 text-orange-800 border-orange-300",
  critical: "bg-red-100 text-red-800 border-red-300",
};

export const ChillerHealthBadge = ({ score, riskBand }: ChillerHealthBadgeProps) => {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${riskStyles[riskBand]}`}
      title={`Chiller health score: ${score}/100`}
    >
      {riskBand} risk • {score}/100
    </span>
  );
};

