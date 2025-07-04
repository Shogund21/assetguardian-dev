import { supabase } from "@/integrations/supabase/client";

interface UserActivity {
  activityType: string;
  pageRoute?: string;
  featureName?: string;
  componentName?: string;
  actionDetails?: Record<string, any>;
}

interface PerformanceMetric {
  metricType: string;
  pageRoute?: string;
  loadTimeMs?: number;
  apiEndpoint?: string;
  responseTimeMs?: number;
  errorOccurred?: boolean;
  errorMessage?: string;
}

export class UserMetricsService {
  private static sessionId: string | null = null;
  private static activityCount = 0;
  private static pagesVisited = new Set<string>();

  static async startSession(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.sessionId = sessionId;
      this.activityCount = 0;
      this.pagesVisited.clear();

      const { data, error } = await supabase.rpc('start_user_session', {
        p_user_id: user.id,
        p_session_id: sessionId,
        p_ip_address: null, // Could be enhanced to get real IP
        p_user_agent: navigator.userAgent
      });

      if (error) {
        console.error('Failed to start session:', error);
        return null;
      }

      return sessionId;
    } catch (error) {
      console.error('Session start error:', error);
      return null;
    }
  }

  static async endSession(): Promise<void> {
    if (!this.sessionId) return;

    try {
      await supabase.rpc('end_user_session', {
        p_session_id: this.sessionId,
        p_pages_visited: this.pagesVisited.size,
        p_actions_count: this.activityCount
      });

      this.sessionId = null;
      this.activityCount = 0;
      this.pagesVisited.clear();
    } catch (error) {
      console.error('Session end error:', error);
    }
  }

  static async logActivity(activity: UserActivity): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !this.sessionId) return null;

      if (activity.pageRoute) {
        this.pagesVisited.add(activity.pageRoute);
      }
      this.activityCount++;

      const { data, error } = await supabase.rpc('log_user_activity', {
        p_user_id: user.id,
        p_session_id: this.sessionId,
        p_activity_type: activity.activityType,
        p_page_route: activity.pageRoute,
        p_feature_name: activity.featureName,
        p_component_name: activity.componentName,
        p_action_details: activity.actionDetails ? JSON.stringify(activity.actionDetails) : null
      });

      if (error) {
        console.error('Failed to log activity:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Activity logging error:', error);
      return null;
    }
  }

  static async logPerformanceMetric(metric: PerformanceMetric): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !this.sessionId) return null;

      const { data, error } = await supabase.rpc('log_performance_metric', {
        p_user_id: user.id,
        p_session_id: this.sessionId,
        p_metric_type: metric.metricType,
        p_page_route: metric.pageRoute,
        p_load_time_ms: metric.loadTimeMs,
        p_api_endpoint: metric.apiEndpoint,
        p_response_time_ms: metric.responseTimeMs,
        p_error_occurred: metric.errorOccurred || false,
        p_error_message: metric.errorMessage
      });

      if (error) {
        console.error('Failed to log performance metric:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Performance metric logging error:', error);
      return null;
    }
  }

  static logPageView(route: string, featureName?: string): void {
    this.logActivity({
      activityType: 'page_view',
      pageRoute: route,
      featureName,
      actionDetails: {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      }
    });
  }

  static logButtonClick(componentName: string, actionDetails?: Record<string, any>): void {
    this.logActivity({
      activityType: 'button_click',
      componentName,
      actionDetails: {
        ...actionDetails,
        timestamp: new Date().toISOString()
      }
    });
  }

  static logFormSubmit(featureName: string, actionDetails?: Record<string, any>): void {
    this.logActivity({
      activityType: 'form_submit',
      featureName,
      actionDetails: {
        ...actionDetails,
        timestamp: new Date().toISOString()
      }
    });
  }

  static logFeatureAccess(featureName: string, route: string, actionDetails?: Record<string, any>): void {
    this.logActivity({
      activityType: 'feature_access',
      pageRoute: route,
      featureName,
      actionDetails: {
        ...actionDetails,
        timestamp: new Date().toISOString()
      }
    });
  }

  static logPageLoadTime(route: string, loadTimeMs: number): void {
    this.logPerformanceMetric({
      metricType: 'page_load',
      pageRoute: route,
      loadTimeMs
    });
  }

  static logApiResponse(endpoint: string, responseTimeMs: number, errorOccurred = false, errorMessage?: string): void {
    this.logPerformanceMetric({
      metricType: 'api_response',
      apiEndpoint: endpoint,
      responseTimeMs,
      errorOccurred,
      errorMessage
    });
  }

  static async getUserSessions(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      return [];
    }
  }

  static async getUserActivities(limit = 50) {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .order('timestamp_utc', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user activities:', error);
      return [];
    }
  }

  static async getPerformanceMetrics(limit = 50) {
    try {
      const { data, error } = await supabase
        .from('performance_metrics')
        .select('*')
        .order('timestamp_utc', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      return [];
    }
  }
}