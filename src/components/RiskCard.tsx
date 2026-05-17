"use client";

import { AlertCircle, FileText, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { useState, memo } from "react";

/** Possible severity levels for identified contract risks */
export type RiskSeverity = "High" | "Medium" | "Low";

/** Risk category types for clause classification */
export type RiskCategory = "Privacy" | "Financial" | "Employment" | "IP" | "Termination" | "Compliance" | "Ambiguity";

/** Individual risk finding from the Gemini analysis */
export interface Risk {
  id: string;
  category: string;
  originalText: string;
  explanation: string;
  consequence: string;
  severity: RiskSeverity;
  recommendation?: string;
  industryStandard?: string;
}

/** Complete analysis result returned by the /api/analyze endpoint */
export interface AnalysisResult {
  overallScore: number;
  summary: string;
  documentType?: string;
  metrics: {
    privacyScore: number;
    financialRiskScore: number;
    employmentFairnessScore: number;
    ipProtectionScore: number;
    terminationFairnessScore: number;
    ambiguityScore: number;
  };
  risks: Risk[];
}

/** Severity badge color mappings */
const SEVERITY_COLORS: Record<string, string> = {
  High: "border-red-500 text-red-500 bg-red-500/10",
  Medium: "border-amber-500 text-amber-500 bg-amber-500/10",
  Low: "border-blue-500 text-blue-500 bg-blue-500/10",
};

/** Category badge color mappings */
const CATEGORY_COLORS: Record<string, string> = {
  Privacy: "text-purple-400",
  Financial: "text-amber-400",
  Employment: "text-blue-400",
  IP: "text-cyan-400",
  Termination: "text-red-400",
  Compliance: "text-green-400",
  Ambiguity: "text-gray-400",
};

/**
 * RiskCard component displays a single contract risk finding
 * with severity badge, category tag, expandable original clause,
 * and AI-generated mitigation recommendation.
 */
export const RiskCard = memo(function RiskCard({ risk }: { risk: Risk }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article
      aria-label={`${risk.severity} severity ${risk.category} risk`}
      className="bg-[#171717] border border-[#333333] rounded-xl overflow-hidden mb-4 transition-all duration-300 hover:border-gray-600"
    >
      <div className="p-5">
        <div className="flex flex-wrap gap-2 items-center mb-3">
          <AlertCircle
            aria-hidden="true"
            className={`w-5 h-5 ${SEVERITY_COLORS[risk.severity]?.split(" ")[1] || "text-gray-400"}`}
          />
          <span className={`text-xs font-bold uppercase px-2 py-1 rounded-md border ${SEVERITY_COLORS[risk.severity] || "border-gray-500 text-gray-500 bg-gray-500/10"}`}>
            {risk.severity} Risk
          </span>
          <span className={`text-xs font-medium px-2 py-1 rounded-md bg-white/5 ${CATEGORY_COLORS[risk.category] || "text-gray-400"}`}>
            {risk.category}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-white mb-2">{risk.explanation}</h3>
        <p className="text-gray-400 text-sm mb-3 leading-relaxed">{risk.consequence}</p>

        {risk.recommendation && (
          <div className="flex items-start gap-2 bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 mb-3">
            <Lightbulb aria-hidden="true" className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <p className="text-blue-300 text-xs leading-relaxed">{risk.recommendation}</p>
          </div>
        )}

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-controls={`clause-${risk.id}`}
          className="flex items-center text-xs font-medium text-gray-500 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-1"
        >
          <FileText aria-hidden="true" className="w-4 h-4 mr-2" />
          {isExpanded ? "Hide Original Clause" : "View Original Clause"}
          {isExpanded
            ? <ChevronUp aria-hidden="true" className="w-4 h-4 ml-1" />
            : <ChevronDown aria-hidden="true" className="w-4 h-4 ml-1" />
          }
        </button>
      </div>

      {isExpanded && (
        <div id={`clause-${risk.id}`} role="region" aria-label="Original contract clause" className="bg-black/50 border-t border-[#333333] p-4 space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Original Clause</p>
            <div className="font-mono text-xs text-gray-500 whitespace-pre-wrap leading-relaxed">
              {risk.originalText}
            </div>
          </div>
          {risk.industryStandard && (
            <div>
              <p className="text-xs font-semibold text-green-400 mb-1 uppercase tracking-wider">Industry Standard</p>
              <p className="text-xs text-green-300/70 leading-relaxed">{risk.industryStandard}</p>
            </div>
          )}
        </div>
      )}
    </article>
  );
});

/**
 * MetricBar displays a single risk metric as a labeled progress bar
 * with color-coded scoring (green/amber/red).
 */
export const MetricBar = memo(function MetricBar({ label, score }: { label: string; score: number }) {
  const getColor = (s: number) => {
    if (s >= 80) return "bg-green-500";
    if (s >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  const getTextColor = (s: number) => {
    if (s >= 80) return "text-green-500";
    if (s >= 60) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className="flex items-center justify-between py-2" role="meter" aria-label={label} aria-valuenow={score} aria-valuemin={0} aria-valuemax={100}>
      <span className="text-sm text-gray-300 w-48">{label}</span>
      <div className="flex-1 mx-4 h-2 bg-[#333333] rounded-full overflow-hidden" aria-hidden="true">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${getColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`text-sm font-bold w-12 text-right ${getTextColor(score)}`}>{score}%</span>
    </div>
  );
});

/**
 * ScoreCircle renders an animated SVG circular gauge
 * showing the overall contract safety score (0-100).
 */
export const ScoreCircle = memo(function ScoreCircle({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return "#22c55e";
    if (s >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const getLabel = (s: number) => {
    if (s >= 80) return "Low Risk";
    if (s >= 60) return "Moderate";
    return "High Risk";
  };

  return (
    <div className="flex flex-col items-center" role="meter" aria-label="Overall contract safety score" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100}>
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#333333" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="54" fill="none"
            stroke={getColor(score)} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{score}</span>
          <span className="text-xs text-gray-400">/ 100</span>
        </div>
      </div>
      <span className="text-sm font-semibold mt-2" style={{ color: getColor(score) }}>{getLabel(score)}</span>
    </div>
  );
});
