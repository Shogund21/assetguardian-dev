
import { supabase } from "@/integrations/supabase/client";
import { SensorReading, PredictiveAlert, AssetGuardianAIRequest, AssetGuardianAIResponse } from "@/types/predictive";

export class PredictiveMaintenanceService {
  
  /**
   * Store sensor reading data
   */
  static async storeSensorReading(reading: Omit<SensorReading, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('sensor_readings')
      .insert({
        equipment_id: reading.equipment_id,
        timestamp_utc: reading.timestamp_utc,
        sensor_type: reading.sensor_type,
        value: reading.value,
        unit: reading.unit
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing sensor reading:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get recent sensor readings for equipment
   */
  static async getRecentSensorReadings(equipmentId: string, hours: number = 24): Promise<SensorReading[]> {
    const { data, error } = await supabase
      .from('sensor_readings')
      .select('*')
      .eq('equipment_id', equipmentId)
      .gte('timestamp_utc', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
      .order('timestamp_utc', { ascending: true });

    if (error) {
      console.error('Error fetching sensor readings:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get equipment thresholds
   */
  static async getEquipmentThresholds(equipmentId: string) {
    const { data, error } = await supabase
      .from('equipment_thresholds')
      .select('*')
      .eq('equipment_id', equipmentId);

    if (error) {
      console.error('Error fetching equipment thresholds:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get maintenance history for equipment
   */
  static async getMaintenanceHistory(equipmentId: string, limit: number = 10) {
    const { data, error } = await supabase
      .from('hvac_maintenance_checks')
      .select('check_date, notes, status')
      .eq('equipment_id', equipmentId)
      .order('check_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching maintenance history:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Process AI analysis for equipment using real OpenAI integration
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

      // Get thresholds and maintenance history
      const thresholds = await this.getEquipmentThresholds(equipmentId);
      const maintenanceHistory = await this.getMaintenanceHistory(equipmentId);

      // Transform data for AI analysis
      const aiRequest = this.prepareAIRequest(
        equipment,
        sensorReadings,
        thresholds,
        maintenanceHistory
      );

      // Call real AI analysis via Supabase Edge Function
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('predictive-ai-analysis', {
        body: aiRequest
      });

      if (aiError) {
        console.error('AI analysis error:', aiError);
        // Fallback to mock analysis
        return this.callMockAI(aiRequest);
      }

      return aiResponse as AssetGuardianAIResponse;
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
   * Fallback mock AI analysis (used when real AI is unavailable)
   */
  private static async callMockAI(request: AssetGuardianAIRequest): Promise<AssetGuardianAIResponse> {
    console.log('Using fallback mock AI analysis');
    
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
            response.finding = `${sensorType} approaching critical threshold (${maxValue.toFixed(1)})`;
            response.recommendation = `Immediate inspection required for ${sensorType}`;
            response.create_work_order = true;
            response.work_order = {
              title: `High ${sensorType} Alert - ${request.asset_id}`,
              description: `${sensorType} reading of ${maxValue.toFixed(1)} is approaching critical threshold of ${threshold}. Immediate inspection required.`,
              priority: "high",
              due_hours: 4,
              assigned_team: "maintenance"
            };
          } else if (maxValue > threshold * 0.8) {
            response.risk_level = "medium";
            response.finding = `${sensorType} elevated (${maxValue.toFixed(1)})`;
            response.recommendation = `Schedule preventive maintenance for ${sensorType}`;
            response.create_work_order = true;
            response.work_order = {
              title: `Preventive Maintenance - ${request.asset_id}`,
              description: `${sensorType} reading of ${maxValue.toFixed(1)} indicates need for preventive maintenance.`,
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
      .insert({
        asset_id: alert.asset_id,
        risk_level: alert.risk_level,
        finding: alert.finding,
        recommendation: alert.recommendation,
        confidence_score: alert.confidence_score,
        work_order_id: alert.work_order_id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating predictive alert:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get active predictive alerts
   */
  static async getActivePredictiveAlerts(): Promise<PredictiveAlert[]> {
    const { data, error } = await supabase
      .from('predictive_alerts')
      .select(`
        *,
        equipment:equipment(name, location)
      `)
      .is('resolved_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching predictive alerts:', error);
      return [];
    }

    return data?.map(alert => ({
      ...alert,
      equipment: alert.equipment ? {
        name: alert.equipment.name,
        location: alert.equipment.location
      } : undefined
    })) || [];
  }

  /**
   * Create automated work order
   */
  static async createAutomatedWorkOrder(workOrder: any) {
    const { data, error } = await supabase
      .from('automated_work_orders')
      .insert({
        asset_id: workOrder.asset_id,
        title: workOrder.title,
        description: workOrder.description,
        priority: workOrder.priority,
        due_hours: workOrder.due_hours,
        assigned_team: workOrder.assigned_team,
        alert_id: workOrder.alert_id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating automated work order:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get sensor analysis using database function
   */
  static async getSensorAnalysis(equipmentId: string, hours: number = 24) {
    const { data, error } = await supabase
      .rpc('get_sensor_analysis', {
        p_equipment_id: equipmentId,
        p_hours: hours
      });

    if (error) {
      console.error('Error getting sensor analysis:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Check threshold violations using database function
   */
  static async checkThresholdViolations(equipmentId: string) {
    const { data, error } = await supabase
      .rpc('check_threshold_violations', {
        p_equipment_id: equipmentId
      });

    if (error) {
      console.error('Error checking threshold violations:', error);
      throw error;
    }

    return data || [];
  }
}
