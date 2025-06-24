
import { supabase } from '@/integrations/supabase/client';
import { PredictiveMaintenanceService } from './predictiveMaintenanceService';
import { PredictiveAlert, PredictiveTimelineEvent, DegradationAnalysis, MaintenanceWindow } from '@/types/predictive';

export type ReadingSource = 'manual' | 'standard' | 'auto';

export class EnhancedPredictiveService {
  static async processEnhancedAIAnalysis(
    equipmentId: string, 
    readingSource: ReadingSource = 'auto'
  ): Promise<PredictiveAlert | null> {
    try {
      console.log('Starting enhanced AI analysis for equipment:', equipmentId);
      console.log('Reading source preference:', readingSource);

      // Get equipment details first
      const { data: equipment, error: equipmentError } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', equipmentId)
        .single();

      if (equipmentError || !equipment) {
        console.error('Equipment not found:', equipmentError);
        throw new Error('Equipment not found');
      }

      // Get recent sensor readings with source filtering
      let sensorReadingsQuery = supabase
        .from('sensor_readings')
        .select('*')
        .eq('equipment_id', equipmentId)
        .gte('timestamp_utc', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('timestamp_utc', { ascending: false });

      // Apply source filter if specified
      if (readingSource !== 'auto') {
        sensorReadingsQuery = sensorReadingsQuery.eq('source', readingSource);
      }

      const { data: sensorReadings, error: readingsError } = await sensorReadingsQuery;

      if (readingsError) {
        console.error('Error fetching sensor readings:', readingsError);
        throw new Error('Failed to fetch sensor readings');
      }

      // Get maintenance history with the reading_mode column
      const { data: maintenanceHistory, error: maintenanceError } = await supabase
        .from('hvac_maintenance_checks')
        .select(`
          *,
          equipment:equipment_id (name, location),
          technician:technician_id (firstName, lastName)
        `)
        .eq('equipment_id', equipmentId)
        .gte('check_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .order('check_date', { ascending: false });

      if (maintenanceError) {
        console.error('Error fetching maintenance history:', maintenanceError);
        throw new Error('Failed to fetch maintenance history');
      }

      // Get equipment thresholds
      const { data: thresholds, error: thresholdsError } = await supabase
        .from('equipment_thresholds')
        .select('*')
        .eq('equipment_id', equipmentId);

      if (thresholdsError) {
        console.error('Error fetching thresholds:', thresholdsError);
        // Don't throw here, continue without thresholds
      }

      console.log('Data collection complete:', {
        sensorReadings: sensorReadings?.length || 0,
        maintenanceHistory: maintenanceHistory?.length || 0,
        thresholds: thresholds?.length || 0
      });

      // Check if we have sufficient data for analysis
      if (!sensorReadings?.length && !maintenanceHistory?.length) {
        console.warn('Insufficient data for analysis');
        throw new Error('Insufficient data for predictive analysis');
      }

      // Call the Edge Function for AI analysis
      const { data: analysisResult, error: analysisError } = await supabase.functions.invoke(
        'predictive-ai-analysis',
        {
          body: {
            equipment,
            sensorReadings: sensorReadings || [],
            maintenanceHistory: maintenanceHistory || [],
            thresholds: thresholds || [],
            readingSource
          }
        }
      );

      if (analysisError) {
        console.error('AI analysis error:', analysisError);
        throw new Error(`AI analysis failed: ${analysisError.message}`);
      }

      if (!analysisResult || !analysisResult.success) {
        console.error('AI analysis failed:', analysisResult);
        throw new Error(analysisResult?.error || 'AI analysis failed');
      }

      // Count manual and standard readings separately
      const manualReadingsCount = sensorReadings?.filter(r => r.source === 'manual').length || 0;
      const standardReadingsCount = maintenanceHistory?.filter(h => h.reading_mode === 'standard').length || 0;
      
      // Calculate coverage assessment
      const totalDataPoints = manualReadingsCount + standardReadingsCount;
      let coverageAssessment = 'insufficient';
      if (totalDataPoints >= 10) {
        coverageAssessment = 'excellent';
      } else if (totalDataPoints >= 5) {
        coverageAssessment = 'good';
      } else if (totalDataPoints >= 2) {
        coverageAssessment = 'fair';
      }

      // Store the alert in the database
      const alertData = {
        asset_id: equipmentId,
        risk_level: analysisResult.risk_level,
        finding: analysisResult.finding,
        recommendation: analysisResult.recommendation,
        confidence_score: analysisResult.confidence_score,
        resolved_at: null,
        work_order_id: null,
        data_quality: {
          manual_readings_count: manualReadingsCount,
          standard_readings_count: standardReadingsCount,
          coverage_assessment: coverageAssessment,
          reading_source_used: readingSource
        },
        predictive_timeline: analysisResult.predictive_timeline,
        degradation_analysis: analysisResult.degradation_analysis,
        maintenance_windows: analysisResult.maintenance_windows,
        performance_trends: analysisResult.performance_trends
      };

      const alert = await PredictiveMaintenanceService.createPredictiveAlert(alertData);
      console.log('Predictive alert created successfully:', alert.id);

      return alert;

    } catch (error) {
      console.error('Enhanced AI analysis failed:', error);
      throw error;
    }
  }

  private static calculateDataCompleteness(sensorReadings: any[], maintenanceHistory: any[]): number {
    // Simple data completeness calculation
    const sensorScore = Math.min((sensorReadings?.length || 0) / 10, 1) * 0.6;
    const maintenanceScore = Math.min((maintenanceHistory?.length || 0) / 5, 1) * 0.4;
    return sensorScore + maintenanceScore;
  }

  static async getAnalysisHistory(equipmentId?: string): Promise<PredictiveAlert[]> {
    try {
      let query = supabase
        .from('predictive_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (equipmentId) {
        query = query.eq('asset_id', equipmentId);
      }

      const { data, error } = await query.limit(20);

      if (error) {
        console.error('Error fetching analysis history:', error);
        throw error;
      }

      return (data || []).map(alert => ({
        ...alert,
        risk_level: alert.risk_level as 'low' | 'medium' | 'high',
        data_quality: alert.data_quality as any || {
          manual_readings_count: 0,
          standard_readings_count: 0,
          coverage_assessment: 'insufficient'
        },
        predictive_timeline: Array.isArray(alert.predictive_timeline) 
          ? alert.predictive_timeline as PredictiveTimelineEvent[]
          : (alert.predictive_timeline ? JSON.parse(alert.predictive_timeline as string) : []) as PredictiveTimelineEvent[],
        degradation_analysis: Array.isArray(alert.degradation_analysis)
          ? alert.degradation_analysis as DegradationAnalysis[]
          : (alert.degradation_analysis ? JSON.parse(alert.degradation_analysis as string) : []) as DegradationAnalysis[],
        maintenance_windows: Array.isArray(alert.maintenance_windows)
          ? alert.maintenance_windows as MaintenanceWindow[]
          : (alert.maintenance_windows ? JSON.parse(alert.maintenance_windows as string) : []) as MaintenanceWindow[],
        performance_trends: alert.performance_trends 
          ? (typeof alert.performance_trends === 'object' 
              ? alert.performance_trends as any
              : JSON.parse(alert.performance_trends as string))
          : undefined
      }));
    } catch (error) {
      console.error('Failed to get analysis history:', error);
      return [];
    }
  }
}
