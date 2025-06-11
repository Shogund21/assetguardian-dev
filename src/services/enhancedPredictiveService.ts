import { supabase } from "@/integrations/supabase/client";
import { getReadingStandards, getEquipmentReadingTemplate } from "@/utils/equipmentTemplates";
import { getMaintenanceTemplate } from "@/utils/tieredMaintenanceTemplates";
import type { AssetGuardianAIRequest, AssetGuardianAIResponse } from "@/types/predictive";

export class EnhancedPredictiveService {
  
  /**
   * Enhanced AI analysis with tiered maintenance support
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

      // Get recent maintenance checks with frequency data
      const maintenanceHistory = await this.getMaintenanceHistoryWithFrequency(equipmentId);
      const sensorReadings = await this.getRecentSensorReadings(equipmentId, 168); // 7 days
      
      if (!sensorReadings || sensorReadings.length === 0) {
        return this.createNoDataResponse(equipmentId);
      }

      // Enhanced analysis considering maintenance frequency patterns
      const analysisResult = await this.analyzeTieredMaintenanceData(
        equipment,
        sensorReadings,
        maintenanceHistory,
        equipmentType
      );

      return analysisResult;
    } catch (error) {
      console.error('Error processing enhanced AI analysis:', error);
      return null;
    }
  }

  /**
   * Analyze maintenance data considering frequency and completeness
   */
  private static async analyzeTieredMaintenanceData(
    equipment: any,
    sensorReadings: any[],
    maintenanceHistory: any[],
    equipmentType: string
  ): Promise<AssetGuardianAIResponse> {
    // Analyze maintenance frequency patterns
    const frequencyAnalysis = this.analyzeMaintenanceFrequencyPatterns(maintenanceHistory);
    
    // Get reading templates for comparison
    const readingTemplates = getEquipmentReadingTemplate(equipmentType);
    
    // Analyze current readings against standards
    const readingAnalysis = this.analyzeReadingsWithFrequencyContext(sensorReadings, readingTemplates, frequencyAnalysis);
    
    // Determine if more detailed inspection is needed
    const recommendedAction = this.determineRecommendedAction(readingAnalysis, frequencyAnalysis);
    
    return this.createTieredMaintenanceResponse(equipment.id, readingAnalysis, recommendedAction, frequencyAnalysis);
  }

  /**
   * Analyze maintenance frequency patterns
   */
  private static analyzeMaintenanceFrequencyPatterns(maintenanceHistory: any[]) {
    const recentChecks = maintenanceHistory.slice(0, 10);
    const dailyChecks = recentChecks.filter(check => check.maintenance_frequency === 'daily');
    const weeklyChecks = recentChecks.filter(check => check.maintenance_frequency === 'weekly');
    const monthlyChecks = recentChecks.filter(check => check.maintenance_frequency === 'monthly');
    
    const lastDailyCheck = dailyChecks[0];
    const lastWeeklyCheck = weeklyChecks[0];
    const lastMonthlyCheck = monthlyChecks[0];
    
    const daysSinceDaily = lastDailyCheck ? 
      Math.floor((Date.now() - new Date(lastDailyCheck.check_date).getTime()) / (1000 * 60 * 60 * 24)) : 999;
    const daysSinceWeekly = lastWeeklyCheck ?
      Math.floor((Date.now() - new Date(lastWeeklyCheck.check_date).getTime()) / (1000 * 60 * 60 * 24)) : 999;
    const daysSinceMonthly = lastMonthlyCheck ?
      Math.floor((Date.now() - new Date(lastMonthlyCheck.check_date).getTime()) / (1000 * 60 * 60 * 24)) : 999;

    return {
      daysSinceDaily,
      daysSinceWeekly,
      daysSinceMonthly,
      dailyCheckCount: dailyChecks.length,
      weeklyCheckCount: weeklyChecks.length,
      monthlyCheckCount: monthlyChecks.length,
      isOverdueDaily: daysSinceDaily > 2,
      isOverdueWeekly: daysSinceWeekly > 8,
      isOverdueMonthly: daysSinceMonthly > 35
    };
  }

  /**
   * Analyze readings with frequency context
   */
  private static analyzeReadingsWithFrequencyContext(sensorReadings: any[], templates: any[], frequencyAnalysis: any) {
    const readingsByType = this.groupReadingsByType(sensorReadings);
    const violations = [];
    const insights = [];
    let overallRisk = 'low';

    // If we have limited data due to infrequent checks, adjust analysis
    const hasLimitedData = frequencyAnalysis.dailyCheckCount < 3 && frequencyAnalysis.weeklyCheckCount < 2;

    for (const template of templates) {
      const readings = readingsByType[template.type] || [];
      if (readings.length === 0) continue;

      const latestReading = readings[readings.length - 1];
      const analysis = this.analyzeReadingAgainstStandards(latestReading.value, template, readings);
      
      // Adjust severity based on data availability
      if (hasLimitedData && analysis.violation) {
        analysis.severity = analysis.severity === 'critical' ? 'warning' : 'normal';
        analysis.message += ' (Limited data - recommend more frequent monitoring)';
      }
      
      if (analysis.violation) {
        violations.push(analysis);
        if (analysis.severity === 'critical') overallRisk = 'high';
        else if (analysis.severity === 'warning' && overallRisk !== 'high') overallRisk = 'medium';
      }

      if (analysis.insight) {
        insights.push(analysis.insight);
      }
    }

    return { violations, insights, overallRisk, hasLimitedData };
  }

