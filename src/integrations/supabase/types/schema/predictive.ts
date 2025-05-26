
export interface AutomatedWorkOrdersTable {
  Row: {
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
  };
  Insert: {
    id?: string;
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    status?: "pending" | "assigned" | "in_progress" | "completed" | "cancelled";
    equipment_id: string;
    alert_id?: string | null;
    assigned_technician_id?: string | null;
    due_date: string;
    created_at?: string;
    completed_at?: string | null;
  };
  Update: {
    id?: string;
    title?: string;
    description?: string;
    priority?: "low" | "medium" | "high";
    status?: "pending" | "assigned" | "in_progress" | "completed" | "cancelled";
    equipment_id?: string;
    alert_id?: string | null;
    assigned_technician_id?: string | null;
    due_date?: string;
    created_at?: string;
    completed_at?: string | null;
  };
}
