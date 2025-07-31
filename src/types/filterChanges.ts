
import { Database } from "@/integrations/supabase/types";

export type FilterChangeStatus = 'active' | 'completed' | 'overdue';

export interface FilterChange {
  id: string;
  equipment_id: string;
  filter_type: string;
  filter_size: string;
  installation_date: string;
  due_date: string;
  technician_id: string | null;
  status: FilterChangeStatus;
  filter_condition: string | null;
  notes: string | null;
  location_id: string | null;
  created_at: string;
  updated_at: string;
  
  // Join data
  equipment?: {
    name: string;
    location: string;
  };
  technician?: {
    firstName: string;
    lastName: string;
  };
  
  // Calculated status from view
  status_calc?: 'overdue' | 'due_soon' | 'upcoming';
}

export interface FilterChangeFormValues {
  equipment_id: string;
  location_id: string;
  filter_type: string;
  filter_size: string;
  installation_date: Date;
  due_date: Date;
  technician_id: string | null;
  status: FilterChangeStatus;
  filter_condition: string | null;
  notes: string | null;
}
