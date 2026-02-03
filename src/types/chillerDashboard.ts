// Types for Chiller Annuals Dashboard and Executive Reporting

export interface ChillerFleetHealth {
  totalChillers: number;
  averageHealthScore: number;
  highRiskCount: number;
  noRedundancyRiskCount: number;
  nextInspectionDue: string | null;
}

export interface ChillerHealthScore {
  equipmentId: string;
  equipmentName: string;
  location: string;
  model: string | null;
  healthScore: number;
  riskLevel: string | null;
  lastInspection: string;
  priorYearScore: number | null;
  trend: 'improving' | 'declining' | 'stable' | 'new';
}

export interface TubeLossTrendData {
  year: number;
  equipmentId: string;
  equipmentName: string;
  evaporatorPluggedPct: number | null;
  condenserPluggedPct: number | null;
  evaporatorWallLossPct: number | null;
  condenserWallLossPct: number | null;
}

export interface RefrigerantTrendData {
  year: number;
  equipmentId: string;
  equipmentName: string;
  addedLbs: number;
  recoveredLbs: number;
  netLossLbs: number;
  leakDetected: boolean;
  leakLocation: string | null;
}

export interface LeakHeatmapCell {
  location: string;
  leakLocationCode: string;
  leakLocationLabel: string;
  leakCount: number;
  totalInspections: number;
  intensity: number; // 0-1 calculated
}

export interface EfficiencyTrendData {
  year: number;
  equipmentId: string;
  equipmentName: string;
  kwPerTon: number | null;
  designKwPerTon: number | null;
  degradationPct: number | null;
  loadPct: number | null;
  meetsDesignEfficiency: boolean | null;
}

export interface HighRiskAsset {
  id: string;
  equipmentId: string;
  name: string;
  location: string;
  model: string | null;
  riskScore: number;
  riskLevel: string;
  redFlags: string[];
  hasBackup: boolean;
  lastInspection: string;
  estimatedRepairCost: number | null;
  openFindingsCount: number;
}

export interface VendorAccountability {
  vendorId: string | null;
  vendorName: string;
  totalFindings: number;
  findingsResolved: number;
  findingsOpen: number;
  avgResolutionDays: number | null;
  estimatedCostTotal: number;
  actualCostTotal: number;
  resolutionRate: number;
  topCategories: string[];
}

// Executive Report Types
export interface ExecutiveSummary {
  reportTitle: string;
  reportDate: string;
  reportPeriod: string;
  
  fleetSnapshot: {
    totalChillers: number;
    averageHealthScore: number;
    criticalAssets: number;
    noRedundancyRisk: number;
  };
  
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  
  criticalAlerts: CriticalAlert[];
  keyFindings: KeyFinding[];
  capitalRecommendations: CapitalRecommendations;
  riskMitigationNote: string;
  vendorPerformance: VendorPerformanceSummary[];
}

export interface CriticalAlert {
  assetName: string;
  location: string;
  riskScore: number;
  redFlags: string[];
  hasBackup: boolean;
  businessImpact: string;
}

export interface KeyFinding {
  priority: number;
  assetName: string;
  summary: string;
  details: string;
}

export interface CapitalRecommendation {
  asset: string;
  description: string;
  cost: number;
}

export interface CapitalRecommendations {
  immediate: CapitalRecommendation[];
  nearTerm: CapitalRecommendation[];
  longTerm: CapitalRecommendation[];
  totalInvestment: number;
}

export interface VendorPerformanceSummary {
  vendorName: string;
  findingsCount: number;
  resolvedCount: number;
  resolutionRate: number;
}

// Sample data for demonstration
export const SAMPLE_CHILLER_DATA = {
  equipment: [
    { id: 'CH-001', name: 'Main Plant Chiller', location: 'Building A - Mechanical Room', model: 'Trane CVHE-800', hasBackup: true },
    { id: 'CH-002', name: 'Data Center Chiller', location: 'Building B - Roof', model: 'York YK-500', hasBackup: false },
    { id: 'CH-003', name: 'Office Complex Chiller', location: 'Building C - Basement', model: 'Carrier 30HXC-600', hasBackup: true },
  ],
  annualPMs: [
    { equipmentId: 'CH-001', year: 2024, riskScore: 15, riskLevel: 'low', kwPerTon: 0.52, evapPluggedPct: 2.1, condPluggedPct: 1.8, leakDetected: false },
    { equipmentId: 'CH-001', year: 2025, riskScore: 25, riskLevel: 'low', kwPerTon: 0.54, evapPluggedPct: 2.5, condPluggedPct: 2.2, leakDetected: false },
    { equipmentId: 'CH-002', year: 2024, riskScore: 35, riskLevel: 'medium', kwPerTon: 0.58, evapPluggedPct: 4.2, condPluggedPct: 3.5, leakDetected: true, leakLocation: 'shaft_seal' },
    { equipmentId: 'CH-002', year: 2025, riskScore: 65, riskLevel: 'high', kwPerTon: 0.68, evapPluggedPct: 7.8, condPluggedPct: 5.2, leakDetected: true, leakLocation: 'suction_flange' },
    { equipmentId: 'CH-003', year: 2024, riskScore: 20, riskLevel: 'low', kwPerTon: 0.49, evapPluggedPct: 1.5, condPluggedPct: 1.2, leakDetected: false },
    { equipmentId: 'CH-003', year: 2025, riskScore: 45, riskLevel: 'medium', kwPerTon: 0.55, evapPluggedPct: 3.8, condPluggedPct: 2.8, leakDetected: false },
  ],
  refrigerant: [
    { equipmentId: 'CH-001', year: 2024, addedLbs: 25, recoveredLbs: 10, netLossLbs: 15 },
    { equipmentId: 'CH-001', year: 2025, addedLbs: 30, recoveredLbs: 15, netLossLbs: 15 },
    { equipmentId: 'CH-002', year: 2024, addedLbs: 85, recoveredLbs: 20, netLossLbs: 65 },
    { equipmentId: 'CH-002', year: 2025, addedLbs: 120, recoveredLbs: 25, netLossLbs: 95 },
    { equipmentId: 'CH-003', year: 2024, addedLbs: 15, recoveredLbs: 8, netLossLbs: 7 },
    { equipmentId: 'CH-003', year: 2025, addedLbs: 40, recoveredLbs: 12, netLossLbs: 28 },
  ],
  findings: [
    { equipmentId: 'CH-002', year: 2024, code: 'REF002', description: 'Refrigerant Leak', severity: 'high', status: 'resolved', estimatedCost: 4500 },
    { equipmentId: 'CH-002', year: 2025, code: 'REF002', description: 'Refrigerant Leak', severity: 'high', status: 'open', estimatedCost: 6200 },
    { equipmentId: 'CH-002', year: 2025, code: 'TUBE003', description: 'Tubes Exceeded Limit', severity: 'high', status: 'open', estimatedCost: 35000 },
    { equipmentId: 'CH-002', year: 2025, code: 'PERF002', description: 'Efficiency Degraded', severity: 'medium', status: 'open', estimatedCost: 8000 },
    { equipmentId: 'CH-003', year: 2025, code: 'OIL002', description: 'High Acid Number', severity: 'high', status: 'in_progress', estimatedCost: 3500 },
  ],
};
