import { supabase } from "@/integrations/supabase/client";

export interface EnergyAIAnalysis {
  overall_rating: number;
  efficiency_status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  energy_insights: {
    current_performance: string;
    key_findings: string[];
    efficiency_score: number;
  };
  consumption_analysis: {
    load_profile: string;
    peak_usage_hours: string;
    waste_indicators: string[];
  };
  recommendations: Array<{
    category: 'operational' | 'maintenance' | 'upgrade';
    priority: 'immediate' | 'short_term' | 'long_term';
    title: string;
    description: string;
    expected_savings_monthly: number;
    implementation_cost: number;
    payback_months: number;
    energy_impact: string;
  }>;
  cost_analysis: {
    current_monthly_cost: number;
    potential_monthly_savings: number;
    annual_savings_potential: number;
    roi_percentage: number;
  };
  predictive_insights: {
    equipment_health_score: number;
    degradation_rate: 'slow' | 'moderate' | 'rapid';
    next_maintenance_window: string;
    performance_forecast: string;
  };
  smart_strategies: Array<{
    strategy: string;
    description: string;
    savings_potential: string;
  }>;
}

export class EnergyAIService {
  static async analyzeEnergyEfficiency(
    equipmentId: string,
    energyData: any
  ): Promise<EnergyAIAnalysis | null> {
    try {
      console.log('🤖 Starting AI energy analysis for equipment:', equipmentId);

      // Get comprehensive sensor data
      const { data: sensorReadings } = await supabase
        .from('sensor_readings')
        .select('sensor_type, value, timestamp_utc, source, reading_mode')
        .eq('equipment_id', equipmentId)
        .gte('timestamp_utc', new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString())
        .order('timestamp_utc', { ascending: false })
        .limit(100);

      // Get historical energy data for trends
      const historicalData = [];
      
      console.log('📊 Calling energy AI analysis edge function...');

      // Call our specialized energy AI analysis edge function
      const { data: result } = await supabase.functions.invoke('energy-ai-analysis', {
        body: {
          equipmentId,
          energyData,
          sensorReadings: sensorReadings || [],
          historicalData
        }
      });

      if (!result.success) {
        throw new Error(result.error || 'AI analysis failed');
      }

      console.log('✅ Energy AI analysis completed successfully');
      return result.analysis;

    } catch (error) {
      console.error('❌ Error in energy AI analysis:', error);
      return null;
    }
  }

  static async getChatResponse(
    equipmentId: string,
    userQuestion: string,
    energyData: any
  ): Promise<string> {
    try {
      // Get recent analysis or perform new one
      const analysis = await this.analyzeEnergyEfficiency(equipmentId, energyData);
      
      const { data: result } = await supabase.functions.invoke('energy-ai-analysis', {
        body: {
          equipmentId,
          energyData,
          userQuestion,
          previousAnalysis: analysis,
          mode: 'chat'
        }
      });

      return result.response || 'I apologize, but I cannot provide an analysis at this time.';
    } catch (error) {
      console.error('Error getting AI chat response:', error);
      return 'I apologize, but I encountered an error while analyzing your question.';
    }
  }
}