

# Chiller Annual Risk Scoring & Auto-Flag Logic Implementation

## Overview

This plan implements a weighted risk scoring system for the Annual Chiller Maintenance module with automatic risk level assignment, recommended actions, and red flag triggers. The logic will be implemented as a service that can be called from both frontend (real-time preview) and potentially as a database trigger for persistence.

---

## Risk Scoring Weights

| Condition | Points | Database Field(s) |
|-----------|--------|-------------------|
| Refrigerant Leak Detected | +25 | `chiller_refrigerant_inspection.leak_detected = true` |
| Tube Plugs Above Limit | +30 | `chiller_tube_inspection.plugged_pct > manufacturer_limit` |
| Oil Acid Test Fail | +30 | `chiller_oil_analysis.acid_number_mgkoh_g > 0.05` |
| Voltage Imbalance >2% | +20 | `chiller_electrical_check.voltage_imbalance_pct > 2.0` |
| kW/ton YoY Degradation >10% | +15 | Compare current vs prior year `kw_per_ton` |

---

## Risk Level Thresholds

| Score Range | Level | Color | Code |
|-------------|-------|-------|------|
| 0 - 30 | Green (Low) | #10B981 | `low` |
| 31 - 60 | Yellow (Medium) | #F59E0B | `medium` |
| 61 - 100 | Red (High/Critical) | #EF4444 | `high` or `critical` |

---

## Calculation Formulas

### 1. Plug Percentage (plugged_pct)

```text
INPUT:
  tubes_plugged_total: int (e.g., 12)
  tube_count_total: int (e.g., 400)

CALCULATION:
  IF tube_count_total > 0 THEN
    plugged_pct = (tubes_plugged_total / tube_count_total) * 100
  ELSE
    plugged_pct = 0

EXAMPLE:
  tubes_plugged_total = 12
  tube_count_total = 400
  plugged_pct = (12 / 400) * 100 = 3.0%

MANUFACTURER LIMIT:
  Default threshold: 5% (configurable per chiller model)
  Trane CVHE: 5%
  Carrier 30HXC: 5%
  York YK: 6%
```

### 2. Voltage Imbalance Percentage (voltage_imbalance_pct)

```text
INPUT:
  voltage_l1_l2: numeric (e.g., 460.5)
  voltage_l2_l3: numeric (e.g., 458.0)
  voltage_l3_l1: numeric (e.g., 455.2)

CALCULATION:
  avg_voltage = (voltage_l1_l2 + voltage_l2_l3 + voltage_l3_l1) / 3
  max_deviation = MAX(
    ABS(voltage_l1_l2 - avg_voltage),
    ABS(voltage_l2_l3 - avg_voltage),
    ABS(voltage_l3_l1 - avg_voltage)
  )
  voltage_imbalance_pct = (max_deviation / avg_voltage) * 100

EXAMPLE:
  voltages = [460.5, 458.0, 455.2]
  avg_voltage = 457.9
  max_deviation = |460.5 - 457.9| = 2.6
  voltage_imbalance_pct = (2.6 / 457.9) * 100 = 0.57%
  
  Result: 0.57% < 2% threshold → NO penalty points
```

### 3. Tons Actual (derived if not entered directly)

```text
INPUT:
  chw_delta_t_f: numeric (e.g., 10.5°F)
  chw_flow_gpm: numeric (e.g., 2400 GPM)

CALCULATION:
  tons_actual = (chw_flow_gpm * chw_delta_t_f * 8.33 * 60) / 12000
  
  Simplified:
  tons_actual = chw_flow_gpm * chw_delta_t_f * 0.04165

EXAMPLE:
  chw_delta_t_f = 10.5
  chw_flow_gpm = 2400
  tons_actual = 2400 * 10.5 * 0.04165 = 1049.6 tons

ALTERNATE (if direct measurement):
  tons_actual can be entered directly from chiller display
```

### 4. kW per Ton (kw_per_ton)

```text
INPUT:
  kw_input: numeric (e.g., 580 kW)
  tons_actual: numeric (e.g., 1049.6 tons)

CALCULATION:
  IF tons_actual > 0 THEN
    kw_per_ton = kw_input / tons_actual
  ELSE
    kw_per_ton = NULL (cannot calculate)

EXAMPLE:
  kw_input = 580
  tons_actual = 1049.6
  kw_per_ton = 580 / 1049.6 = 0.553 kW/ton
```

### 5. Year-over-Year Efficiency Degradation

