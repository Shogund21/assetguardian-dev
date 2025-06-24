
import { supabase } from '@/integrations/supabase/client';

export class DatabaseInitService {
  static async checkRequiredTables(): Promise<{
    predictiveAlerts: boolean;
    sensorReadings: boolean;
    equipmentThresholds: boolean;
    automatedWorkOrders: boolean;
    maintenanceFrequencyColumn: boolean;
  }> {
    const results = {
      predictiveAlerts: false,
      sensorReadings: false,
      equipmentThresholds: false,
      automatedWorkOrders: false,
      maintenanceFrequencyColumn: false,
    };

    try {
      // Check predictive_alerts table
      const { error: alertsError } = await supabase
        .from('predictive_alerts')
        .select('id')
        .limit(1);
      results.predictiveAlerts = !alertsError;

      // Check sensor_readings table
      const { error: sensorsError } = await supabase
        .from('sensor_readings')
        .select('id')
        .limit(1);
      results.sensorReadings = !sensorsError;

      // Check equipment_thresholds table
      const { error: thresholdsError } = await supabase
        .from('equipment_thresholds')
        .select('id')
        .limit(1);
      results.equipmentThresholds = !thresholdsError;

      // Check automated_work_orders table
      const { error: workOrdersError } = await supabase
        .from('automated_work_orders')
        .select('id')
        .limit(1);
      results.automatedWorkOrders = !workOrdersError;

      // Check maintenance_frequency column
      const { error: frequencyError } = await supabase
        .from('hvac_maintenance_checks')
        .select('maintenance_frequency')
        .limit(1);
      results.maintenanceFrequencyColumn = !frequencyError;

    } catch (error) {
      console.error('Error checking database tables:', error);
    }

    return results;
  }

  static async getSetupInstructions(): Promise<string[]> {
    const tableStatus = await this.checkRequiredTables();
    const instructions: string[] = [];

    if (!tableStatus.predictiveAlerts) {
      instructions.push('Run migration: 20241201000003_create_predictive_alerts.sql');
    }
    if (!tableStatus.sensorReadings) {
      instructions.push('Run migration: 20241201000001_create_sensor_readings.sql');
    }
    if (!tableStatus.equipmentThresholds) {
      instructions.push('Run migration: 20241201000002_create_equipment_thresholds.sql');
    }
    if (!tableStatus.automatedWorkOrders) {
      instructions.push('Run migration: 20241201000004_create_automated_work_orders.sql');
    }
    if (!tableStatus.maintenanceFrequencyColumn) {
      instructions.push('Run migration: 20241224000001_add_maintenance_frequency.sql');
    }

    if (instructions.length === 0) {
      instructions.push('All required database tables are present!');
    } else {
      instructions.unshift('Missing database components detected. Please run the following migrations in your Supabase project:');
    }

    return instructions;
  }
}
