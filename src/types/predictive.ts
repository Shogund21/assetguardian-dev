export interface SensorReading {
  id: string;
  equipment_id: string;
  timestamp_utc: string;
  sensor_type: string;
  value: number;
  unit: string;
  created_at: string;
  source?: 'manual' | 'maintenance_check';
  reading_mode?: string;
}

export interface PredictiveTimelineEvent {
  timeframe: string; // "7 days", "30 days", "90 days", "1 year"
  failure_probability: number; // 0-100
  predicted_date: string;
  component: string;
  failure_type: string;
  severity: "low" | "medium" | "high" | "critical";
  intervention_cost: number;
  downtime_hours: number;
}

export interface DegradationAnalysis {
  component: string;
  current_condition: number; // 0-100 percentage
  degradation_rate: number; // percentage per month
  expected_life_remaining: number; // months
  replacement_threshold: number; // percentage
}

export interface MaintenanceWindow {
  window_start: string;
  window_end: string;
  window_type: "optimal" | "acceptable" | "critical";
  intervention_type: string;
  estimated_cost: number;
  estimated_hours: number;
  priority: number;
}

export interface PredictiveAlert {
  id: string;
  asset_id: string;
  risk_level: "low" | "medium" | "high";
  finding: string;
  recommendation: string;
  confidence_score: number;
  created_at: string;
  resolved_at: string | null;
  work_order_id: string | null;
  data_quality?: {
    manual_readings_count: number;
    standard_readings_count: number;
    coverage_assessment: string;
    reading_source_used?: 'auto' | 'manual' | 'standard';
  };
  equipment?: {
    name: string;
    location: string;
  };
  predictive_timeline?: PredictiveTimelineEvent[];
  degradation_analysis?: DegradationAnalysis[];
  maintenance_windows?: MaintenanceWindow[];
  performance_trends?: {
    efficiency_decline_rate: number;
    energy_consumption_increase: number;
    projected_failure_date: string;
  };
}

export interface EquipmentThreshold {
  id: string;
  equipment_id: string;
  sensor_type: string;
  warning_threshold: number;
  critical_threshold: number;
  unit: string;
}

export interface AutomatedWorkOrder {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "assigned" | "in_progress" | "completed" | "cancelled";
  equipment_id: string;
  alert_id: string | null;
  assigned_technician_id: string | null;
  due_date: string;
  created_at: string;
  completed_at: string | null;
  equipment?: {
    name: string;
    location: string;
  };
  technician?: {
    firstName: string;
    lastName: string;
  };
}

export interface AssetGuardianAIRequest {
  asset_id: string;
  asset_type: string;
  location: string;
  sensor_data: {
    timestamp_utc: string[];
    vibration_mm_s?: number[];
    bearing_temp_C?: number[];
    current_A?: number[];
    [key: string]: any;
  };
  thresholds: {
    [key: string]: number;
  };
  maintenance_history: Array<{
    date: string;
    type: string;
    notes: string;
    reading_mode?: string;
  }>;
}

export interface AssetGuardianAIResponse {
  asset_id: string;
  risk_level: "low" | "medium" | "high";
  finding: string;
  recommendation: string;
  create_work_order: boolean;
  confidence_score?: number;
  data_quality?: {
    manual_readings_count: number;
    standard_readings_count: number;
    coverage_assessment: string;
    reading_source_used?: 'auto' | 'manual' | 'standard';
  };
  predictive_timeline?: PredictiveTimelineEvent[];
  degradation_analysis?: DegradationAnalysis[];
  maintenance_windows?: MaintenanceWindow[];
  performance_trends?: {
    efficiency_decline_rate: number;
    energy_consumption_increase: number;
    projected_failure_date: string;
  };
  work_order?: {
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    due_hours: number;
    assigned_team: string;
  };
}
