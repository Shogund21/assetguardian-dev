import { supabase } from '@/integrations/supabase/client';

export interface HvacDiagnosticData {
  equipmentId: string;
  sensorReadings: any[];
  manualMaintenanceLogs: any[];
  refrigerantReports: any[];
  vibrationAnalysis: any[];
  condenserMaintenance: any[];
  maintenanceHistory: any[];
  thresholds: any[];
}

export interface DiagnosticSession {
  id: string;
  equipment_id: string;
  session_date: string;
  diagnostic_type: 'comprehensive' | 'targeted' | 'emergency';
  confidence_score: number;
  overall_health_score: number;
  critical_findings: string[];
  recommendations: string[];
  estimated_remaining_life_months: number;
  maintenance_priority: 'low' | 'medium' | 'high' | 'critical';
  cost_analysis: any;
  data_sources_used: string[];
  analyst_notes: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export class HvacDiagnosticService {
  /**
   * Comprehensive HVAC diagnostic analysis that integrates all supplemental data sources
   */
  static async performComprehensiveDiagnostic(equipmentId: string): Promise<{session: DiagnosticSession, fullResult: any}> {
    try {
      console.log('Starting comprehensive HVAC diagnostic for equipment:', equipmentId);

      // Collect all supplemental data
      const diagnosticData = await this.collectSupplementalData(equipmentId);
      
      // Validate data completeness
      const dataQuality = this.assessDataQuality(diagnosticData);
      
      // Perform enhanced AI analysis with supplemental data
      const analysisResult = await this.performEnhancedAIAnalysis(diagnosticData, dataQuality);
      
      // Create diagnostic session record
      const diagnosticSession = await this.createDiagnosticSession(
        equipmentId, 
        'comprehensive', 
        analysisResult
      );
      
      console.log('Comprehensive diagnostic completed:', diagnosticSession.id);
      return {
        session: diagnosticSession,
        fullResult: analysisResult
      };
      
    } catch (error) {
      console.error('Comprehensive diagnostic failed:', error);
      throw error;
    }
  }

  /**
   * Collect all supplemental data for comprehensive analysis
   */
  private static async collectSupplementalData(equipmentId: string): Promise<HvacDiagnosticData> {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const queries = [
      // Current sensor readings (last 30 days)
      supabase
        .from('sensor_readings')
        .select('*')
        .eq('equipment_id', equipmentId)
        .gte('timestamp_utc', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('timestamp_utc', { ascending: false }),
      
      // Manual maintenance logs (last 12 months)
      supabase
        .from('manual_maintenance_logs')
        .select('*')
        .eq('equipment_id', equipmentId)
        .gte('log_date', twelveMonthsAgo.toISOString().split('T')[0])
        .order('log_date', { ascending: false }),
      
      // Refrigerant reports (last 12 months)
      supabase
        .from('refrigerant_reports')
        .select('*')
        .eq('equipment_id', equipmentId)
        .gte('report_date', twelveMonthsAgo.toISOString().split('T')[0])
        .order('report_date', { ascending: false }),
      
      // Vibration analysis (last 6 months)
      supabase
        .from('vibration_analysis')
        .select('*')
        .eq('equipment_id', equipmentId)
        .gte('analysis_date', sixMonthsAgo.toISOString().split('T')[0])
        .order('analysis_date', { ascending: false }),
      
      // Condenser maintenance (last 12 months)
      supabase
        .from('condenser_maintenance')
        .select('*')
        .eq('equipment_id', equipmentId)
        .gte('service_date', twelveMonthsAgo.toISOString().split('T')[0])
        .order('service_date', { ascending: false }),
      
      // Standard maintenance history
      supabase
        .from('hvac_maintenance_checks')
        .select('*')
        .eq('equipment_id', equipmentId)
        .gte('check_date', twelveMonthsAgo.toISOString())
        .order('check_date', { ascending: false }),
      
      // Equipment thresholds
      supabase
        .from('equipment_thresholds')
        .select('*')
        .eq('equipment_id', equipmentId)
    ];

    const results = await Promise.all(queries);
    
    return {
      equipmentId,
      sensorReadings: results[0].data || [],
      manualMaintenanceLogs: results[1].data || [],
      refrigerantReports: results[2].data || [],
      vibrationAnalysis: results[3].data || [],
      condenserMaintenance: results[4].data || [],
      maintenanceHistory: results[5].data || [],
      thresholds: results[6].data || []
    };
  }

  /**
   * Assess data quality and completeness for confidence scoring
   */
  private static assessDataQuality(data: HvacDiagnosticData): any {
    const assessments = {
      sensor_readings: {
        count: data.sensorReadings.length,
        quality: data.sensorReadings.length >= 20 ? 'excellent' : 
                 data.sensorReadings.length >= 10 ? 'good' : 
                 data.sensorReadings.length >= 5 ? 'fair' : 'poor',
        weight: 0.25
      },
      manual_maintenance: {
        count: data.manualMaintenanceLogs.length,
        quality: data.manualMaintenanceLogs.length >= 5 ? 'excellent' : 
                 data.manualMaintenanceLogs.length >= 3 ? 'good' : 
                 data.manualMaintenanceLogs.length >= 1 ? 'fair' : 'poor',
        weight: 0.20
      },
      refrigerant_reports: {
        count: data.refrigerantReports.length,
        quality: data.refrigerantReports.length >= 2 ? 'excellent' : 
                 data.refrigerantReports.length >= 1 ? 'good' : 'poor',
        weight: 0.15
      },
      vibration_analysis: {
        count: data.vibrationAnalysis.length,
        quality: data.vibrationAnalysis.length >= 2 ? 'excellent' : 
                 data.vibrationAnalysis.length >= 1 ? 'good' : 'poor',
        weight: 0.20
      },
      condenser_maintenance: {
        count: data.condenserMaintenance.length,
        quality: data.condenserMaintenance.length >= 2 ? 'excellent' : 
                 data.condenserMaintenance.length >= 1 ? 'good' : 'poor',
        weight: 0.10
      },
      maintenance_history: {
        count: data.maintenanceHistory.length,
        quality: data.maintenanceHistory.length >= 10 ? 'excellent' : 
                 data.maintenanceHistory.length >= 5 ? 'good' : 
                 data.maintenanceHistory.length >= 2 ? 'fair' : 'poor',
        weight: 0.10
      }
    };

    // Calculate overall confidence score
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    Object.values(assessments).forEach(assessment => {
      const qualityScore = assessment.quality === 'excellent' ? 1 : 
                          assessment.quality === 'good' ? 0.8 : 
                          assessment.quality === 'fair' ? 0.6 : 0.3;
      totalWeightedScore += qualityScore * assessment.weight;
      totalWeight += assessment.weight;
    });

    const overallConfidence = totalWeightedScore / totalWeight;
    
    return {
      assessments,
      overall_confidence: overallConfidence,
      data_completeness: overallConfidence >= 0.8 ? 'excellent' : 
                        overallConfidence >= 0.6 ? 'good' : 
                        overallConfidence >= 0.4 ? 'fair' : 'poor'
    };
  }

  /**
   * Perform enhanced AI analysis with supplemental data
   */
  private static async performEnhancedAIAnalysis(
    data: HvacDiagnosticData, 
    dataQuality: any
  ): Promise<any> {
    try {
      // Get equipment details
      const { data: equipment } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', data.equipmentId)
        .single();

      if (!equipment) {
        throw new Error('Equipment not found');
      }

      // Prepare enhanced payload for AI analysis
      const enhancedPayload = {
        equipmentData: {
          asset_id: equipment.id,
          asset_type: equipment.name,
          location: equipment.location,
          equipment_type: equipment.type
        },
        sensorReadings: data.sensorReadings,
        manualMaintenanceLogs: data.manualMaintenanceLogs,
        refrigerantReports: data.refrigerantReports,
        vibrationAnalysis: data.vibrationAnalysis,
        condenserMaintenance: data.condenserMaintenance,
        maintenanceHistory: data.maintenanceHistory,
        thresholds: data.thresholds,
        dataQuality,
        analysisType: 'comprehensive_diagnostic',
        readingSource: 'comprehensive'
      };

      // Call enhanced AI analysis edge function
      const { data: analysisResult, error } = await supabase.functions.invoke(
        'hvac-diagnostic-analysis',
        { body: enhancedPayload }
      );

      if (error) {
        console.error('Enhanced AI analysis error:', error);
        throw error;
      }

      return analysisResult;
      
    } catch (error) {
      console.error('Enhanced AI analysis failed:', error);
      throw error;
    }
  }

  /**
   * Create diagnostic session record
   */
  private static async createDiagnosticSession(
    equipmentId: string,
    diagnosticType: 'comprehensive' | 'targeted' | 'emergency',
    analysisResult: any
  ): Promise<DiagnosticSession> {
    const sessionData = {
      equipment_id: equipmentId,
      diagnostic_type: diagnosticType,
      confidence_score: analysisResult.confidence_score || 0,
      overall_health_score: analysisResult.overall_health_score || 0,
      critical_findings: analysisResult.critical_findings || [],
      recommendations: analysisResult.recommendations || [],
      estimated_remaining_life_months: analysisResult.estimated_remaining_life_months || null,
      maintenance_priority: analysisResult.maintenance_priority || 'medium',
      cost_analysis: analysisResult.cost_analysis || {},
      data_sources_used: analysisResult.data_sources_used || [],
      analyst_notes: analysisResult.analyst_notes || '',
      created_by: null // Will be set by RLS
    };

    const { data, error } = await supabase
      .from('hvac_diagnostic_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) {
      console.error('Failed to create diagnostic session:', error);
      throw error;
    }

    return {
      ...data,
      diagnostic_type: data.diagnostic_type as 'comprehensive' | 'targeted' | 'emergency',
      maintenance_priority: data.maintenance_priority as 'low' | 'medium' | 'high' | 'critical'
    };
  }

  /**
   * Get diagnostic session history
   */
  static async getDiagnosticHistory(equipmentId?: string): Promise<DiagnosticSession[]> {
    try {
      let query = supabase
        .from('hvac_diagnostic_sessions')
        .select('*')
        .order('session_date', { ascending: false });

      if (equipmentId) {
        query = query.eq('equipment_id', equipmentId);
      }

      const { data, error } = await query.limit(20);

      if (error) {
        console.error('Failed to get diagnostic history:', error);
        throw error;
      }

      return (data || []).map(session => ({
        ...session,
        diagnostic_type: session.diagnostic_type as 'comprehensive' | 'targeted' | 'emergency',
        maintenance_priority: session.maintenance_priority as 'low' | 'medium' | 'high' | 'critical'
      }));
    } catch (error) {
      console.error('Failed to get diagnostic history:', error);
      return [];
    }
  }

  /**
   * Get supplemental data summary for an equipment
   */
  static async getSupplementalDataSummary(equipmentId: string): Promise<any> {
    const data = await this.collectSupplementalData(equipmentId);
    const quality = this.assessDataQuality(data);
    
    return {
      equipmentId,
      dataSummary: {
        sensor_readings: data.sensorReadings.length,
        manual_maintenance_logs: data.manualMaintenanceLogs.length,
        refrigerant_reports: data.refrigerantReports.length,
        vibration_analysis: data.vibrationAnalysis.length,
        condenser_maintenance: data.condenserMaintenance.length,
        maintenance_history: data.maintenanceHistory.length,
        thresholds: data.thresholds.length
      },
      dataQuality: quality,
      lastUpdated: new Date().toISOString()
    };
  }
}