```text
INPUT:
  current_year_kw_per_ton: numeric (e.g., 0.553)
  prior_year_kw_per_ton: numeric (e.g., 0.520) -- from same equipment's prior year PM

DETECTION RULE:
  1. Query prior year's performance test for same equipment_id
  2. Get prior_year.kw_per_ton

CALCULATION:
  IF prior_year_kw_per_ton EXISTS AND prior_year_kw_per_ton > 0 THEN
    efficiency_variance_pct = ((current_kw_per_ton - prior_year_kw_per_ton) / prior_year_kw_per_ton) * 100
    degradation_since_last_year_pct = efficiency_variance_pct
  ELSE
    degradation_since_last_year_pct = NULL (no prior data)

TRIGGER CONDITION:
  IF degradation_since_last_year_pct > 10.0 THEN
    add +15 points to risk score

EXAMPLE:
  current_kw_per_ton = 0.553
  prior_year_kw_per_ton = 0.520
  degradation = ((0.553 - 0.520) / 0.520) * 100 = 6.35%
  
  Result: 6.35% < 10% threshold → NO penalty points

EXAMPLE 2 (degraded):
  current_kw_per_ton = 0.600
  prior_year_kw_per_ton = 0.520
  degradation = ((0.600 - 0.520) / 0.520) * 100 = 15.38%
  
  Result: 15.38% > 10% threshold → ADD +15 points
```

---

## Complete Risk Scoring Algorithm

```text
FUNCTION calculateChillerRiskScore(pm: AnnualChillerPMComplete) -> RiskResult:
  
  total_score = 0
  red_flags = []
  findings_to_create = []

  // === REFRIGERANT CHECK (+25) ===
  IF pm.refrigerant_inspection.leak_detected = TRUE THEN
    total_score += 25
    red_flags.push("REFRIGERANT_LEAK")
    findings_to_create.push({
      issue_code: "REF002",
      severity: "high",
      recommended_action: "REPAIR"
    })
  END IF

  // === TUBE INSPECTION CHECK (+30) ===
  FOR EACH tube_inspection IN pm.tube_inspections:
    plugged_pct = calculatePluggedPct(tube_inspection)
    manufacturer_limit = getManufacturerLimit(pm.chiller_model) // default 5%
    
    IF plugged_pct > manufacturer_limit THEN
      total_score += 30
      red_flags.push("TUBE_PLUGS_EXCEEDED")
      findings_to_create.push({
        issue_code: "TUBE003",
        severity: "high",
        recommended_action: "REPAIR"
      })
      BREAK  // Only count once even if both evap/cond exceed
    END IF
  END FOR

  // === OIL ACID CHECK (+30) ===
  IF pm.oil_analysis EXISTS THEN
    acid_threshold = 0.05  // mg KOH/g for POE oil (adjust for mineral)
    
    IF pm.oil_analysis.acid_number_mgkoh_g > acid_threshold THEN
      total_score += 30
      red_flags.push("OIL_ACID_FAIL")
      findings_to_create.push({
        issue_code: "OIL002",
        severity: "high",
        recommended_action: "HIGH_RISK"
      })
    END IF
  END IF

  // === ELECTRICAL CHECK (+20) ===
  FOR EACH electrical_check IN pm.electrical_checks:
    IF electrical_check.component = 'main_motor' THEN
      IF electrical_check.voltage_imbalance_pct > 2.0 THEN
        total_score += 20
        red_flags.push("VOLTAGE_IMBALANCE")
        findings_to_create.push({
          issue_code: "ELEC001",
          severity: "medium",
          recommended_action: "MONITOR"
        })
      END IF
      BREAK  // Only check main motor
    END IF
  END FOR

  // === PERFORMANCE DEGRADATION CHECK (+15) ===
  IF pm.performance_test EXISTS THEN
    prior_year_pm = getPriorYearPM(pm.equipment_id, pm.inspection_year - 1)
    
    IF prior_year_pm.performance_test.kw_per_ton EXISTS THEN
      current_kw = pm.performance_test.kw_per_ton
      prior_kw = prior_year_pm.performance_test.kw_per_ton
      
      IF prior_kw > 0 THEN
        degradation_pct = ((current_kw - prior_kw) / prior_kw) * 100
        
        IF degradation_pct > 10.0 THEN
          total_score += 15
          red_flags.push("EFFICIENCY_DEGRADED")
          findings_to_create.push({
            issue_code: "PERF002",
            severity: "medium",
            recommended_action: "MONITOR"
          })
        END IF
      END IF
    END IF
  END IF

  // === DETERMINE RISK LEVEL ===
  IF total_score <= 30 THEN
    risk_level = "low"
  ELSE IF total_score <= 60 THEN
    risk_level = "medium"
  ELSE
    IF red_flags contains ["OIL_ACID_FAIL", "TUBE_PLUGS_EXCEEDED"] 
       OR total_score > 80 THEN
      risk_level = "critical"
    ELSE
      risk_level = "high"
    END IF
  END IF

  // === DETERMINE REQUIRES_IMMEDIATE_ACTION ===
  requires_immediate_action = (
    risk_level IN ["high", "critical"] 
    OR red_flags contains "REFRIGERANT_LEAK"
    OR red_flags contains "OIL_ACID_FAIL"
  )

  RETURN {
    overall_risk_score: MIN(total_score, 100),
    overall_risk_level: risk_level,
    requires_immediate_action: requires_immediate_action,
    red_flags: red_flags,
    auto_findings: findings_to_create
  }

END FUNCTION
```

