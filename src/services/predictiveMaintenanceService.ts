import { supabase } from '@/integrations/supabase/client';
import { SensorReading, PredictiveAlert, EquipmentThreshold, AutomatedWorkOrder } from '@/types/predictive';

export class PredictiveMaintenanceService {
  static async getActivePredictiveAlerts(): Promise<PredictiveAlert[]> {
    try {
      console.log('Fetching active predictive alerts');
      
      // Check if predictive_alerts table exists
      const { data: tableExists } = await supabase
        .from('predictive_alerts')
        .select('id')
        .limit(1);

      // If table doesn't exist or is empty, return empty array
      if (!tableExists) {
        console.log('Predictive alerts table not found or empty');
        return [];
      }

      // First, get the alerts
      const { data: alerts, error: alertsError } = await supabase
        .from('predictive_alerts')
        .select('*')
        .is('resolved_at', null)
        .order('created_at', { ascending: false });

      if (alertsError) {
        console.error('Error fetching predictive alerts:', alertsError);
        throw alertsError;
      }

      if (!alerts || alerts.length === 0) {
        return [];
      }

      // Then, get equipment details separately for each alert
      const alertsWithEquipment = await Promise.all(
        alerts.map(async (alert) => {
          const { data: equipment, error: equipmentError } = await supabase
            .from('equipment')
            .select('name, location')
            .eq('id', alert.asset_id)
            .single();

          if (equipmentError) {
            console.warn(`Could not fetch equipment for alert ${alert.id}:`, equipmentError);
          }

          return {
            ...alert,
            equipment: equipment || null
          } as PredictiveAlert;
        })
      );

      return alertsWithEquipment;
    } catch (error) {
      console.error('Error fetching predictive alerts:', error);
      // Return empty array instead of throwing to prevent dashboard crashes
      return [];
    }
  }

  static async getRecentSensorReadings(equipmentId: string, hours: number = 24): Promise<SensorReading[]> {
    try {
      const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('sensor_readings')
        .select('*')
        .eq('equipment_id', equipmentId)
        .gte('timestamp_utc', cutoffTime)
        .order('timestamp_utc', { ascending: false });

      if (error) {
        console.error('Error fetching sensor readings:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error in getRecentSensorReadings:', error);
      return [];
    }
  }

  static async storeSensorReading(reading: Omit<SensorReading, 'id' | 'created_at'>): Promise<SensorReading> {
    const { data, error } = await supabase
      .from('sensor_readings')
      .insert([reading])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getEquipmentThresholds(equipmentId: string): Promise<EquipmentThreshold[]> {
    const { data, error } = await supabase
      .from('equipment_thresholds')
      .select('*')
      .eq('equipment_id', equipmentId);

    if (error) throw error;
    return data || [];
  }

  static async createPredictiveAlert(alert: Omit<PredictiveAlert, 'id' | 'created_at'>): Promise<PredictiveAlert> {
    const { data, error } = await supabase
      .from('predictive_alerts')
      .insert([alert])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async createAutomatedWorkOrder(workOrder: Omit<AutomatedWorkOrder, 'id' | 'created_at'>): Promise<AutomatedWorkOrder> {
    const { data, error } = await supabase
      .from('automated_work_orders')
      .insert([workOrder])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async resolveAlert(alertId: string): Promise<void> {
    const { error } = await supabase
      .from('predictive_alerts')
      .update({ resolved_at: new Date().toISOString() })
      .eq('id', alertId);

    if (error) throw error;
  }
}
