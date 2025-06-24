
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
  };
  equipment?: {
    name: string;
    location: string;
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
  };
  work_order?: {
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    due_hours: number;
    assigned_team: string;
  };
}
