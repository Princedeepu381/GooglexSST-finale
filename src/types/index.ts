export type RiskSeverity = "High" | "Medium" | "Low";

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
