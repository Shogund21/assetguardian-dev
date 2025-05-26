
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      maintenance_check_status: "completed" | "pending" | "issue_found";
      risk_level: "low" | "medium" | "high";
      work_order_status: "pending" | "assigned" | "in_progress" | "completed" | "cancelled";
    };
    CompositeTypes: Record<string, never>;
  };
}
