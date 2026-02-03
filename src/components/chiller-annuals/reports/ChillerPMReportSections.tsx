import React from "react";
import { formatValue, type ReportSection } from "@/services/chillerPMReportService";

interface SectionProps {
  section: ReportSection;
}

export function ReportSectionCard({ section }: SectionProps) {
  return (
    <div className="border border-border rounded-lg p-4 print:border-black print:break-inside-avoid">
      <h3 className="font-semibold text-sm mb-3 pb-2 border-b print:text-black">
        {section.title}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
        {section.items.map((item, idx) => (
          <div key={idx} className="text-sm">
            <span className="text-muted-foreground print:text-gray-600">{item.label}: </span>
            <span
              className={
                item.status === "critical"
                  ? "text-destructive font-medium print:text-red-600"
                  : item.status === "warning"
                  ? "text-yellow-600 font-medium print:text-orange-600"
                  : "print:text-black"
              }
            >
              {formatValue(item.value, item.unit)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface FindingsProps {
  findings: any[];
}

export function FindingsSection({ findings }: FindingsProps) {
  if (!findings?.length) {
    return (
      <div className="border border-border rounded-lg p-4 print:border-black">
        <h3 className="font-semibold text-sm mb-2 print:text-black">Findings</h3>
        <p className="text-sm text-muted-foreground print:text-gray-600">
          No findings recorded for this inspection.
        </p>
      </div>
    );
  }

  const getSeverityStyle = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300 print:bg-red-50";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300 print:bg-orange-50";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300 print:bg-yellow-50";
      case "low":
        return "bg-green-100 text-green-800 border-green-300 print:bg-green-50";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="border border-border rounded-lg p-4 print:border-black print:break-inside-avoid">
      <h3 className="font-semibold text-sm mb-3 pb-2 border-b print:text-black">
        Findings ({findings.length})
      </h3>
      <div className="space-y-3">
        {findings.map((finding, idx) => (
          <div
            key={finding.id || idx}
            className={`p-3 rounded border ${getSeverityStyle(finding.severity)}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold uppercase">
                    {finding.severity}
                  </span>
                  {finding.issue_code && (
                    <span className="text-xs opacity-70">{finding.issue_code}</span>
                  )}
                  {finding.is_repeat_finding && (
                    <span className="text-xs bg-red-200 px-1.5 rounded">REPEAT</span>
                  )}
                </div>
                <p className="text-sm font-medium">{finding.description}</p>
                {finding.recommended_action && (
                  <p className="text-xs mt-1 opacity-80">
                    <strong>Action:</strong> {finding.recommended_action}
                  </p>
                )}
              </div>
              <div className="text-right text-xs">
                <span
                  className={`px-2 py-0.5 rounded ${
                    finding.status === "resolved"
                      ? "bg-green-200"
                      : finding.status === "open"
                      ? "bg-red-200"
                      : "bg-yellow-200"
                  }`}
                >
                  {finding.status}
                </span>
                {finding.estimated_cost && (
                  <div className="mt-1 text-xs">
                    Est: ${finding.estimated_cost.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface RiskGaugeProps {
  score: number | null;
  level: string | null;
}

export function RiskScoreGauge({ score, level }: RiskGaugeProps) {
  const displayScore = score ?? 0;
  const percentage = Math.min(100, Math.max(0, displayScore));

  const getColor = () => {
    if (displayScore >= 70) return "#dc2626"; // red
    if (displayScore >= 40) return "#ca8a04"; // yellow
    return "#16a34a"; // green
  };

  const getLevelLabel = () => {
    switch (level?.toLowerCase()) {
      case "critical":
        return "CRITICAL RISK";
      case "high":
        return "HIGH RISK";
      case "medium":
        return "MEDIUM RISK";
      case "low":
        return "LOW RISK";
      default:
        return "UNKNOWN";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 print:p-2">
      <div className="relative w-32 h-32 print:w-24 print:h-24">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
            className="print:stroke-gray-300"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={getColor()}
            strokeWidth="10"
            strokeDasharray={`${percentage * 2.83} 283`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold print:text-2xl print:text-black">
            {displayScore.toFixed(0)}
          </span>
          <span className="text-xs text-muted-foreground print:text-gray-600">/100</span>
        </div>
      </div>
      <div
        className="mt-2 px-3 py-1 rounded-full text-xs font-semibold text-white print:text-black print:bg-gray-200"
        style={{ backgroundColor: getColor() }}
      >
        {getLevelLabel()}
      </div>
    </div>
  );
}
