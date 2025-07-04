import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { UserMetricsService } from '@/services/userMetricsService';
import { useAuth } from '@/hooks/useAuth';
import { Activity, Database, Users, User } from 'lucide-react';

interface UserSession {
  id: string;
  session_id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  pages_visited: number;
  actions_count: number;
  user_agent: string | null;
}

interface UserActivity {
  id: string;
  activity_type: string;
  page_route: string | null;
  feature_name: string | null;
  component_name: string | null;
  timestamp_utc: string;
  action_details: any;
}

interface PerformanceMetric {
  id: string;
  metric_type: string;
  page_route: string | null;
  load_time_ms: number | null;
  api_endpoint: string | null;
  response_time_ms: number | null;
  error_occurred: boolean;
  error_message: string | null;
  timestamp_utc: string;
}

const UserMetricsDashboard = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [sessionsData, activitiesData, metricsData] = await Promise.all([
        UserMetricsService.getUserSessions(20),
        UserMetricsService.getUserActivities(100),
        UserMetricsService.getPerformanceMetrics(50)
      ]);

      setSessions(sessionsData);
      setActivities(activitiesData);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'page_view': return 'bg-blue-100 text-blue-800';
      case 'button_click': return 'bg-green-100 text-green-800';
      case 'form_submit': return 'bg-purple-100 text-purple-800';
      case 'feature_access': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMetricColor = (metric: PerformanceMetric) => {
    if (metric.error_occurred) return 'bg-red-100 text-red-800';
    if (metric.load_time_ms && metric.load_time_ms > 3000) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            User Metrics Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            User Metrics Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{sessions.length}</div>
              <div className="text-sm text-muted-foreground">Total Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{activities.length}</div>
              <div className="text-sm text-muted-foreground">User Activities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.round(sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / 60)}m
              </div>
              <div className="text-sm text-muted-foreground">Total Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.round(metrics.filter(m => m.load_time_ms).reduce((acc, m) => acc + (m.load_time_ms || 0), 0) / metrics.filter(m => m.load_time_ms).length) || 0}ms
              </div>
              <div className="text-sm text-muted-foreground">Avg Load Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sessions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activities
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Session {session.session_id.slice(-8)}</div>
                      <div className="text-sm text-muted-foreground">
                        Started: {new Date(session.started_at).toLocaleString()}
                      </div>
                      {session.ended_at && (
                        <div className="text-sm text-muted-foreground">
                          Ended: {new Date(session.ended_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        Duration: {formatDuration(session.duration_seconds)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {session.pages_visited} pages • {session.actions_count} actions
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Badge className={getActivityColor(activity.activity_type)}>
                        {activity.activity_type.replace('_', ' ')}
                      </Badge>
                      <div>
                        <div className="font-medium">
                          {activity.feature_name || activity.component_name || activity.page_route || 'Unknown'}
                        </div>
                        {activity.page_route && (
                          <div className="text-sm text-muted-foreground">{activity.page_route}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(activity.timestamp_utc).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metrics.map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Badge className={getMetricColor(metric)}>
                        {metric.metric_type.replace('_', ' ')}
                      </Badge>
                      <div>
                        <div className="font-medium">
                          {metric.page_route || metric.api_endpoint || 'Unknown'}
                        </div>
                        {metric.error_message && (
                          <div className="text-sm text-red-600">{metric.error_message}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {metric.load_time_ms && `${metric.load_time_ms}ms`}
                        {metric.response_time_ms && `${metric.response_time_ms}ms`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(metric.timestamp_utc).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserMetricsDashboard;