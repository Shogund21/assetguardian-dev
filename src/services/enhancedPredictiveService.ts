
import { supabase } from "@/integrations/supabase/client";
import { getReadingStandards, getEquipmentReadingTemplate } from "@/utils/equipmentTemplates";
import type { AssetGuardianAIRequest, AssetGuardianAIResponse } from "@/types/predictive";

export class EnhancedPredictiveService {
  
  /**
   * Enhanced AI analysis that includes industry standards and baselines
   */
  static async processEnhancedAIAnalysis(equipmentId: string): Promise<AssetGuardianAIResponse | null> {
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

      // Detect equipment type
      const equipmentType = this.detectEquipmentType(equipment.name);
      console.log('Detected equipment type:', equipmentType);

      // Get reading templates with industry standards
      const readingTemplates = getEquipmentReadingTemplate(equipmentType);
      console.log('Available reading templates:', readingTemplates.length);

      // Get recent manual readings
      const sensorReadings = await this.getRecentSensorReadings(equipmentId, 168); // 7 days
      
      if (!sensorReadings || sensorReadings.length === 0) {
        console.log('No sensor data available for analysis');
        return this.createNoDataResponse(equipmentId);
      }

      // Get maintenance history
      const maintenanceHistory = await this.getMaintenanceHistory(equipmentId);

      // Analyze readings against industry standards
      const analysisResult = await this.analyzeWithIndustryStandards(
        equipment,
        sensorReadings,
        readingTemplates,
        maintenanceHistory
      );

      return analysisResult;
    } catch (error) {
      console.error('Error processing enhanced AI analysis:', error);
      return null;
    }
  }

  /**
   * Detect equipment type from name
   */
  private static detectEquipmentType(name: string): string {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('ahu') || lowerName.includes('air handler')) return 'ahu';
    if (lowerName.includes('chiller')) return 'chiller';
    if (lowerName.includes('rtu') || lowerName.includes('rooftop')) return 'rtu';
    if (lowerName.includes('cooling tower')) return 'cooling_tower';
    return 'general';
  }

  /**
   * Get recent sensor readings
   */
  private static async getRecentSensorReadings(equipmentId: string, hours: number = 168) {
    const { data, error } = await supabase
      .from('sensor_readings')
      .select('*')
      .eq('equipment_id', equipmentId)
      .gte('timestamp_utc', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
      .order('timestamp_utc', { ascending: true });

    if (error) {
      console.error('Error fetching sensor readings:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get maintenance history
   */
  private static async getMaintenanceHistory(equipmentId: string) {
    const { data, error } = await supabase
      .from('hvac_maintenance_checks')
      .select('check_date, notes, status')
      .eq('equipment_id', equipmentId)
      .order('check_date', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching maintenance history:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Analyze readings against industry standards
   */
  private static async analyzeWithIndustryStandards(
    equipment: any,
    sensorReadings: any[],
    readingTemplates: any[],
    maintenanceHistory: any[]
  ): Promise<AssetGuardianAIResponse> {
    // Group readings by sensor type
    const readingsByType = this.groupReadingsByType(sensorReadings);
    
    // Analyze each reading type against standards
    const violations = [];
    const insights = [];
    let overallRisk = 'low';

    for (const template of readingTemplates) {
      const readings = readingsByType[template.type] || [];
      if (readings.length === 0) continue;

      const latestReading = readings[readings.length - 1];
      const analysis = this.analyzeReadingAgainstStandards(latestReading.value, template, readings);
      
      if (analysis.violation) {
        violations.push(analysis);
        if (analysis.severity === 'critical') overallRisk = 'high';
        else if (analysis.severity === 'warning' && overallRisk !== 'high') overallRisk = 'medium';
      }

      if (analysis.insight) {
        insights.push(analysis.insight);
      }
    }

    // Create comprehensive AI response
    return this.createAIResponse(equipment.id, violations, insights, overallRisk, readingTemplates);
  }

  /**
   * Group readings by sensor type
   */
  private static groupReadingsByType(readings: any[]) {
    return readings.reduce((acc, reading) => {
      if (!acc[reading.sensor_type]) {
        acc[reading.sensor_type] = [];
      }
      acc[reading.sensor_type].push(reading);
      return acc;
    }, {});
  }

  /**
   * Analyze individual reading against standards
   */
  private static analyzeReadingAgainstStandards(value: number, template: any, historicalReadings: any[]) {
    const analysis: any = { violation: false, insight: null, severity: 'normal' };

    // Check critical threshold
    if (template.criticalThreshold && value >= template.criticalThreshold) {
      analysis.violation = true;
      analysis.severity = 'critical';
      analysis.message = `${template.label} is at critical level (${value} ${template.unit})`;
    }
    // Check warning threshold  
    else if (template.warningThreshold && value >= template.warningThreshold) {
      analysis.violation = true;
      analysis.severity = 'warning';
      analysis.message = `${template.label} is approaching limits (${value} ${template.unit})`;
    }
    // Check normal range
    else if (template.normalRange) {
      const { min, max } = template.normalRange;
      if (value < min || value > max) {
        analysis.violation = true;
        analysis.severity = 'warning';
        analysis.message = `${template.label} is outside normal range (${value} ${template.unit}, normal: ${min}-${max})`;
      }
    }

    // Trend analysis if we have enough historical data
    if (historicalReadings.length >= 3) {
      const trend = this.calculateTrend(historicalReadings.slice(-5));
      if (trend.direction === 'increasing' && trend.rate > 0.1) {
        analysis.insight = `${template.label} is trending upward (+${trend.rate.toFixed(1)}% over recent readings)`;
      } else if (trend.direction === 'decreasing' && trend.rate > 0.1) {
        analysis.insight = `${template.label} is trending downward (-${trend.rate.toFixed(1)}% over recent readings)`;
      }
    }

    return analysis;
  }

  /**
   * Calculate trend from readings
   */
  private static calculateTrend(readings: any[]) {
    if (readings.length < 2) return { direction: 'stable', rate: 0 };

    const first = readings[0].value;
    const last = readings[readings.length - 1].value;
    const rate = Math.abs((last - first) / first) * 100;

    return {
      direction: last > first ? 'increasing' : last < first ? 'decreasing' : 'stable',
      rate
    };
  }

  /**
   * Create AI response with comprehensive analysis
   */
  private static createAIResponse(
    assetId: string, 
    violations: any[], 
    insights: string[], 
    overallRisk: string,
    templates: any[]
  ): AssetGuardianAIResponse {
    let finding = "Equipment operating within normal parameters";
    let recommendation = "Continue routine maintenance schedule";
    let createWorkOrder = false;
    let workOrder = undefined;

    if (violations.length > 0) {
      const criticalViolations = violations.filter(v => v.severity === 'critical');
      const warningViolations = violations.filter(v => v.severity === 'warning');

      if (criticalViolations.length > 0) {
        finding = `Critical issues detected: ${criticalViolations.map(v => v.message).join('; ')}`;
        recommendation = "Immediate attention required. Schedule emergency maintenance.";
        createWorkOrder = true;
        workOrder = {
          title: `Critical Alert - ${assetId}`,
          description: `Critical readings detected: ${criticalViolations.map(v => v.message).join('; ')}`,
          priority: "high" as const,
          due_hours: 4,
          assigned_team: "maintenance"
        };
      } else if (warningViolations.length > 0) {
        finding = `Warning conditions detected: ${warningViolations.map(v => v.message).join('; ')}`;
        recommendation = "Schedule preventive maintenance to address trending issues.";
        createWorkOrder = true;
        workOrder = {
          title: `Preventive Maintenance - ${assetId}`,
          description: `Warning conditions detected: ${warningViolations.map(v => v.message).join('; ')}`,
          priority: "medium" as const,
          due_hours: 48,
          assigned_team: "maintenance"
        };
      }
    }

    // Add insights to findings
    if (insights.length > 0) {
      finding += ` Additional insights: ${insights.join('; ')}`;
    }

    return {
      asset_id: assetId,
      risk_level: overallRisk as any,
      finding,
      recommendation,
      create_work_order: createWorkOrder,
      work_order: workOrder
    };
  }

  /**
   * Create response when no data is available
   */
  private static createNoDataResponse(assetId: string): AssetGuardianAIResponse {
    return {
      asset_id: assetId,
      risk_level: "low",
      finding: "No recent readings available for analysis",
      recommendation: "Begin recording equipment readings to establish baseline and enable predictive maintenance",
      create_work_order: false
    };
  }
}
