import { supabase } from "@/integrations/supabase/client";

interface AuditLogEntry {
  action: string;
  tableName: string;
  recordId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  reason?: string;
  metadata?: Record<string, any>;
}

export class AuditService {
  static async logEvent({
    action,
    tableName,
    recordId,
    oldValues,
    newValues,
    reason,
    metadata
  }: AuditLogEntry): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('log_audit_event', {
        p_action: action,
        p_table_name: tableName,
        p_record_id: recordId || null,
        p_old_values: oldValues ? JSON.stringify(oldValues) : null,
        p_new_values: newValues ? JSON.stringify(newValues) : null,
        p_reason: reason || null,
        p_metadata: metadata ? JSON.stringify(metadata) : null
      });

      if (error) {
        console.error('Audit logging failed:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Audit logging error:', error);
      return null;
    }
  }

  // Specific audit methods for common operations
  static async logCreate(tableName: string, recordId: string, data: Record<string, any>, reason?: string) {
    return this.logEvent({
      action: 'CREATE',
      tableName,
      recordId,
      newValues: data,
      reason
    });
  }

  static async logUpdate(tableName: string, recordId: string, oldData: Record<string, any>, newData: Record<string, any>, reason?: string) {
    return this.logEvent({
      action: 'UPDATE',
      tableName,
      recordId,
      oldValues: oldData,
      newValues: newData,
      reason
    });
  }

  static async logDelete(tableName: string, recordId: string, data: Record<string, any>, reason: string) {
    return this.logEvent({
      action: 'DELETE',
      tableName,
      recordId,
      oldValues: data,
      reason
    });
  }

  static async logLogin(success: boolean, metadata?: Record<string, any>) {
    return this.logEvent({
      action: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
      tableName: 'auth.users',
      metadata
    });
  }

  static async logLogout() {
    return this.logEvent({
      action: 'LOGOUT',
      tableName: 'auth.users'
    });
  }

  static async logAIAnalysis(equipmentId: string, analysisType: string, metadata: Record<string, any>) {
    return this.logEvent({
      action: 'AI_ANALYSIS',
      tableName: 'predictive_alerts',
      recordId: equipmentId,
      metadata: {
        analysisType,
        ...metadata
      }
    });
  }

  // Get audit logs for admin dashboard
  static async getAuditLogs(filters?: {
    startDate?: string;
    endDate?: string;
    tableName?: string;
    action?: string;
    userId?: string;
    limit?: number;
  }) {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    if (filters?.tableName) {
      query = query.eq('table_name', filters.tableName);
    }

    if (filters?.action) {
      query = query.eq('action', filters.action);
    }

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }

    return data;
  }
}