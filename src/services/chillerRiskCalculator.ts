// Chiller Risk Calculator Service
// Implements weighted risk scoring, auto-flag logic, and recommended actions

import type {
  AnnualChillerPMComplete,
  ChillerTubeInspection,
  ChillerElectricalCheck,
  ChillerPerformanceTest,
} from '@/types/chillerAnnual';

import {
  type RedFlag,
  type RedFlagCode,
  type RiskLevel,
  type ActionRecommendation,
  type AutoFinding,
  type RiskCalculationResult,
  type ManufacturerLimits,
  type ScoreBreakdown,
  DEFAULT_MANUFACTURER_LIMITS,
  MANUFACTURER_LIMITS_BY_MODEL,
  RISK_WEIGHTS,
  RISK_THRESHOLDS,
} from '@/types/chillerRisk';

// ============================================
// CALCULATION HELPERS
// ============================================

/**
 * Calculate tube plug percentage
 * Formula: (tubes_plugged_total / tube_count_total) * 100
 */
export function calculatePluggedPct(
  tubesPluggedTotal: number | null | undefined,
  tubeCountTotal: number | null | undefined
): number {
  if (!tubeCountTotal || tubeCountTotal <= 0) return 0;
  if (!tubesPluggedTotal) return 0;
  return (tubesPluggedTotal / tubeCountTotal) * 100;
}

/**
 * Calculate voltage imbalance percentage using NEMA standard
 * Formula: (max_deviation / avg_voltage) * 100
 */
export function calculateVoltageImbalance(
  voltageL1L2: number | null | undefined,
  voltageL2L3: number | null | undefined,
  voltageL3L1: number | null | undefined
): number {
  if (!voltageL1L2 || !voltageL2L3 || !voltageL3L1) return 0;

  const avgVoltage = (voltageL1L2 + voltageL2L3 + voltageL3L1) / 3;
  if (avgVoltage <= 0) return 0;

  const maxDeviation = Math.max(
    Math.abs(voltageL1L2 - avgVoltage),
    Math.abs(voltageL2L3 - avgVoltage),
    Math.abs(voltageL3L1 - avgVoltage)
  );

  return (maxDeviation / avgVoltage) * 100;
}

/**
 * Calculate actual tonnage from flow and delta-T
 * Formula: chw_flow_gpm * chw_delta_t_f * 0.04165
 */
export function calculateTonsActual(
  chwFlowGpm: number | null | undefined,
  chwDeltaTF: number | null | undefined
): number | null {
  if (!chwFlowGpm || !chwDeltaTF) return null;
  return chwFlowGpm * chwDeltaTF * 0.04165;
}

/**
 * Calculate kW per ton efficiency
 * Formula: kw_input / tons_actual
 */
export function calculateKwPerTon(
  kwInput: number | null | undefined,
  tonsActual: number | null | undefined
): number | null {
  if (!kwInput || !tonsActual || tonsActual <= 0) return null;
  return kwInput / tonsActual;
}

/**
 * Calculate year-over-year efficiency degradation percentage
 * Formula: ((current_kw_per_ton - prior_kw_per_ton) / prior_kw_per_ton) * 100
 */
export function calculateEfficiencyDegradation(
  currentKwPerTon: number | null | undefined,
  priorKwPerTon: number | null | undefined
): number | null {
  if (!currentKwPerTon || !priorKwPerTon || priorKwPerTon <= 0) return null;
  return ((currentKwPerTon - priorKwPerTon) / priorKwPerTon) * 100;
}

/**
 * Get manufacturer-specific limits for a chiller model
 */
export function getManufacturerLimits(chillerModel: string | null | undefined): ManufacturerLimits {
  if (!chillerModel) return DEFAULT_MANUFACTURER_LIMITS;

  // Find matching model (partial match)
  for (const [model, limits] of Object.entries(MANUFACTURER_LIMITS_BY_MODEL)) {
    if (chillerModel.toLowerCase().includes(model.toLowerCase())) {
      return { ...DEFAULT_MANUFACTURER_LIMITS, ...limits };
    }
  }

  return DEFAULT_MANUFACTURER_LIMITS;
}

