
export interface SensorReading {
  id: string;
  equipment_id: string;
  timestamp_utc: string;
  sensor_type: string;
  value: number;
  unit: string;
  created_at: string;
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
  }>;
}

export interface AssetGuardianAIResponse {
  asset_id: string;
  risk_level: "low" | "medium" | "high";
  finding: string;
  recommendation: string;
  create_work_order: boolean;
  work_order?: {
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    due_hours: number;
    assigned_team: string;
  };
}