---

## Recommended Action Rules

| Condition | Action Code | Display Text |
|-----------|-------------|--------------|
| Score 0-30, no red flags | `MONITOR` | "Continue monitoring per schedule" |
| Score 31-60, no critical red flags | `MONITOR_CLOSELY` | "Monitor closely, schedule follow-up" |
| Any single red flag (except acid) | `REPAIR` | "Schedule repair within 30 days" |
| Oil acid fail OR tube limit exceeded | `REPAIR_URGENT` | "Repair required within 14 days" |
| Score 61+ OR multiple red flags | `HIGH_RISK` | "Immediate attention required" |
| Refrigerant leak + acid fail | `CRITICAL` | "Critical - Take chiller offline for repair" |

```text
FUNCTION determineRecommendedAction(result: RiskResult) -> ActionRecommendation:
  
  flags = result.red_flags
  score = result.overall_risk_score
  
  // Critical combinations
  IF "REFRIGERANT_LEAK" IN flags AND "OIL_ACID_FAIL" IN flags THEN
    RETURN { code: "CRITICAL", text: "Critical - Take chiller offline for repair", priority: 1 }
  END IF
  
  // High risk with multiple issues
  IF LENGTH(flags) >= 2 OR score > 80 THEN
    RETURN { code: "HIGH_RISK", text: "Immediate attention required", priority: 2 }
  END IF
  
  // Urgent repair scenarios
  IF "OIL_ACID_FAIL" IN flags OR "TUBE_PLUGS_EXCEEDED" IN flags THEN
    RETURN { code: "REPAIR_URGENT", text: "Repair required within 14 days", priority: 3 }
  END IF
  
  // Standard repair
  IF LENGTH(flags) = 1 THEN
    RETURN { code: "REPAIR", text: "Schedule repair within 30 days", priority: 4 }
  END IF
  
  // Elevated monitoring
  IF score > 30 THEN
    RETURN { code: "MONITOR_CLOSELY", text: "Monitor closely, schedule follow-up in 90 days", priority: 5 }
  END IF
  
  // Normal
  RETURN { code: "MONITOR", text: "Continue monitoring per annual schedule", priority: 6 }

END FUNCTION
```

---

## Red Flag Triggers

| Trigger | Condition | Auto-Finding Code | Severity |
|---------|-----------|-------------------|----------|
| Refrigerant Leak | `leak_detected = true` | REF002 | critical |
| Repeated Leak (YoY) | Current + prior year both had leaks | REF002 | critical |
| Oil Acid Fail | `acid_number_mgkoh_g > 0.05` | OIL002 | high |
| Tube Plugs Exceeded | `plugged_pct > 5%` | TUBE003 | high |
| Tube Wall Loss Critical | `wall_loss_pct > 20%` | TUBE002 | high |
| Voltage Imbalance | `voltage_imbalance_pct > 2%` | ELEC001 | medium |
| Efficiency Degraded | `degradation_pct > 10%` | PERF002 | medium |
| Legionella Detected | `legionella_detected = true` | WTR004 | critical |
| Low Insulation Resistance | `insulation_resistance_megohms < 1` | ELEC003 | high |

---

## Example Calculations

### Example 1: Healthy Chiller

```text
INPUT:
  leak_detected: false
  tubes_plugged_total: 8, tube_count_total: 400 → plugged_pct = 2%
  acid_number_mgkoh_g: 0.02
  voltage_imbalance_pct: 0.8%
  kw_per_ton: 0.55, prior_year: 0.53 → degradation = 3.8%

SCORING:
  Refrigerant leak:     0 (no leak)
  Tube plugs:           0 (2% < 5%)
  Oil acid:             0 (0.02 < 0.05)
  Voltage imbalance:    0 (0.8% < 2%)
  Efficiency:           0 (3.8% < 10%)
  
  TOTAL SCORE: 0
  RISK LEVEL: low (Green)
  RECOMMENDED ACTION: MONITOR - "Continue monitoring per annual schedule"
  RED FLAGS: []
```

### Example 2: Medium Risk Chiller