// ============================================
// RED FLAG DETECTION
// ============================================

function createRedFlag(
  code: RedFlagCode,
  description: string,
  issueCode: string,
  severity: 'medium' | 'high' | 'critical'
): RedFlag {
  return { code, description, issueCode, severity };
}

function createAutoFinding(
  issueCode: string,
  category: string,
  description: string,
  severity: string,
  recommendedAction: string
): AutoFinding {
  return { issueCode, category, description, severity, recommendedAction };
}

// ============================================
// MAIN RISK CALCULATION
// ============================================

export interface RiskCalculationInput {
  pm: AnnualChillerPMComplete;
  priorYearPerformance?: ChillerPerformanceTest | null;
  priorYearLeakDetected?: boolean;
}

/**
 * Calculate the complete risk score for a chiller annual PM
 */
export function calculateChillerRiskScore(input: RiskCalculationInput): RiskCalculationResult {
  const { pm, priorYearPerformance, priorYearLeakDetected } = input;
  const limits = getManufacturerLimits(pm.chiller_model);

  let totalScore = 0;
  const redFlags: RedFlag[] = [];
  const autoFindings: AutoFinding[] = [];
  const scoreBreakdown: ScoreBreakdown = {
    refrigerantLeak: 0,
    tubePlugs: 0,
    oilAcid: 0,
    voltageImbalance: 0,
    efficiencyDegradation: 0,
    legionella: 0,
    lowInsulation: 0,
    tubeWallLoss: 0,
  };

  // === REFRIGERANT LEAK CHECK (+25) ===
  if (pm.refrigerant_inspection?.leak_detected) {
    scoreBreakdown.refrigerantLeak = RISK_WEIGHTS.REFRIGERANT_LEAK;
    totalScore += RISK_WEIGHTS.REFRIGERANT_LEAK;

    // Check if this is a repeated leak (prior year also had leak)
    if (priorYearLeakDetected) {
      redFlags.push(
        createRedFlag(
          'REPEATED_LEAK',
          'Refrigerant leak detected in consecutive years',
          'REF003',
          'critical'
        )
      );
      autoFindings.push(
        createAutoFinding(
          'REF003',
          'refrigerant',
          'Repeated refrigerant leak detected - same equipment leaked in prior year inspection',
          'critical',
          'Immediate repair required; consider compressor replacement evaluation'
        )
      );
    } else {
      redFlags.push(
        createRedFlag(
          'REFRIGERANT_LEAK',
          `Refrigerant leak detected at ${pm.refrigerant_inspection.leak_location_code || 'unknown location'}`,
          'REF002',
          'high'
        )
      );
      autoFindings.push(
        createAutoFinding(
          'REF002',
          'refrigerant',
          `Refrigerant leak detected at ${pm.refrigerant_inspection.leak_location_code || 'unknown location'}`,
          'high',
          'Schedule leak repair within 30 days'
        )
      );
    }
  }

  // === TUBE INSPECTION CHECK (+30) ===
  if (pm.tube_inspections && pm.tube_inspections.length > 0) {
    let tubeIssueFound = false;

    for (const tubeInspection of pm.tube_inspections) {
      // Check plugged percentage
      const pluggedPct = tubeInspection.plugged_pct ?? calculatePluggedPct(
        tubeInspection.tubes_plugged_total,
        tubeInspection.tube_count_total
      );

      if (pluggedPct > limits.tubePluggedPctLimit && !tubeIssueFound) {
        scoreBreakdown.tubePlugs = RISK_WEIGHTS.TUBE_PLUGS_EXCEEDED;
        totalScore += RISK_WEIGHTS.TUBE_PLUGS_EXCEEDED;
        tubeIssueFound = true;

        redFlags.push(
          createRedFlag(
            'TUBE_PLUGS_EXCEEDED',
            `${tubeInspection.bundle_type} tube plug percentage (${pluggedPct.toFixed(1)}%) exceeds limit (${limits.tubePluggedPctLimit}%)`,
            'TUBE003',
            'high'
          )
        );
        autoFindings.push(
          createAutoFinding(
            'TUBE003',
            'tubes',
            `${tubeInspection.bundle_type} tubes: ${pluggedPct.toFixed(1)}% plugged exceeds ${limits.tubePluggedPctLimit}% manufacturer limit`,
            'high',
            'Schedule tube bundle replacement evaluation'
          )
        );
      }

      // Check wall loss percentage
      if (
        tubeInspection.wall_loss_pct &&
        tubeInspection.wall_loss_pct > limits.wallLossPctThreshold
      ) {
        scoreBreakdown.tubeWallLoss = RISK_WEIGHTS.TUBE_WALL_LOSS_CRITICAL;
        totalScore += RISK_WEIGHTS.TUBE_WALL_LOSS_CRITICAL;

        redFlags.push(
          createRedFlag(
            'TUBE_WALL_LOSS_CRITICAL',
            `${tubeInspection.bundle_type} tube wall loss (${tubeInspection.wall_loss_pct.toFixed(1)}%) exceeds critical threshold`,
            'TUBE002',
            'high'
          )
        );
        autoFindings.push(
          createAutoFinding(
            'TUBE002',
            'tubes',
            `${tubeInspection.bundle_type} tube wall loss at ${tubeInspection.wall_loss_pct.toFixed(1)}% - approaching failure threshold`,
            'high',
            'Consider tube bundle replacement within next maintenance cycle'
          )
        );
        break; // Only count once
      }
    }
  }

  // === OIL ACID CHECK (+30) ===
  if (pm.oil_analysis) {
    const acidNumber = pm.oil_analysis.acid_number_mgkoh_g;
    if (acidNumber && acidNumber > limits.oilAcidThreshold) {
      scoreBreakdown.oilAcid = RISK_WEIGHTS.OIL_ACID_FAIL;
      totalScore += RISK_WEIGHTS.OIL_ACID_FAIL;

      redFlags.push(
        createRedFlag(
          'OIL_ACID_FAIL',
          `Oil acid number (${acidNumber.toFixed(3)} mg KOH/g) exceeds threshold (${limits.oilAcidThreshold})`,
          'OIL002',
          'high'
        )
      );
      autoFindings.push(
        createAutoFinding(
          'OIL002',
          'oil',
          `High acid number detected: ${acidNumber.toFixed(3)} mg KOH/g (limit: ${limits.oilAcidThreshold})`,
          'high',
          'Oil change and system flush required within 14 days'
        )
      );
    }
  }

  // === ELECTRICAL CHECK (+20) ===
  if (pm.electrical_checks && pm.electrical_checks.length > 0) {
    // Find main motor check
    const mainMotorCheck = pm.electrical_checks.find(
      (ec) => ec.component === 'main_motor'
    );

    if (mainMotorCheck) {
      // Check voltage imbalance
      const voltageImbalance =
        mainMotorCheck.voltage_imbalance_pct ??
        calculateVoltageImbalance(
          mainMotorCheck.voltage_l1_l2,
          mainMotorCheck.voltage_l2_l3,
          mainMotorCheck.voltage_l3_l1
        );

      if (voltageImbalance > limits.voltageImbalanceThreshold) {
        scoreBreakdown.voltageImbalance = RISK_WEIGHTS.VOLTAGE_IMBALANCE;
        totalScore += RISK_WEIGHTS.VOLTAGE_IMBALANCE;

        redFlags.push(
          createRedFlag(
            'VOLTAGE_IMBALANCE',
            `Voltage imbalance (${voltageImbalance.toFixed(2)}%) exceeds ${limits.voltageImbalanceThreshold}% threshold`,
            'ELEC001',
            'medium'
          )
        );
        autoFindings.push(
          createAutoFinding(
            'ELEC001',
            'electrical',
            `Main motor voltage imbalance at ${voltageImbalance.toFixed(2)}% (limit: ${limits.voltageImbalanceThreshold}%)`,
            'medium',
            'Investigate power supply; monitor for motor heating'
          )
        );
      }

      // Check insulation resistance
      if (
        mainMotorCheck.insulation_resistance_megohms &&
        mainMotorCheck.insulation_resistance_megohms < limits.insulationResistanceMinMegohms
      ) {
        scoreBreakdown.lowInsulation = RISK_WEIGHTS.LOW_INSULATION;
        totalScore += RISK_WEIGHTS.LOW_INSULATION;

        redFlags.push(
          createRedFlag(
            'LOW_INSULATION',
            `Insulation resistance (${mainMotorCheck.insulation_resistance_megohms.toFixed(1)} MΩ) below minimum`,
            'ELEC003',
            'high'
          )
        );
        autoFindings.push(
          createAutoFinding(
            'ELEC003',
            'electrical',
            `Low insulation resistance: ${mainMotorCheck.insulation_resistance_megohms.toFixed(1)} MΩ (min: ${limits.insulationResistanceMinMegohms} MΩ)`,
            'high',
            'Schedule motor inspection; potential motor failure risk'
          )
        );
      }
    }
  }

  // === PERFORMANCE DEGRADATION CHECK (+15) ===
  if (pm.performance_test && priorYearPerformance) {
    const currentKwPerTon =
      pm.performance_test.kw_per_ton ??
      calculateKwPerTon(pm.performance_test.kw_input, pm.performance_test.tons_actual);

    const priorKwPerTon =
      priorYearPerformance.kw_per_ton ??
      calculateKwPerTon(priorYearPerformance.kw_input, priorYearPerformance.tons_actual);

    const degradation = calculateEfficiencyDegradation(currentKwPerTon, priorKwPerTon);

    if (degradation !== null && degradation > limits.efficiencyDegradationThreshold) {
      scoreBreakdown.efficiencyDegradation = RISK_WEIGHTS.EFFICIENCY_DEGRADED;
      totalScore += RISK_WEIGHTS.EFFICIENCY_DEGRADED;

      redFlags.push(
        createRedFlag(
          'EFFICIENCY_DEGRADED',
          `Efficiency degraded ${degradation.toFixed(1)}% year-over-year (threshold: ${limits.efficiencyDegradationThreshold}%)`,
          'PERF002',
          'medium'
        )
      );
      autoFindings.push(
        createAutoFinding(
          'PERF002',
          'performance',
          `kW/ton increased ${degradation.toFixed(1)}% compared to prior year (${priorKwPerTon?.toFixed(3)} → ${currentKwPerTon?.toFixed(3)})`,
          'medium',
          'Investigate efficiency loss; check approach temperatures and tube fouling'
        )
      );
    }
  }

  // === WATER QUALITY - LEGIONELLA CHECK (+40) ===
  if (pm.water_quality_records && pm.water_quality_records.length > 0) {
    const legionellaFound = pm.water_quality_records.some((wq) => wq.legionella_detected);

    if (legionellaFound) {
      scoreBreakdown.legionella = RISK_WEIGHTS.LEGIONELLA_DETECTED;
      totalScore += RISK_WEIGHTS.LEGIONELLA_DETECTED;

      redFlags.push(
        createRedFlag(
          'LEGIONELLA_DETECTED',
          'Legionella bacteria detected in water system',
          'WTR004',
          'critical'
        )
      );
      autoFindings.push(
        createAutoFinding(
          'WTR004',
          'water_quality',
          'Legionella bacteria detected - immediate remediation required per ASHRAE 188',
          'critical',
          'Implement emergency disinfection protocol; notify building management'
        )
      );
    }
  }

  // === DETERMINE RISK LEVEL ===
  const overallRiskLevel = determineRiskLevel(totalScore, redFlags);

  // === DETERMINE REQUIRES IMMEDIATE ACTION ===
  const requiresImmediateAction = determineRequiresImmediateAction(overallRiskLevel, redFlags);

  // === DETERMINE RECOMMENDED ACTION ===
  const recommendedAction = determineRecommendedAction(totalScore, redFlags);

  return {
    overallRiskScore: Math.min(totalScore, 100),
    overallRiskLevel,
    requiresImmediateAction,
    redFlags,
    recommendedAction,
    autoFindings,
    scoreBreakdown,
  };
}