  /**
   * Determine recommended maintenance action
   */
  private static determineRecommendedAction(readingAnalysis: any, frequencyAnalysis: any) {
    // Check if more detailed inspection is needed
    if (readingAnalysis.violations.some((v: any) => v.severity === 'critical')) {
      return {
        type: 'immediate_detailed_inspection',
        message: 'Critical readings detected - perform comprehensive inspection immediately'
      };
    }

    if (readingAnalysis.violations.some((v: any) => v.severity === 'warning')) {
      return {
        type: 'weekly_inspection_recommended',
        message: 'Warning conditions detected - schedule weekly detailed inspection'
      };
    }

    if (frequencyAnalysis.isOverdueWeekly && readingAnalysis.hasLimitedData) {
      return {
        type: 'increase_monitoring_frequency',
        message: 'Limited recent data - increase to weekly monitoring for better trend analysis'
      };
    }

    return {
      type: 'continue_current_schedule',
      message: 'Equipment operating normally - continue current maintenance schedule'
    };
  }

  /**
   * Create tiered maintenance response
   */
  private static createTieredMaintenanceResponse(
    assetId: string, 
    readingAnalysis: any, 
    recommendedAction: any,
    frequencyAnalysis: any
  ): AssetGuardianAIResponse {
    let finding = "Equipment operating within normal parameters";
    let recommendation = recommendedAction.message;
    let createWorkOrder = false;
    let workOrder = undefined;

    if (readingAnalysis.violations.length > 0) {
      const criticalViolations = readingAnalysis.violations.filter((v: any) => v.severity === 'critical');
      const warningViolations = readingAnalysis.violations.filter((v: any) => v.severity === 'warning');

      if (criticalViolations.length > 0) {
        finding = `Critical issues detected: ${criticalViolations.map((v: any) => v.message).join('; ')}`;
        createWorkOrder = true;
        workOrder = {
          title: `Critical Alert - Equipment ${assetId}`,
          description: `${finding}. Perform comprehensive inspection immediately.`,
          priority: "high" as const,
          due_hours: 4,
          assigned_team: "maintenance"
        };
      } else if (warningViolations.length > 0) {
        finding = `Warning conditions detected: ${warningViolations.map((v: any) => v.message).join('; ')}`;
        createWorkOrder = recommendedAction.type === 'weekly_inspection_recommended';
        if (createWorkOrder) {
          workOrder = {
            title: `Detailed Inspection Required - Equipment ${assetId}`,
            description: `${finding}. Schedule weekly-level detailed inspection.`,
            priority: "medium" as const,
            due_hours: 48,
            assigned_team: "maintenance"
          };
        }
      }
    }

    // Add frequency-based insights
    if (frequencyAnalysis.isOverdueMonthly) {
      finding += ` Monthly comprehensive inspection overdue (${frequencyAnalysis.daysSinceMonthly} days).`;
    }

    return {
      asset_id: assetId,
      risk_level: readingAnalysis.overallRisk,
      finding,
      recommendation,
      create_work_order: createWorkOrder,
      work_order: workOrder
    };
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
   * Get maintenance history with frequency data
   */
  private static async getMaintenanceHistoryWithFrequency(equipmentId: string) {
    const { data, error } = await supabase
      .from('hvac_maintenance_checks')
      .select('check_date, notes, status, maintenance_frequency')
      .eq('equipment_id', equipmentId)
      .order('check_date', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching maintenance history:', error);
      return [];
    }

    return data || [];
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

    if (template.criticalThreshold && value >= template.criticalThreshold) {
      analysis.violation = true;
      analysis.severity = 'critical';
      analysis.message = `${template.label} is at critical level (${value} ${template.unit})`;
    } else if (template.warningThreshold && value >= template.warningThreshold) {
      analysis.violation = true;
      analysis.severity = 'warning';
      analysis.message = `${template.label} is approaching limits (${value} ${template.unit})`;
    } else if (template.normalRange) {
      const { min, max } = template.normalRange;
      if (value < min || value > max) {
        analysis.violation = true;
        analysis.severity = 'warning';
        analysis.message = `${template.label} is outside normal range (${value} ${template.unit}, normal: ${min}-${max})`;
      }
    }

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
      recommendation: "Begin with daily quick checks to establish baseline and enable predictive maintenance",
      create_work_order: false
    };
  }
}
