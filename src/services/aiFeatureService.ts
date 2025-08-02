import { supabase } from "@/integrations/supabase/client";

export interface AIFeaturePermission {
  id: string;
  user_id: string;
  user_email: string;
  feature_name: string;
  enabled_at: string;
  enabled_by: string;
}

export interface AIAccessRequest {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  feature_name: string;
  justification: string;
  status: 'pending' | 'approved' | 'denied';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  review_notes?: string;
}

export interface AIUsageRecord {
  id: string;
  user_id: string;
  user_email: string;
  feature_name: string;
  operation_type: string;
  equipment_id?: string;
  ai_provider: string;
  api_calls_count: number;
  tokens_input: number;
  tokens_output: number;
  estimated_cost_usd: number;
  response_time_ms: number;
  success: boolean;
  confidence_score?: number;
  created_at: string;
}

export class AIFeatureService {
  static async checkFeatureAccess(userId: string, userEmail: string, featureName: string = 'dual_ai_energy'): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('ai_feature_permissions' as any)
        .select('id')
        .eq('user_id', userId)
        .eq('feature_name', featureName)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking feature access:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking AI feature access:', error);
      return false;
    }
  }

  static async requestAccess(
    userId: string,
    userEmail: string,
    userName: string,
    justification: string,
    featureName: string = 'dual_ai_energy'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if user already has a pending request
      const { data: existingRequest } = await supabase
        .from('ai_access_requests' as any)
        .select('id, status')
        .eq('user_id', userId)
        .eq('feature_name', featureName)
        .eq('status', 'pending')
        .single();

      if (existingRequest) {
        return { success: false, error: 'You already have a pending access request.' };
      }

      const { error } = await supabase
        .from('ai_access_requests' as any)
        .insert([{
          user_id: userId,
          user_email: userEmail,
          user_name: userName,
          feature_name: featureName,
          justification,
          status: 'pending'
        }]);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Error requesting AI access:', error);
      return { success: false, error: 'Failed to submit access request.' };
    }
  }

  static async getUserAccessRequests(userId: string): Promise<AIAccessRequest[]> {
    try {
      const { data, error } = await supabase
        .from('ai_access_requests' as any)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as any) || [];
    } catch (error) {
      console.error('Error fetching user access requests:', error);
      return [];
    }
  }

  static async getAllAccessRequests(): Promise<AIAccessRequest[]> {
    try {
      const { data, error } = await supabase
        .from('ai_access_requests' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as any) || [];
    } catch (error) {
      console.error('Error fetching all access requests:', error);
      return [];
    }
  }

  static async approveAccessRequest(
    requestId: string,
    reviewerId: string,
    reviewNotes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get the request details
      const { data: request, error: fetchError } = await supabase
        .from('ai_access_requests' as any)
        .select('*')
        .eq('id', requestId)
        .single();

      if (fetchError || !request) {
        return { success: false, error: 'Request not found.' };
      }

      // Update request status
      const { error: updateError } = await supabase
        .from('ai_access_requests' as any)
        .update({
          status: 'approved',
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Grant permission
      const { error: permissionError } = await supabase
        .from('ai_feature_permissions' as any)
        .insert([{
          user_id: (request as any).user_id,
          user_email: (request as any).user_email,
          feature_name: (request as any).feature_name,
          enabled_by: reviewerId
        }]);

      if (permissionError) throw permissionError;

      return { success: true };
    } catch (error) {
      console.error('Error approving access request:', error);
      return { success: false, error: 'Failed to approve request.' };
    }
  }

  static async denyAccessRequest(
    requestId: string,
    reviewerId: string,
    reviewNotes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('ai_access_requests' as any)
        .update({
          status: 'denied',
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes
        })
        .eq('id', requestId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error denying access request:', error);
      return { success: false, error: 'Failed to deny request.' };
    }
  }

  static async trackUsage(
    userId: string,
    userEmail: string,
    operationType: string,
    aiProvider: string,
    apiCallsCount: number = 1,
    tokensInput: number = 0,
    tokensOutput: number = 0,
    estimatedCostUsd: number = 0,
    responseTimeMs: number = 0,
    success: boolean = true,
    equipmentId?: string,
    confidenceScore?: number,
    featureName: string = 'dual_ai_energy'
  ): Promise<void> {
    try {
      await supabase
        .from('ai_usage_tracking' as any)
        .insert([{
          user_id: userId,
          user_email: userEmail,
          feature_name: featureName,
          operation_type: operationType,
          equipment_id: equipmentId,
          ai_provider: aiProvider,
          api_calls_count: apiCallsCount,
          tokens_input: tokensInput,
          tokens_output: tokensOutput,
          estimated_cost_usd: estimatedCostUsd,
          response_time_ms: responseTimeMs,
          success,
          confidence_score: confidenceScore
        }]);
    } catch (error) {
      console.error('Error tracking AI usage:', error);
      // Don't throw - tracking failures shouldn't break the main functionality
    }
  }

  static async getUserUsageStats(userId: string): Promise<{
    totalCalls: number;
    totalCost: number;
    successRate: number;
    avgResponseTime: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('ai_usage_tracking' as any)
        .select('api_calls_count, estimated_cost_usd, response_time_ms, success')
        .eq('user_id', userId);

      if (error) throw error;

      if (!data || data.length === 0) {
        return { totalCalls: 0, totalCost: 0, successRate: 0, avgResponseTime: 0 };
      }

      const totalCalls = data.reduce((sum, record) => sum + (record as any).api_calls_count, 0);
      const totalCost = data.reduce((sum, record) => sum + (record as any).estimated_cost_usd, 0);
      const successfulCalls = data.filter(record => (record as any).success).length;
      const successRate = (successfulCalls / data.length) * 100;
      const avgResponseTime = data.reduce((sum, record) => sum + (record as any).response_time_ms, 0) / data.length;

      return {
        totalCalls,
        totalCost,
        successRate,
        avgResponseTime: Math.round(avgResponseTime)
      };
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      return { totalCalls: 0, totalCost: 0, successRate: 0, avgResponseTime: 0 };
    }
  }

  static async getAllUsageStats(): Promise<AIUsageRecord[]> {
    try {
      const { data, error } = await supabase
        .from('ai_usage_tracking' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return (data as any) || [];
    } catch (error) {
      console.error('Error fetching all usage stats:', error);
      return [];
    }
  }
}