/**
 * Determine risk level from score and red flags
 */
function determineRiskLevel(score: number, redFlags: RedFlag[]): RiskLevel {
  if (score === 0 && redFlags.length === 0) {
    return 'none';
  }

  if (score <= RISK_THRESHOLDS.LOW_MAX) {
    return 'low';
  }

  if (score <= RISK_THRESHOLDS.MEDIUM_MAX) {
    return 'medium';
  }

  // Score > 60 = high or critical
  // Escalate to critical if:
  // 1. Score > 80, OR
  // 2. Multiple severe red flags present, OR
  // 3. Specific critical combinations
  const hasOilAcidFail = redFlags.some((f) => f.code === 'OIL_ACID_FAIL');
  const hasTubePlugsExceeded = redFlags.some((f) => f.code === 'TUBE_PLUGS_EXCEEDED');
  const hasRefrigerantLeak = redFlags.some((f) => f.code === 'REFRIGERANT_LEAK');
  const hasLegionella = redFlags.some((f) => f.code === 'LEGIONELLA_DETECTED');
  const hasRepeatedLeak = redFlags.some((f) => f.code === 'REPEATED_LEAK');

  if (
    score > 80 ||
    (hasOilAcidFail && hasTubePlugsExceeded) ||
    (hasRefrigerantLeak && hasOilAcidFail) ||
    hasLegionella ||
    hasRepeatedLeak
  ) {
    return 'critical';
  }

  return 'high';
}

