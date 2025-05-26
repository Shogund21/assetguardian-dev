
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
    Functions: Record<string, never>;
    Enums: {
      maintenance_check_status: "completed" | "pending" | "issue_found";
      risk_level: "low" | "medium" | "high";
      work_order_status: "pending" | "assigned" | "in_progress" | "completed" | "cancelled";
    };
    CompositeTypes: Record<string, never>;
  };
}
