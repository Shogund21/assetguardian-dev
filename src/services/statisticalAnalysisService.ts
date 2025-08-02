import { SensorReading } from '@/types/predictive';

export interface StatisticalBaseline {
  parameter: string;
  baseline_mean: number;
  standard_deviation: number;
  sample_size: number;
  last_updated: string;
  seasonal_factors: Record<string, number>;
}

export interface AnomalyDetection {
  parameter: string;
  current: number;
  baseline_mean: number;
  z_score: number;
  severity: 'low' | 'med' | 'high';
  is_anomaly: boolean;
  confidence: number;
}

export interface EquipmentProfiler {
  equipment_type: string;
  manufacturer: string;
  model?: string;
  typical_life_years: number;
  failure_modes: Array<{
    mode: string;
    probability: number;
    cost_range: [number, number];
    typical_symptoms: string[];
  }>;
  maintenance_intervals: Record<string, number>;
}

export class StatisticalAnalysisService {
  /**
   * Calculate 12-month baseline statistics for equipment parameters
   */
  static calculateBaselines(sensorReadings: SensorReading[]): Map<string, StatisticalBaseline> {
    const baselines = new Map<string, StatisticalBaseline>();
    
    // Group readings by sensor type
    const groupedReadings = sensorReadings.reduce((acc, reading) => {
      const key = reading.sensor_type;
      if (!acc[key]) acc[key] = [];
      acc[key].push(reading);
      return acc;
    }, {} as Record<string, SensorReading[]>);

    for (const [sensorType, readings] of Object.entries(groupedReadings)) {
      if (readings.length < 10) continue; // Need minimum sample size

      const values = readings.map(r => r.value);
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1);
      const stdDev = Math.sqrt(variance);

      // Calculate seasonal factors (simplified - by month)
      const seasonalFactors = this.calculateSeasonalFactors(readings);

      baselines.set(sensorType, {
        parameter: sensorType,
        baseline_mean: mean,
        standard_deviation: stdDev,
        sample_size: readings.length,
        last_updated: new Date().toISOString(),
        seasonal_factors: seasonalFactors
      });
    }

