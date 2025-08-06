import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, AlertTriangle, DollarSign, MessageSquare } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface AnalyticsEvent {
  id: string;
  identifier: string;
  identifier_type: string;
  event_type: string;
  session_id: string;
  messages_count: number;
  tokens_used: number;
  cost_usd: number;
  limit_type?: string;
  had_override: boolean;
  metadata?: any;
  created_at: string;
}

interface AnalyticsStats {
  totalEvents: number;
  totalCost: number;
  totalTokens: number;
  limitHits: number;
  overrideUsage: number;
}

const RateLimitAnalytics = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [eventType, setEventType] = useState("all");

  const getDateRange = () => {
    const now = new Date();
    switch (timeRange) {
      case "1d": return { start: startOfDay(now), end: endOfDay(now) };
      case "7d": return { start: subDays(now, 7), end: now };
      case "30d": return { start: subDays(now, 30), end: now };
      default: return { start: subDays(now, 7), end: now };
    }
  };

  const { data: analytics, isLoading, refetch } = useQuery({
    queryKey: ["rate-limit-analytics", timeRange, eventType],
    queryFn: async () => {
      const { start, end } = getDateRange();
      
      let query = supabase
        .from("chat_rate_limit_analytics")
        .select("*")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .order("created_at", { ascending: false })
        .limit(1000);

      if (eventType !== "all") {
        query = query.eq("event_type", eventType);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as AnalyticsEvent[];
    }
  });

  const stats: AnalyticsStats = React.useMemo(() => {
    if (!analytics) return {
      totalEvents: 0,
      totalCost: 0,
      totalTokens: 0,
      limitHits: 0,
      overrideUsage: 0
    };

    return {
      totalEvents: analytics.length,
      totalCost: analytics.reduce((sum, event) => sum + (event.cost_usd || 0), 0),
      totalTokens: analytics.reduce((sum, event) => sum + (event.tokens_used || 0), 0),
      limitHits: analytics.filter(event => event.event_type === "limit_hit").length,
      overrideUsage: analytics.filter(event => event.had_override).length
    };
  }, [analytics]);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "message_sent": return "bg-green-100 text-green-800";
      case "limit_hit": return "bg-red-100 text-red-800";
      case "throttled": return "bg-yellow-100 text-yellow-800";
      case "error": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getIdentifierTypeColor = (type: string) => {
    switch (type) {
      case "ip": return "bg-orange-100 text-orange-800";
      case "user": return "bg-cyan-100 text-cyan-800";
      case "session": return "bg-pink-100 text-pink-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Rate Limit Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Monitor usage patterns, costs, and rate limiting events
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={eventType} onValueChange={setEventType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="message_sent">Messages</SelectItem>
              <SelectItem value="limit_hit">Limit Hits</SelectItem>
              <SelectItem value="throttled">Throttled</SelectItem>
              <SelectItem value="error">Errors</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Rate limiting events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalCost.toFixed(4)}</div>
            <p className="text-xs text-muted-foreground">
              API costs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Limit Hits</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.limitHits}</div>
            <p className="text-xs text-muted-foreground">
              Rate limits triggered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Override Usage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overrideUsage}</div>
            <p className="text-xs text-muted-foreground">
              Events with overrides
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
          <CardDescription>
            Latest rate limiting events and analytics data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading analytics...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Identifier</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Messages</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Override</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics?.slice(0, 50).map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="text-sm">
                      {format(new Date(event.created_at), "MMM d, HH:mm")}
                    </TableCell>
                    <TableCell className="font-mono text-xs max-w-32 truncate">
                      {event.identifier}
                    </TableCell>
                    <TableCell>
                      <Badge className={getIdentifierTypeColor(event.identifier_type)}>
                        {event.identifier_type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getEventTypeColor(event.event_type)}>
                        {event.event_type.replace("_", " ")}
                      </Badge>
                      {event.limit_type && (
                        <div className="text-xs text-muted-foreground">
                          {event.limit_type}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{event.messages_count}</TableCell>
                    <TableCell>{event.tokens_used || 0}</TableCell>
                    <TableCell>${(event.cost_usd || 0).toFixed(4)}</TableCell>
                    <TableCell>
                      {event.had_override ? (
                        <Badge className="bg-blue-100 text-blue-800">Yes</Badge>
                      ) : (
                        <span className="text-muted-foreground">No</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {!analytics?.length && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No analytics data found for the selected filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RateLimitAnalytics;