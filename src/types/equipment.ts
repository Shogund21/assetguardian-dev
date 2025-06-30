
export interface Equipment {
  id: string;
  name: string;
  location: string;
  type?: string;
  status: string;
  serial_number?: string | null;
  model?: string | null;
  created_at: string;
  updated_at: string;
  company_id?: string | null;
  // Additional properties for UI functionality
  isSpecialLocation?: boolean;
  originalLocationId?: string;
  displayWarning?: boolean;
}

export interface EquipmentFormData {
  name: string;
  location: string;
  type: string;
  status: string;
  serial_number?: string;
  model?: string;
}
