
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface LivePoint {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  status: 'normal' | 'warning' | 'critical';
  threshold_warning?: number;
  threshold_critical?: number;
}

export interface DiagnosticSession {
  id: string;
  equipment_id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  resolved: boolean;
}

export interface DiagnosticMessage {
  id: string;
  session_id: string;
  sender: 'tech' | 'llm';
  body: {
    text?: string;
    data?: any;
    type?: 'text' | 'analysis' | 'recommendation';
  };
  created_at: string;
}

export class RealtimeHvacDiagnosticService {
  private static livePointsChannel: RealtimeChannel | null = null;
  private static activeSessionId: string | null = null;

  /**
   * Start monitoring live points for equipment
   */
  static async startLiveMonitoring(
    equipmentId: string, 
    onUpdate: (points: Record<string, LivePoint>) => void
  ): Promise<void> {
    console.log('Starting live monitoring for equipment:', equipmentId);
    
    // Stop any existing monitoring
    this.stopLiveMonitoring();
    
    // Get initial live points
    const { data: initialData } = await supabase
      .from('equipment_live_points')
      .select('*')
      .eq('equipment_id', equipmentId)
      .single();

    if (initialData?.points) {
      onUpdate(initialData.points);
    }

    // Subscribe to real-time updates
    this.livePointsChannel = supabase
      .channel('equipment-live-points')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'equipment_live_points',
          filter: `equipment_id=eq.${equipmentId}`
        },
        (payload) => {
          console.log('Live points update received:', payload);
          if (payload.new && payload.new.points) {
            onUpdate(payload.new.points);
          }
        }
      )
      .subscribe();
  }

  /**
   * Stop monitoring live points
   */
  static stopLiveMonitoring(): void {
    if (this.livePointsChannel) {
      supabase.removeChannel(this.livePointsChannel);
      this.livePointsChannel = null;
    }
  }

  /**
   * Update live points for equipment (typically called by data collection systems)
   */
  static async updateLivePoints(equipmentId: string, points: Record<string, LivePoint>): Promise<void> {
    const { error } = await supabase
      .from('equipment_live_points')
      .upsert({
        equipment_id: equipmentId,
        points,
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'equipment_id'
      });

    if (error) {
      console.error('Error updating live points:', error);
      throw error;
    }
  }

  /**
   * Start a new diagnostic session
   */
  static async startDiagnosticSession(equipmentId: string): Promise<DiagnosticSession> {
    const { data, error } = await supabase
      .from('hvac_diag_sessions')
      .insert({
        equipment_id: equipmentId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error starting diagnostic session:', error);
      throw error;
    }

    this.activeSessionId = data.id;
    return data;
  }

  /**
   * End diagnostic session
   */
  static async endDiagnosticSession(sessionId: string, resolved: boolean = false): Promise<void> {
    const { error } = await supabase
      .from('hvac_diag_sessions')
      .update({
        ended_at: new Date().toISOString(),
        resolved
      })
      .eq('id', sessionId);

    if (error) {
      console.error('Error ending diagnostic session:', error);
      throw error;
    }

    if (this.activeSessionId === sessionId) {
      this.activeSessionId = null;
    }
  }

  /**
   * Send a message in diagnostic session
   */
  static async sendMessage(
    sessionId: string, 
    sender: 'tech' | 'llm', 
    body: DiagnosticMessage['body']
  ): Promise<DiagnosticMessage> {
    const { data, error } = await supabase
      .from('hvac_diag_messages')
      .insert({
        session_id: sessionId,
        sender,
        body
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get messages for a session
   */
  static async getSessionMessages(sessionId: string): Promise<DiagnosticMessage[]> {
    const { data, error } = await supabase
      .from('hvac_diag_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get active sessions for equipment
   */
  static async getActiveSessions(equipmentId?: string): Promise<DiagnosticSession[]> {
    let query = supabase
      .from('hvac_diag_sessions')
      .select('*')
      .is('ended_at', null)
      .order('started_at', { ascending: false });

    if (equipmentId) {
      query = query.eq('equipment_id', equipmentId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching active sessions:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Analyze current live points using AI
   */
  static async analyzeCurrentState(
    equipmentId: string, 
    sessionId: string
  ): Promise<DiagnosticMessage> {
    // Get current live points
    const { data: liveData } = await supabase
      .from('equipment_live_points')
      .select('*')
      .eq('equipment_id', equipmentId)
      .single();

    // Get equipment details
    const { data: equipment } = await supabase
      .from('equipment')
      .select('*')
      .eq('id', equipmentId)
      .single();

    // Get recent sensor readings for context
    const { data: recentReadings } = await supabase
      .from('sensor_readings')
      .select('*')
      .eq('equipment_id', equipmentId)
      .gte('timestamp_utc', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp_utc', { ascending: false })
      .limit(50);

    // Call AI analysis edge function
    const { data: analysis, error } = await supabase.functions.invoke(
      'realtime-hvac-analysis',
      {
        body: {
          equipment,
          livePoints: liveData?.points || {},
          recentReadings: recentReadings || [],
          sessionId
        }
      }
    );

    if (error) {
      console.error('Error calling AI analysis:', error);
      throw error;
    }

    // Send AI response as message
    return await this.sendMessage(sessionId, 'llm', {
      text: analysis.summary,
      data: analysis,
      type: 'analysis'
    });
  }

  /**
   * Generate demo live data for testing
   */
  static async generateDemoLiveData(equipmentId: string): Promise<void> {
    const demoPoints: Record<string, LivePoint> = {
      temperature_supply: {
        name: 'Supply Air Temperature',
        value: 55 + Math.random() * 10,
        unit: '°F',
        timestamp: new Date().toISOString(),
        status: 'normal',
        threshold_warning: 70,
        threshold_critical: 75
      },
      temperature_return: {
        name: 'Return Air Temperature',
        value: 72 + Math.random() * 8,
        unit: '°F',
        timestamp: new Date().toISOString(),
        status: 'normal',
        threshold_warning: 85,
        threshold_critical: 90
      },
      pressure_suction: {
        name: 'Suction Pressure',
        value: 65 + Math.random() * 15,
        unit: 'PSI',
        timestamp: new Date().toISOString(),
        status: Math.random() > 0.8 ? 'warning' : 'normal',
        threshold_warning: 75,
        threshold_critical: 85
      },
      pressure_discharge: {
        name: 'Discharge Pressure',
        value: 275 + Math.random() * 25,
        unit: 'PSI',
        timestamp: new Date().toISOString(),
        status: 'normal',
        threshold_warning: 320,
        threshold_critical: 350
      },
      current_compressor: {
        name: 'Compressor Current',
        value: 18 + Math.random() * 4,
        unit: 'A',
        timestamp: new Date().toISOString(),
        status: Math.random() > 0.9 ? 'warning' : 'normal',
        threshold_warning: 25,
        threshold_critical: 30
      },
      vibration_level: {
        name: 'Vibration Level',
        value: 0.3 + Math.random() * 0.4,
        unit: 'mm/s',
        timestamp: new Date().toISOString(),
        status: 'normal',
        threshold_warning: 0.8,
        threshold_critical: 1.2
      }
    };

    await this.updateLivePoints(equipmentId, demoPoints);
  }
}
