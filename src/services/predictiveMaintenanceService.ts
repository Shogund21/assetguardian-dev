
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
          let equipment = null;
          
          try {
            const { data: equipmentData, error: equipmentError } = await supabase
              .from('equipment')
              .select('name, location')
              .eq('id', alert.asset_id)
              .single();

            if (!equipmentError && equipmentData) {
              equipment = equipmentData;
            }
          } catch (err) {
            console.warn(`Could not fetch equipment for alert ${alert.id}:`, err);
          }

          return {
            ...alert,
            equipment,
            // Cast JSONB fields to appropriate types
            data_quality: alert.data_quality as any,
            predictive_timeline: alert.predictive_timeline as any,
            degradation_analysis: alert.degradation_analysis as any,
            maintenance_windows: alert.maintenance_windows as any,
            performance_trends: alert.performance_trends as any,
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
      
      // Map database records to SensorReading interface with proper type casting
      return (data || []).map(record => ({
        ...record,
        source: (record.source === 'maintenance_check' ? 'maintenance_check' : 'manual') as 'manual' | 'maintenance_check'
      }));
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
    
    return {
      ...data,
      source: (data.source === 'maintenance_check' ? 'maintenance_check' : 'manual') as 'manual' | 'maintenance_check'
    };
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
    // Use the secure function to bypass RLS while maintaining security
    const { data, error } = await supabase.rpc('create_predictive_alert_secure', {
      p_asset_id: alert.asset_id,
      p_risk_level: alert.risk_level,
      p_finding: alert.finding,
      p_recommendation: alert.recommendation,
      p_confidence_score: alert.confidence_score,
      p_resolved_at: alert.resolved_at,
      p_work_order_id: alert.work_order_id,
      p_data_quality: alert.data_quality as any,
      p_predictive_timeline: alert.predictive_timeline as any,
      p_degradation_analysis: alert.degradation_analysis as any,
      p_maintenance_windows: alert.maintenance_windows as any,
      p_performance_trends: alert.performance_trends as any,
    });

    if (error) throw error;
    
    // Parse the JSONB result from the function
    const alertData = typeof data === 'string' ? JSON.parse(data) : data;
    
    return {
      id: alertData.id,
      asset_id: alertData.asset_id,
      risk_level: alertData.risk_level,
      finding: alertData.finding,
      recommendation: alertData.recommendation,
      confidence_score: alertData.confidence_score,
      created_at: alertData.created_at,
      resolved_at: alertData.resolved_at,
      work_order_id: alertData.work_order_id,
      equipment: null, // Will be populated separately if needed
      data_quality: alertData.data_quality as any,
      predictive_timeline: alertData.predictive_timeline as any,
      degradation_analysis: alertData.degradation_analysis as any,
      maintenance_windows: alertData.maintenance_windows as any,
      performance_trends: alertData.performance_trends as any
    } as PredictiveAlert;
  }

  static async createAutomatedWorkOrder(workOrder: Omit<AutomatedWorkOrder, 'id' | 'created_at'>): Promise<AutomatedWorkOrder> {
    const workOrderData = {
      asset_id: workOrder.equipment_id,
      title: workOrder.title,
      description: workOrder.description,
      priority: workOrder.priority,
      status: workOrder.status,
      due_hours: 24, // Default value
      assigned_team: workOrder.technician?.firstName + ' ' + workOrder.technician?.lastName,
      alert_id: workOrder.alert_id,
    };

    const { data, error } = await supabase
      .from('automated_work_orders')
      .insert([workOrderData])
      .select()
      .single();

    if (error) throw error;
    
    // Map the database response back to AutomatedWorkOrder interface
    return {
      id: data.id,
      equipment_id: data.asset_id,
      title: data.title,
      description: data.description,
      priority: data.priority as 'low' | 'medium' | 'high',
      status: data.status as 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled',
      due_date: new Date(Date.now() + data.due_hours * 60 * 60 * 1000).toISOString(),
      assigned_technician_id: null, // Not implemented in database yet
      technician: workOrder.technician || null,
      created_at: data.created_at,
      alert_id: data.alert_id,
    } as AutomatedWorkOrder;
  }

  static async resolveAlert(alertId: string): Promise<void> {
    const { error } = await supabase
      .from('predictive_alerts')
      .update({ resolved_at: new Date().toISOString() })
      .eq('id', alertId);

    if (error) throw error;
  }
}