/**
 * Determine if immediate action is required
 */
function determineRequiresImmediateAction(riskLevel: RiskLevel, redFlags: RedFlag[]): boolean {
  if (riskLevel === 'high' || riskLevel === 'critical') {
    return true;
  }

  // Specific red flags that always require immediate action
  const immediateFlags: RedFlagCode[] = [
    'REFRIGERANT_LEAK',
    'OIL_ACID_FAIL',
    'LEGIONELLA_DETECTED',
    'REPEATED_LEAK',
  ];

  return redFlags.some((f) => immediateFlags.includes(f.code));
}

/**
 * Determine recommended action based on score and red flags
 */
function determineRecommendedAction(score: number, redFlags: RedFlag[]): ActionRecommendation {
  const flagCodes = redFlags.map((f) => f.code);

  // Critical combinations
  if (
    (flagCodes.includes('REFRIGERANT_LEAK') && flagCodes.includes('OIL_ACID_FAIL')) ||
    flagCodes.includes('LEGIONELLA_DETECTED') ||
    flagCodes.includes('REPEATED_LEAK')
  ) {
    return {
      code: 'CRITICAL',
      text: 'Critical - Take chiller offline for repair',
      priority: 1,
    };
  }

  // High risk with multiple issues
  if (redFlags.length >= 2 || score > 80) {
    return {
      code: 'HIGH_RISK',
      text: 'Immediate attention required',
      priority: 2,
    };
  }

  // Urgent repair scenarios
  if (
    flagCodes.includes('OIL_ACID_FAIL') ||
    flagCodes.includes('TUBE_PLUGS_EXCEEDED') ||
    flagCodes.includes('LOW_INSULATION')
  ) {
    return {
      code: 'REPAIR_URGENT',
      text: 'Repair required within 14 days',
      priority: 3,
    };
  }

  // Standard repair
  if (redFlags.length === 1) {
    return {
      code: 'REPAIR',
      text: 'Schedule repair within 30 days',
      priority: 4,
    };
  }

  // Elevated monitoring
  if (score > 30) {
    return {
      code: 'MONITOR_CLOSELY',
      text: 'Monitor closely, schedule follow-up in 90 days',
      priority: 5,
    };
  }

  // Normal
  return {
    code: 'MONITOR',
    text: 'Continue monitoring per annual schedule',
    priority: 6,
  };
}
