
export interface SensorReadingsTable {
  Row: {
    id: string;
    equipment_id: string;
    timestamp_utc: string;
    sensor_type: string;
    value: number;
    unit: string;
    created_at: string;
  };
  Insert: {
    id?: string;
    equipment_id: string;
    timestamp_utc: string;
    sensor_type: string;
    value: number;
    unit: string;
    created_at?: string;
  };
  Update: {
    id?: string;
    equipment_id?: string;
    timestamp_utc?: string;
    sensor_type?: string;
    value?: number;
    unit?: string;
    created_at?: string;
  };
}

export interface PredictiveAlertsTable {
  Row: {
    id: string;
    asset_id: string;
    risk_level: "low" | "medium" | "high";
    finding: string;
    recommendation: string;
    confidence_score: number;
    created_at: string;
    resolved_at: string | null;
    work_order_id: string | null;
  };
  Insert: {
    id?: string;
    asset_id: string;
    risk_level: "low" | "medium" | "high";
    finding: string;
    recommendation: string;
    confidence_score: number;
    created_at?: string;
    resolved_at?: string | null;
    work_order_id?: string | null;
  };
  Update: {
    id?: string;
    asset_id?: string;
    risk_level?: "low" | "medium" | "high";
    finding?: string;
    recommendation?: string;
    confidence_score?: number;
    created_at?: string;
    resolved_at?: string | null;
    work_order_id?: string | null;
  };
}

export interface EquipmentThresholdsTable {
  Row: {
    id: string;
    equipment_id: string;
    sensor_type: string;
    warning_threshold: number;
    critical_threshold: number;
    unit: string;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    equipment_id: string;
    sensor_type: string;
    warning_threshold: number;
    critical_threshold: number;
    unit: string;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    equipment_id?: string;
    sensor_type?: string;
    warning_threshold?: number;
    critical_threshold?: number;
    unit?: string;
    created_at?: string;
    updated_at?: string;
  };
}
