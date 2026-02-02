// Types for Chiller Risk Scoring & Auto-Flag Logic

export type RedFlagCode =
  | 'REFRIGERANT_LEAK'
  | 'TUBE_PLUGS_EXCEEDED'
  | 'OIL_ACID_FAIL'
  | 'VOLTAGE_IMBALANCE'
  | 'EFFICIENCY_DEGRADED'
  | 'LEGIONELLA_DETECTED'
  | 'LOW_INSULATION'
  | 'REPEATED_LEAK'
  | 'TUBE_WALL_LOSS_CRITICAL';

export type RiskLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

export type ActionCode =
  | 'MONITOR'
  | 'MONITOR_CLOSELY'
  | 'REPAIR'
  | 'REPAIR_URGENT'
  | 'HIGH_RISK'
  | 'CRITICAL';

export interface RedFlag {
  code: RedFlagCode;
  description: string;
  issueCode: string;
  severity: 'medium' | 'high' | 'critical';
}

export interface ActionRecommendation {
  code: ActionCode;
  text: string;
  priority: number;
}

export interface AutoFinding {
  issueCode: string;
  category: string;
  description: string;
  severity: string;
  recommendedAction: string;
}

export interface ScoreBreakdown {
  refrigerantLeak: number;
  tubePlugs: number;
  oilAcid: number;
  voltageImbalance: number;
  efficiencyDegradation: number;
  legionella: number;
  lowInsulation: number;
  tubeWallLoss: number;
}

export interface RiskCalculationResult {
  overallRiskScore: number;
  overallRiskLevel: RiskLevel;
  requiresImmediateAction: boolean;
  redFlags: RedFlag[];
  recommendedAction: ActionRecommendation;
  autoFindings: AutoFinding[];
  scoreBreakdown: ScoreBreakdown;
}

export interface ManufacturerLimits {
  tubePluggedPctLimit: number;
  oilAcidThreshold: number;
  voltageImbalanceThreshold: number;
  efficiencyDegradationThreshold: number;
  wallLossPctThreshold: number;
  insulationResistanceMinMegohms: number;
}

// Default thresholds per manufacturer/model
export const DEFAULT_MANUFACTURER_LIMITS: ManufacturerLimits = {
  tubePluggedPctLimit: 5.0,
  oilAcidThreshold: 0.05,
  voltageImbalanceThreshold: 2.0,
  efficiencyDegradationThreshold: 10.0,
  wallLossPctThreshold: 20.0,
  insulationResistanceMinMegohms: 1.0,
};

export const MANUFACTURER_LIMITS_BY_MODEL: Record<string, Partial<ManufacturerLimits>> = {
  'Trane CVHE': { tubePluggedPctLimit: 5.0 },
  'Carrier 30HXC': { tubePluggedPctLimit: 5.0 },
  'York YK': { tubePluggedPctLimit: 6.0 },
  'York YVAA': { tubePluggedPctLimit: 5.0 },
  'Daikin': { tubePluggedPctLimit: 5.0 },
};

// Risk scoring weights
export const RISK_WEIGHTS = {
  REFRIGERANT_LEAK: 25,
  TUBE_PLUGS_EXCEEDED: 30,
  OIL_ACID_FAIL: 30,
  VOLTAGE_IMBALANCE: 20,
  EFFICIENCY_DEGRADED: 15,
  LEGIONELLA_DETECTED: 40,
  LOW_INSULATION: 20,
  TUBE_WALL_LOSS_CRITICAL: 25,
} as const;

// Risk level thresholds
export const RISK_THRESHOLDS = {
  LOW_MAX: 30,
  MEDIUM_MAX: 60,
  // Above 60 is high/critical
} as const;

// Risk level colors (for UI)
export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  none: '#6B7280',    // gray-500
  low: '#10B981',     // green-500
  medium: '#F59E0B',  // amber-500
  high: '#EF4444',    // red-500
  critical: '#991B1B', // red-800
};
