
export type MaintenanceFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';

export interface MaintenanceTemplate {
  frequency: MaintenanceFrequency;
  equipmentType: string;
  requiredFields: string[];
  optionalFields: string[];
  estimatedTime: number; // in minutes
  description: string;
}

export interface TieredMaintenanceConfig {
  daily: MaintenanceTemplate;
  weekly: MaintenanceTemplate;
  monthly: MaintenanceTemplate;
  quarterly?: MaintenanceTemplate;
  annual?: MaintenanceTemplate;
}
