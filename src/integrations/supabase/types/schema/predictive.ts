
export interface AutomatedWorkOrdersTable {
  Row: {
    id: string;
    asset_id: string;
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    status: "pending" | "assigned" | "in_progress" | "completed" | "cancelled";
    due_hours: number;
    assigned_team: string | null;
    created_at: string;
    assigned_at: string | null;
    completed_at: string | null;
    alert_id: string | null;
  };
  Insert: {
    id?: string;
    asset_id: string;
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    status?: "pending" | "assigned" | "in_progress" | "completed" | "cancelled";
    due_hours: number;
    assigned_team?: string | null;
    created_at?: string;
    assigned_at?: string | null;
    completed_at?: string | null;
    alert_id?: string | null;
  };
  Update: {
    id?: string;
    asset_id?: string;
    title?: string;
    description?: string;
    priority?: "low" | "medium" | "high";
    status?: "pending" | "assigned" | "in_progress" | "completed" | "cancelled";
    due_hours?: number;
    assigned_team?: string | null;
    created_at?: string;
    assigned_at?: string | null;
    completed_at?: string | null;
    alert_id?: string | null;
  };
  Relationships: [];
}
