import { supabase } from "@/integrations/supabase/client";
import { SensorReading, PredictiveAlert, AssetGuardianAIRequest, AssetGuardianAIResponse } from "@/types/predictive";

export class PredictiveMaintenanceService {
  
  /**
   * Store sensor reading data (mock implementation for now)
   */
  static async storeSensorReading(reading: Omit<SensorReading, 'id' | 'created_at'>) {
    // For now, return a mock response since tables don't exist yet
    console.log('Storing sensor reading (mock):', reading);
    return {
      id: crypto.randomUUID(),
      ...reading,
      created_at: new Date().toISOString()
    };
  }

  /**
   * Get recent sensor readings for equipment (mock implementation)
   */
  static async getRecentSensorReadings(equipmentId: string, hours: number = 24): Promise<SensorReading[]> {
    console.log(`Getting sensor readings for equipment ${equipmentId} (mock)`);
    
    // Return mock sensor data for demonstration
    const now = new Date();
    const mockReadings: SensorReading[] = [];
    
    for (let i = hours * 6; i >= 0; i--) { // Every 10 minutes
      const timestamp = new Date(now.getTime() - (i * 10 * 60 * 1000));
      
      // Vibration data (mm/s)
      mockReadings.push({
        id: `vib-${i}`,
        equipment_id: equipmentId,
        timestamp_utc: timestamp.toISOString(),
        sensor_type: 'vibration_mm_s',
        value: 2.5 + Math.random() * 2 + Math.sin(i * 0.1) * 0.5,
        unit: 'mm/s',
        created_at: timestamp.toISOString()
      });
      
      // Temperature data (°C)
      mockReadings.push({
        id: `temp-${i}`,
        equipment_id: equipmentId,
        timestamp_utc: timestamp.toISOString(),
        sensor_type: 'bearing_temp_C',
        value: 65 + Math.random() * 15 + Math.sin(i * 0.05) * 3,
        unit: '°C',
        created_at: timestamp.toISOString()
      });
      
      // Current data (A)
      mockReadings.push({
        id: `current-${i}`,
        equipment_id: equipmentId,
        timestamp_utc: timestamp.toISOString(),
        sensor_type: 'current_A',
        value: 58 + Math.random() * 8 + Math.sin(i * 0.03) * 2,
        unit: 'A',
        created_at: timestamp.toISOString()
      });
    }
    
    return mockReadings;
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

      // Get recent sensor readings (using mock data for now)
      const sensorReadings = await this.getRecentSensorReadings(equipmentId, 72); // 3 days
      
      if (!sensorReadings || sensorReadings.length === 0) {
        console.log('No sensor data available for analysis');
        return null;
      }

      // Mock thresholds and maintenance history for now
      const mockThresholds = [
        { sensor_type: 'vibration_mm_s', critical_threshold: 4.5, warning_threshold: 3.5 },
        { sensor_type: 'bearing_temp_C', critical_threshold: 80, warning_threshold: 70 },
        { sensor_type: 'current_A', critical_threshold: 70, warning_threshold: 65 }
      ];

      const mockMaintenanceHistory = [
        { check_date: '2025-03-01', notes: 'Routine maintenance completed', status: 'completed' }
      ];

      // Transform data for AI analysis
      const aiRequest = this.prepareAIRequest(
        equipment,
        sensorReadings,
        mockThresholds,
        mockMaintenanceHistory
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
   * Create predictive alert (mock implementation)
   */
  static async createPredictiveAlert(alert: Omit<PredictiveAlert, 'id' | 'created_at'>) {
    console.log('Creating predictive alert (mock):', alert);
    return {
      id: crypto.randomUUID(),
      ...alert,
      created_at: new Date().toISOString()
    };
  }

  /**
   * Get active predictive alerts (mock implementation)
   */
  static async getActivePredictiveAlerts(): Promise<PredictiveAlert[]> {
    console.log('Getting active predictive alerts (mock)');
    
    // Return mock alerts for demonstration
    const mockAlerts: PredictiveAlert[] = [
      {
        id: crypto.randomUUID(),
        asset_id: 'chiller-001',
        risk_level: 'medium',
        finding: 'Bearing temperature elevated to 72°C',
        recommendation: 'Schedule preventive maintenance within 48 hours',
        confidence_score: 0.85,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        resolved_at: null,
        work_order_id: null,
        equipment: {
          name: 'Main Chiller Unit',
          location: 'Roof - North Side'
        }
      },
      {
        id: crypto.randomUUID(),
        asset_id: 'ahu-003',
        risk_level: 'high',
        finding: 'Vibration levels approaching critical threshold (4.2 mm/s)',
        recommendation: 'Immediate inspection required - possible bearing failure',
        confidence_score: 0.92,
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        resolved_at: null,
        work_order_id: null,
        equipment: {
          name: 'Air Handling Unit 3',
          location: 'Mechanical Room B'
        }
      }
    ];
    
    return mockAlerts;
  }

  /**
   * Create automated work order (mock implementation)
   */
  static async createAutomatedWorkOrder(workOrder: any) {
    console.log('Creating automated work order (mock):', workOrder);
    return {
      id: crypto.randomUUID(),
      ...workOrder,
      created_at: new Date().toISOString()
    };
  }
}