```text
INPUT:
  leak_detected: false
  tubes_plugged_total: 30, tube_count_total: 400 → plugged_pct = 7.5%
  acid_number_mgkoh_g: 0.03
  voltage_imbalance_pct: 2.5%
  kw_per_ton: 0.60, prior_year: 0.52 → degradation = 15.4%

SCORING:
  Refrigerant leak:     0
  Tube plugs:          +30 (7.5% > 5%)
  Oil acid:             0
  Voltage imbalance:   +20 (2.5% > 2%)
  Efficiency:          +15 (15.4% > 10%)
  
  TOTAL SCORE: 65
  RISK LEVEL: high (Red)
  RECOMMENDED ACTION: HIGH_RISK - "Immediate attention required"
  RED FLAGS: [TUBE_PLUGS_EXCEEDED, VOLTAGE_IMBALANCE, EFFICIENCY_DEGRADED]
  REQUIRES_IMMEDIATE_ACTION: true
```

### Example 3: Critical Risk Chiller

```text
INPUT:
  leak_detected: true (shaft seal)
  tubes_plugged_total: 15, tube_count_total: 400 → plugged_pct = 3.75%
  acid_number_mgkoh_g: 0.08
  voltage_imbalance_pct: 1.2%
  kw_per_ton: 0.58, prior_year: 0.55 → degradation = 5.5%

SCORING:
  Refrigerant leak:    +25
  Tube plugs:           0 (3.75% < 5%)
  Oil acid:            +30 (0.08 > 0.05)
  Voltage imbalance:    0 (1.2% < 2%)
  Efficiency:           0 (5.5% < 10%)
  
  TOTAL SCORE: 55
  RISK LEVEL: critical (escalated due to leak + acid combo)
  RECOMMENDED ACTION: CRITICAL - "Critical - Take chiller offline for repair"
  RED FLAGS: [REFRIGERANT_LEAK, OIL_ACID_FAIL]
  REQUIRES_IMMEDIATE_ACTION: true
  
  AUTO-GENERATED FINDINGS:
    1. REF002 - Refrigerant Leak Detected (severity: critical)
    2. OIL002 - High Acid Number (severity: high)
```

---

## Implementation Files

| File | Purpose |
|------|---------|
| `src/services/chillerRiskCalculator.ts` | Core calculation logic (pure functions) |
| `src/hooks/useChillerRiskScore.ts` | React hook for real-time calculation |
| `src/types/chillerRisk.ts` | TypeScript interfaces for risk results |

---

## Technical Implementation

### New Types (`src/types/chillerRisk.ts`)

```typescript
interface RedFlag {
  code: 'REFRIGERANT_LEAK' | 'TUBE_PLUGS_EXCEEDED' | 'OIL_ACID_FAIL' | 
        'VOLTAGE_IMBALANCE' | 'EFFICIENCY_DEGRADED' | 'LEGIONELLA_DETECTED' |
        'LOW_INSULATION' | 'REPEATED_LEAK';
  description: string;
  issueCode: string;
  severity: 'medium' | 'high' | 'critical';
}

interface RiskCalculationResult {
  overallRiskScore: number;
  overallRiskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  requiresImmediateAction: boolean;
  redFlags: RedFlag[];
  recommendedAction: {
    code: string;
    text: string;
    priority: number;
  };
  autoFindings: Array<{
    issueCode: string;
    category: string;
    description: string;
    severity: string;
    recommendedAction: string;
  }>;
  scoreBreakdown: {
    refrigerantLeak: number;
    tubePlugs: number;
    oilAcid: number;
    voltageImbalance: number;
    efficiencyDegradation: number;
  };
}

interface ManufacturerLimits {
  tubePluggedPctLimit: number;
  oilAcidThreshold: number;
  voltageImbalanceThreshold: number;
  efficiencyDegradationThreshold: number;
}
```

### Service Implementation (`src/services/chillerRiskCalculator.ts`)

The service will include:
1. `calculatePluggedPct()` - Compute tube plug percentage
2. `calculateVoltageImbalance()` - Compute voltage imbalance from 3-phase readings
3. `calculateTonsActual()` - Derive tons from flow and delta-T
4. `calculateKwPerTon()` - Compute efficiency metric
5. `calculateEfficiencyDegradation()` - Compare YoY performance
6. `calculateChillerRiskScore()` - Main orchestrator function
7. `determineRecommendedAction()` - Map score to action
8. `getManufacturerLimits()` - Lookup model-specific thresholds

### Hook Implementation (`src/hooks/useChillerRiskScore.ts`)

```typescript
function useChillerRiskScore(pmId: string, equipmentId: string) {
  // Fetch current PM data
  // Fetch prior year PM data for YoY comparison
  // Calculate risk score in real-time
  // Return result with loading/error states
}
```

---

## Summary

| Component | Implementation |
|-----------|----------------|
| Risk Score Range | 0-100 (capped) |
| Risk Levels | low (0-30), medium (31-60), high/critical (61+) |
| Weighted Conditions | 5 primary triggers totaling up to 120 points |
| Auto-Findings | Generated from red flags with standardized issue codes |
| YoY Detection | Query prior year PM by equipment_id and inspection_year-1 |
| Manufacturer Limits | Configurable per chiller model with sensible defaults |

