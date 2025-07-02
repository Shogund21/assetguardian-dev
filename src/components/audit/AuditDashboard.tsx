import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, Download, Filter, RefreshCw, Shield, User, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { AuditService } from '@/services/auditService';
import { useToast } from '@/hooks/use-toast';

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  old_values: any;
  new_values: any;
  reason: string | null;
  metadata: any;
  created_at: string;
}

interface AuditFilters {
  startDate?: Date;
  endDate?: Date;
  tableName?: string;
  action?: string;
  userId?: string;
  limit: number;
}

export const AuditDashboard = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<AuditFilters>({ limit: 50 });
  const [stats, setStats] = useState({
    totalLogs: 0,
    uniqueUsers: 0,
    todayLogs: 0,
    failedLogins: 0
  });
  const { toast } = useToast();

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const filterParams = {
        startDate: filters.startDate?.toISOString(),
        endDate: filters.endDate?.toISOString(),
        tableName: filters.tableName,
        action: filters.action === "all" ? undefined : filters.action,
        userId: filters.userId,
        limit: filters.limit
      };

      const logs = await AuditService.getAuditLogs(filterParams);
      setAuditLogs(logs || []);
      
      // Calculate stats
      const today = new Date().toDateString();
      const todayLogs = logs?.filter(log => 
        new Date(log.created_at).toDateString() === today
      ).length || 0;
      
      const uniqueUsers = new Set(logs?.map(log => log.user_id).filter(Boolean)).size;
      const failedLogins = logs?.filter(log => log.action === 'LOGIN_FAILED').length || 0;

      setStats({
        totalLogs: logs?.length || 0,
        uniqueUsers,
        todayLogs,
        failedLogins
      });
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch audit logs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const exportAuditLogs = () => {
    const csvContent = [
      ['Timestamp', 'User ID', 'Action', 'Table', 'Record ID', 'Reason', 'Details'].join(','),
      ...auditLogs.map(log => [
        log.created_at,
        log.user_id || 'System',
        log.action,
        log.table_name,
        log.record_id || '',
        log.reason || '',
        JSON.stringify(log.metadata || {})
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'LOGIN_SUCCESS': return 'default';
      case 'LOGIN_FAILED': return 'destructive';
      case 'LOGOUT': return 'secondary';
      case 'CREATE': return 'default';
      case 'UPDATE': return 'outline';
      case 'DELETE': return 'destructive';
      case 'FEATURE_ACCESS': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Logs</p>
                <p className="text-2xl font-bold">{stats.totalLogs}</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{stats.uniqueUsers}</p>
              </div>
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Activity</p>
                <p className="text-2xl font-bold">{stats.todayLogs}</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed Logins</p>
                <p className="text-2xl font-bold text-destructive">{stats.failedLogins}</p>
              </div>
              <Shield className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Audit Log Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.startDate ? format(filters.startDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.startDate}
                    onSelect={(date) => setFilters(prev => ({ ...prev, startDate: date }))}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.endDate ? format(filters.endDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.endDate}
                    onSelect={(date) => setFilters(prev => ({ ...prev, endDate: date }))}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Action Type</label>
              <Select value={filters.action} onValueChange={(value) => setFilters(prev => ({ ...prev, action: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  <SelectItem value="LOGIN_SUCCESS">Login Success</SelectItem>
                  <SelectItem value="LOGIN_FAILED">Login Failed</SelectItem>
                  <SelectItem value="LOGOUT">Logout</SelectItem>
                  <SelectItem value="CREATE">Create</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                  <SelectItem value="FEATURE_ACCESS">Feature Access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Table</label>
              <Input
                placeholder="Table name"
                value={filters.tableName || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, tableName: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={fetchAuditLogs} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Apply Filters'}
            </Button>
            <Button variant="outline" onClick={exportAuditLogs}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auditLogs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={getActionBadgeVariant(log.action)}>
                      {log.action}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {log.table_name}
                    </span>
                    {log.record_id && (
                      <span className="text-xs text-muted-foreground">
                        ID: {log.record_id.slice(0, 8)}...
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(log.created_at), 'PPpp')}
                  </span>
                </div>
                
                {log.reason && (
                  <p className="text-sm">
                    <strong>Reason:</strong> {log.reason}
                  </p>
                )}
                
                {log.metadata && (
                  <div className="text-xs text-muted-foreground">
                    <strong>Metadata:</strong> {JSON.stringify(log.metadata, null, 2)}
                  </div>
                )}
                
                <Separator />
                
                <div className="text-xs text-muted-foreground">
                  User: {log.user_id || 'System'} | 
                  Timestamp: {log.created_at}
                </div>
              </div>
            ))}
            
            {auditLogs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No audit logs found matching the current filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};