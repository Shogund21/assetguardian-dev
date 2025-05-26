
import { EquipmentTable } from './equipment';
import { MaintenanceChecksTable } from './maintenance';
import { ProjectsTable } from './projects';
import { TechniciansTable } from './technicians';
import { SensorReadingsTable, PredictiveAlertsTable, EquipmentThresholdsTable } from './sensors';
import { AutomatedWorkOrdersTable } from './predictive';

export interface Database {
  public: {
    Tables: {
      equipment: EquipmentTable;
      hvac_maintenance_checks: MaintenanceChecksTable;
      projects: ProjectsTable;
      technicians: TechniciansTable;
      sensor_readings: SensorReadingsTable;
      predictive_alerts: PredictiveAlertsTable;
      equipment_thresholds: EquipmentThresholdsTable;
      automated_work_orders: AutomatedWorkOrdersTable;
      admin_users: {
        Row: {
          id: string;
          created_at: string;
          is_admin: boolean;
        };
        Insert: {
          id: string;
          created_at?: string;
          is_admin?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          is_admin?: boolean;
        };
        Relationships: [];
      };
      companies: {
        Row: {
          id: string;
          name: string;
          address: string;
          contact_email: string;
          contact_phone: string;
          logo_url: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          contact_email: string;
          contact_phone: string;
          logo_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          contact_email?: string;
          contact_phone?: string;
          logo_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      company_users: {
        Row: {
          id: string;
          company_id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          user_id: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          user_id?: string;
          role?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      filter_changes: {
        Row: {
          id: string;
          equipment_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          equipment_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          equipment_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      locations: {
        Row: {
          id: string;
          name: string;
          store_number: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          store_number?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          store_number?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      maintenance_documents: {
        Row: {
          id: string;
          check_id: string;
          file_name: string;
          file_url: string;
          file_type: string;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          check_id: string;
          file_name: string;
          file_url: string;
          file_type: string;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          check_id?: string;
          file_name?: string;
          file_url?: string;
          file_type?: string;
          uploaded_at?: string;
        };
        Relationships: [];
      };
      refactoring_rules: {
        Row: {
          id: string;
          name: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      filter_changes_view: {
        Row: {
          id: string;
          equipment_id: string;
          created_at: string;
        };
      };
    };
    Functions: {
      get_sensor_analysis: {
        Args: {
          p_equipment_id: string;
          p_hours?: number;
        };
        Returns: {
          sensor_type: string;
          latest_value: number;
          avg_value: number;
          min_value: number;
          max_value: number;
          reading_count: number;
          trend_direction: string;
          unit: string;
        }[];
      };
      check_threshold_violations: {
        Args: {
          p_equipment_id: string;
        };
        Returns: {
          sensor_type: string;
          current_value: number;
          warning_threshold: number;
          critical_threshold: number;
          violation_level: string;
          unit: string;
        }[];
      };
    };
    Enums: {
      maintenance_check_status: "completed" | "pending" | "issue_found";
      risk_level: "low" | "medium" | "high";
      work_order_status: "pending" | "assigned" | "in_progress" | "completed" | "cancelled";
    };
    CompositeTypes: Record<string, never>;
  };
}
