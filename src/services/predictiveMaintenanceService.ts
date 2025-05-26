
import { supabase } from "@/integrations/supabase/client";
import { SensorReading, PredictiveAlert, AssetGuardianAIRequest, AssetGuardianAIResponse } from "@/types/predictive";

export class PredictiveMaintenanceService {
  
  /**
   * Store sensor reading data
   */
  static async storeSensorReading(reading: Omit<SensorReading, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('sensor_readings')
      .insert(reading)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  /**
   * Get recent sensor readings for equipment
   */
  static async getRecentSensorReadings(equipmentId: string, hours: number = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('sensor_readings')
      .select('*')
      .eq('equipment_id', equipmentId)
      .gte('timestamp_utc', since)
      .order('timestamp_utc', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  /**
   * Process AI analysis for equipment
   */
  static async processAIAnalysis(equipmentId: string): Promise<AssetGuardianAIResponse | null> {
    try {
      // Get equipment details
      const { data: equipment, error: equipmentError } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', equipmentId)
        .single();
      
      if (equipmentError || !equipment) {
        console.error('Equipment not found:', equipmentError);
        return null;
      }

      // Get recent sensor readings
      const sensorReadings = await this.getRecentSensorReadings(equipmentId, 72); // 3 days
      
      if (!sensorReadings || sensorReadings.length === 0) {
        console.log('No sensor data available for analysis');
        return null;
      }

      // Get equipment thresholds
      const { data: thresholds } = await supabase
        .from('equipment_thresholds')
        .select('*')
        .eq('equipment_id', equipmentId);

      // Get maintenance history
      const { data: maintenanceHistory } = await supabase
        .from('hvac_maintenance_checks')
        .select('check_date, notes, status')
        .eq('equipment_id', equipmentId)
        .order('check_date', { ascending: false })
        .limit(10);

      // Transform data for AI analysis
      const aiRequest: AssetGuardianAIRequest = this.prepareAIRequest(
        equipment,
        sensorReadings,
        thresholds || [],
        maintenanceHistory || []
      );

      // Call AI analysis (this would be replaced with actual AI service call)
      const aiResponse = await this.callAssetGuardianAI(aiRequest);
      
      return aiResponse;
    } catch (error) {
      console.error('Error processing AI analysis:', error);
      return null;
    }
  }

  /**
   * Prepare data for AI analysis
   */
  private static prepareAIRequest(
    equipment: any,
    sensorReadings: SensorReading[],
    thresholds: any[],
    maintenanceHistory: any[]
  ): AssetGuardianAIRequest {
    // Group sensor readings by type
    const sensorData: any = {
      timestamp_utc: sensorReadings.map(r => r.timestamp_utc)
    };

    // Group readings by sensor type
    const sensorTypes = [...new Set(sensorReadings.map(r => r.sensor_type))];
    sensorTypes.forEach(type => {
      const readings = sensorReadings.filter(r => r.sensor_type === type);
      sensorData[type] = readings.map(r => r.value);
    });

    // Prepare thresholds
    const thresholdMap: any = {};
    thresholds.forEach(t => {
      thresholdMap[`${t.sensor_type}_high`] = t.critical_threshold;
      thresholdMap[`${t.sensor_type}_warning`] = t.warning_threshold;
    });

    return {
      asset_id: equipment.id,
      asset_type: equipment.name || 'Unknown',
      location: equipment.location || 'Unknown',
      sensor_data: sensorData,
      thresholds: thresholdMap,
      maintenance_history: maintenanceHistory.map(m => ({
        date: m.check_date,
        type: 'Maintenance Check',
        notes: m.notes || ''
      }))
    };
  }

  /**
   * Call AssetGuardian AI service (mock implementation)
   */
  private static async callAssetGuardianAI(request: AssetGuardianAIRequest): Promise<AssetGuardianAIResponse> {
    // This is a mock implementation - in production, this would call your AI service
    console.log('AI Analysis Request:', request);
    
    // Simulate AI analysis with basic rule-based logic
    const response: AssetGuardianAIResponse = {
      asset_id: request.asset_id,
      risk_level: "low",
      finding: "Equipment operating within normal parameters",
      recommendation: "Continue routine maintenance schedule",
      create_work_order: false
    };

    // Simple threshold checking
    Object.entries(request.thresholds).forEach(([key, threshold]) => {
      if (key.endsWith('_high')) {
        const sensorType = key.replace('_high', '');
        const values = request.sensor_data[sensorType];
        if (values && values.length > 0) {
          const maxValue = Math.max(...values);
          if (maxValue > threshold * 0.9) {
            response.risk_level = "high";
            response.finding = `${sensorType} approaching critical threshold (${maxValue})`;
            response.recommendation = `Immediate inspection required for ${sensorType}`;
            response.create_work_order = true;
            response.work_order = {
              title: `High ${sensorType} Alert - ${request.asset_id}`,
              description: `${sensorType} reading of ${maxValue} is approaching critical threshold of ${threshold}. Immediate inspection required.`,
              priority: "high",
              due_hours: 4,
              assigned_team: "maintenance"
            };
          } else if (maxValue > threshold * 0.8) {
            response.risk_level = "medium";
            response.finding = `${sensorType} elevated (${maxValue})`;
            response.recommendation = `Schedule preventive maintenance for ${sensorType}`;
            response.create_work_order = true;
            response.work_order = {
              title: `Preventive Maintenance - ${request.asset_id}`,
              description: `${sensorType} reading of ${maxValue} indicates need for preventive maintenance.`,
              priority: "medium",
              due_hours: 48,
              assigned_team: "maintenance"
            };
          }
        }
      }
    });

    return response;
  }

  /**
   * Create predictive alert
   */
  static async createPredictiveAlert(alert: Omit<PredictiveAlert, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('predictive_alerts')
      .insert(alert)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  /**
   * Get active predictive alerts
   */
  static async getActivePredictiveAlerts() {
    const { data, error } = await supabase
      .from('predictive_alerts')
      .select(`
        *,
        equipment:asset_id (
          name,
          location
        )
      `)
      .is('resolved_at', null)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  /**
   * Create automated work order
   */
  static async createAutomatedWorkOrder(workOrder: any) {
    const { data, error } = await supabase
      .from('automated_work_orders')
      .insert(workOrder)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}