    return baselines;
  }

  /**
   * Detect anomalies using statistical z-score analysis
   */
  static detectAnomalies(
    currentReadings: SensorReading[], 
    baselines: Map<string, StatisticalBaseline>
  ): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];

    for (const reading of currentReadings) {
      const baseline = baselines.get(reading.sensor_type);
      if (!baseline) continue;

      // Apply seasonal adjustment
      const currentMonth = new Date(reading.timestamp_utc).getMonth();
      const seasonalFactor = baseline.seasonal_factors[currentMonth.toString()] || 1;
      const adjustedMean = baseline.baseline_mean * seasonalFactor;

      const zScore = (reading.value - adjustedMean) / baseline.standard_deviation;
      const absZScore = Math.abs(zScore);

      let severity: 'low' | 'med' | 'high' = 'low';
      let isAnomaly = false;

      if (absZScore >= 3) {
        severity = 'high';
        isAnomaly = true;
      } else if (absZScore >= 2) {
        severity = 'med';
        isAnomaly = true;
      } else if (absZScore >= 1.5) {
        severity = 'low';
        isAnomaly = true;
      }

      // Confidence based on sample size and z-score
      const confidence = Math.min(0.95, 0.5 + (baseline.sample_size / 100) + (absZScore / 10));

      anomalies.push({
        parameter: reading.sensor_type,
        current: reading.value,
        baseline_mean: adjustedMean,
        z_score: zScore,
        severity,
        is_anomaly: isAnomaly,
        confidence
      });
    }

    return anomalies;
  }

  /**
   * Get equipment-specific failure profile
   */
  static getEquipmentProfile(equipmentName: string, equipmentType: string): EquipmentProfiler {
    const name = equipmentName.toLowerCase();
    
    // Trane Chiller Profile (Mike Reyes specialty)
    if (name.includes('trane') && (name.includes('cvhe') || name.includes('cvhf') || equipmentType.toLowerCase().includes('chiller'))) {
      return {
        equipment_type: 'Trane CVHE/CVHF Chiller',
        manufacturer: 'Trane',
        model: name.includes('cvhe') ? 'CVHE' : 'CVHF',
        typical_life_years: 22,
        failure_modes: [
          { mode: 'bearing_failure', probability: 0.35, cost_range: [8000, 25000], typical_symptoms: ['high_vibration', 'bearing_temp_rise'] },
          { mode: 'compressor_failure', probability: 0.25, cost_range: [45000, 120000], typical_symptoms: ['high_current', 'pressure_anomaly'] },
          { mode: 'refrigerant_leak', probability: 0.20, cost_range: [3000, 15000], typical_symptoms: ['low_pressure', 'temperature_delta'] },
          { mode: 'control_system_failure', probability: 0.15, cost_range: [2000, 8000], typical_symptoms: ['erratic_operation', 'setpoint_deviation'] },
          { mode: 'heat_exchanger_fouling', probability: 0.05, cost_range: [5000, 20000], typical_symptoms: ['approach_temp_rise', 'efficiency_drop'] }
        ],
        maintenance_intervals: {
          'bearing_inspection': 6, // months
          'refrigerant_analysis': 12,
          'vibration_analysis': 3,
          'oil_analysis': 6,
          'condenser_cleaning': 6
        }
      };
    }

    // Generic AHU Profile
    if (equipmentType.toLowerCase().includes('ahu') || name.includes('ahu')) {
      return {
        equipment_type: 'Air Handling Unit',
        manufacturer: 'Generic',
        typical_life_years: 18,
        failure_modes: [
          { mode: 'motor_failure', probability: 0.30, cost_range: [2000, 12000], typical_symptoms: ['high_current', 'vibration', 'temperature'] },
          { mode: 'belt_failure', probability: 0.25, cost_range: [200, 800], typical_symptoms: ['belt_wear', 'slippage', 'noise'] },
          { mode: 'filter_clogging', probability: 0.20, cost_range: [100, 500], typical_symptoms: ['pressure_drop', 'airflow_reduction'] },
          { mode: 'damper_failure', probability: 0.15, cost_range: [500, 3000], typical_symptoms: ['airflow_imbalance', 'control_issues'] },
          { mode: 'coil_fouling', probability: 0.10, cost_range: [1000, 5000], typical_symptoms: ['temperature_delta', 'pressure_drop'] }
        ],
        maintenance_intervals: {
          'filter_change': 3,
          'belt_inspection': 6,
          'motor_inspection': 12,
          'coil_cleaning': 6
        }
      };
    }

    // Default Generic Equipment
    return {
      equipment_type: 'Generic HVAC Equipment',
      manufacturer: 'Unknown',
      typical_life_years: 15,
      failure_modes: [
        { mode: 'general_wear', probability: 0.60, cost_range: [1000, 10000], typical_symptoms: ['performance_degradation'] },
        { mode: 'component_failure', probability: 0.40, cost_range: [500, 5000], typical_symptoms: ['operational_issues'] }
      ],
      maintenance_intervals: {
        'general_inspection': 6,
        'preventive_maintenance': 12
      }
    };
  }

  /**
   * Calculate ROI for maintenance interventions
   */
  static calculateMaintenanceROI(
    interventionCost: number,
    failureCost: number,
    failureProbability: number,
    downtimeCost: number,
    downtimeHours: number
  ): { roi: number; paybackMonths: number; costAvoidance: number } {
    const totalFailureCost = failureCost + (downtimeCost * downtimeHours);
    const expectedFailureCost = totalFailureCost * failureProbability;
    const costAvoidance = expectedFailureCost - interventionCost;
    const roi = costAvoidance / interventionCost;
    const paybackMonths = interventionCost / (costAvoidance / 12);

    return {
      roi,
      paybackMonths: Math.max(0, paybackMonths),
      costAvoidance: Math.max(0, costAvoidance)
    };
  }

  /**
   * Calculate seasonal adjustment factors
   */
  private static calculateSeasonalFactors(readings: SensorReading[]): Record<string, number> {
    const monthlyAverages: Record<string, number[]> = {};
    
    // Group by month
    readings.forEach(reading => {
      const month = new Date(reading.timestamp_utc).getMonth().toString();
      if (!monthlyAverages[month]) monthlyAverages[month] = [];
      monthlyAverages[month].push(reading.value);
    });

    // Calculate monthly averages and seasonal factors
    const overallAverage = readings.reduce((sum, r) => sum + r.value, 0) / readings.length;
    const seasonalFactors: Record<string, number> = {};

    for (let month = 0; month < 12; month++) {
      const monthStr = month.toString();
      if (monthlyAverages[monthStr] && monthlyAverages[monthStr].length > 0) {
        const monthlyAvg = monthlyAverages[monthStr].reduce((sum, val) => sum + val, 0) / monthlyAverages[monthStr].length;
        seasonalFactors[monthStr] = monthlyAvg / overallAverage;
      } else {
        seasonalFactors[monthStr] = 1.0; // No seasonal adjustment if no data
      }
    }

    return seasonalFactors;
  }

  /**
   * Predict failure probability using Weibull distribution
   */
  static calculateWeibullFailureProbability(
    equipmentAge: number,
    equipmentProfile: EquipmentProfiler,
    currentCondition: number
  ): { probability: number; confidence: number } {
    // Simplified Weibull calculation
    const shape = 2.5; // Beta parameter for HVAC equipment
    const scale = equipmentProfile.typical_life_years; // Eta parameter
    
    // Condition factor (0-100% becomes 0.5-1.5 multiplier)
    const conditionFactor = 0.5 + (currentCondition / 100);
    const adjustedAge = equipmentAge / conditionFactor;
    
    const probability = 1 - Math.exp(-Math.pow(adjustedAge / scale, shape));
    const confidence = Math.min(0.95, 0.5 + (currentCondition / 200));
    
    return { probability: Math.max(0, Math.min(1, probability)), confidence };
  }
}